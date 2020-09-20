import cheerio from 'cheerio';
import got from 'got';
import logSymbols from 'log-symbols';
import { Contest, Submission } from './models';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Spinnies = require('spinnies');
const spinnies = new Spinnies({ succeedPrefix: `[ ${logSymbols.success} ]`, failPrefix: `[ ${logSymbols.error} ]` });

export const DUPLICATE_ID_CODE = 11000;
const SUBMISSION_ATTRIBUTES = ['id', 'date', 'name', 'problem', 'lang', 'verdict', 'time', 'memory'];

/**
 * @returns Cheerio instance to query the html response of the url
 * @param url the url to the page you want to crawl
 */
export async function crawl(url: string): Promise<CheerioStatic> {
  try {
    const response = await got(url);
    return cheerio.load(response.body);
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
}

export class ContestParser {
  private _main_link: string;
  private _new_docs: number;

  constructor(private _codeforces_contest_id: string) {
    this._main_link = this.formulateLink();
    this._new_docs = 0;
  }

  private formulateLink(page_number = 1): string {
    return `https://codeforces.com/group/MWSDmqGsZm/contest/${this._codeforces_contest_id}/status/page/${page_number}?order=BY_ARRIVED_ASC`;
  }

  public async getEndPage(): Promise<number> {
    const $ = await crawl(this._main_link);
    return parseInt($('[pageindex]').last().attr('pageindex') || '1');
  }

  private toSubmission(values: string[]) {
    const submission = { contestId: this._codeforces_contest_id };
    return SUBMISSION_ATTRIBUTES.reduce(
      (o, k, i) => ({
        ...o,
        [k]: values[i],
      }),
      submission,
    );
  }

  /**
   * parses the page and returns whether it has pendening submissions
   */
  private async parsePage(page_number: number): Promise<boolean> {
    const url = this.formulateLink(page_number);
    const $ = await crawl(url);
    const getSubmissions = () => {
      const rows = $('tr[data-submission-id]');
      return rows
        .map((_, row) => {
          const values = $(row)
            .children('td')
            .map((_, cell) => $(cell).text().trim())
            .get();
          return this.toSubmission(values);
        })
        .get();
    };
    let submissions = [];
    const containsPendingSubmissions = !!$('td[waiting=true]').text();
    submissions = containsPendingSubmissions ? [] : getSubmissions();

    try {
      const docs = await Submission.insertMany(submissions, { ordered: false }); // "ordered:false" => don't stop inserting on first error
      this._new_docs += docs.length;
    } catch (err) {
      if (err.code != DUPLICATE_ID_CODE) console.error(err);
      this._new_docs += err.result.result.nInserted;
    }
    return containsPendingSubmissions;
  }

  /**
   * parses all pages in a contest and returns the number of new-added-docs
   */
  async parseAll(): Promise<number> {
    let pageNumber = 1;
    const contest_id = this._codeforces_contest_id;
    const endPage = await this.getEndPage();
    let contest_doc = await Contest.findOne({
      id: contest_id,
    });

    if (contest_doc) {
      pageNumber = contest_doc.get('lastParsedPage');
    } else {
      contest_doc = new Contest({
        id: contest_id,
        endPage,
      });
    }

    spinnies.add(contest_id);
    for (; pageNumber <= endPage; pageNumber++) {
      spinnies.update(contest_id, {
        text: `Parsing contest ${contest_id} on page ${pageNumber}/${endPage} ~ Added (${this._new_docs})`,
      });
      const hasPendingSubmissions = await this.parsePage(pageNumber);
      if (hasPendingSubmissions) {
        spinnies.fail(contest_id, {
          text: `Pausing - pending submissions on contest ${contest_id}! ~ Added ${this._new_docs}`,
        });
        return this._new_docs;
      }
      contest_doc.set('lastParsedPage', pageNumber);
      await contest_doc.save();
    }
    spinnies.succeed(contest_id, {
      text: `Parsed Contest ${contest_id} ~ Added ${this._new_docs}`,
      succeedColor: 'greenBright',
    });
    return this._new_docs;
  }
}
