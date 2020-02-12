import { Browser } from "puppeteer";
import { Submission, Contest } from "./models";
import ora from 'ora';
import chalk from "chalk";

type sub_t = { [key: string]: string };
const DUPLICATE_ID_CODE = 11000;

export class ContestParser {
  private _main_link: string;
  private _new_docs: number;

  constructor(private _codeforces_contest_id: string, private _browser: Browser) {
    this._main_link = this.formulateLink();
    this._new_docs = 0;
  }

  private formulateLink(page_number = 1) {
    return `https://codeforces.com/group/MWSDmqGsZm/contest/${this._codeforces_contest_id}/status/page/${page_number}?order=BY_ARRIVED_ASC`;
  }

  private async getEndPage() {
    const page = await this._browser.newPage();
    await page.goto(this._main_link, {
      waitUntil: "domcontentloaded"
    });
    let lastPage = 1;
    try {
      lastPage = await page.evaluate(() => {
        const contestPages = document.querySelectorAll("[pageindex]");
        return parseInt(contestPages[contestPages.length - 1].getAttribute(
          "pageindex"
        ) || "1");
      });
    } catch (err) {
      console.error(err);
    }
    page.close();
    return lastPage;
  }

  /**
  * parses the page and returns whether it has pendening submissions
  */
  private async parsePage(page_number: number): Promise<boolean> {
    const page = await this._browser.newPage();
    await page.goto(
      this.formulateLink(page_number),
      { waitUntil: "domcontentloaded" }
    );

    let submissions: sub_t[] = [];
    let containsPendingSubmissions = false;
    try {
      ({ submissions, containsPendingSubmissions } = await page.evaluate((contestId) => {
        const SUBMISSIONS_TABLE_SELECTOR = ".status-frame-datatable > tbody tr:not(:first-of-type)";
        const containsPendingSubmissions = !!document.querySelector(`${SUBMISSIONS_TABLE_SELECTOR} > td[waiting=true]`)
        const rows = document.querySelectorAll(SUBMISSIONS_TABLE_SELECTOR);
        const attrs = ["id", "date", "name", "problem", "lang", "verdict", "time", "memory",];

        const submissions = containsPendingSubmissions ? [] : Array.from(rows).map(row => {
          const columns = row.querySelectorAll("td");
          const submission: sub_t = {
            contestId
          };
          for (let i = 0; i < attrs.length; i++) {
            const attr_name = attrs[i];
            submission[attr_name] = columns[i].innerText;
          }
          return submission;
        });
        return { submissions, containsPendingSubmissions }

      }, this._codeforces_contest_id));
    } catch (error) {
      console.error(error);
    }

    page.close();

    try {
      const docs = await Submission.insertMany(submissions, { ordered: false }); // "ordered:false" => don't stop inserting on first error
      this._new_docs += docs.length;
    } catch (err) {
      if (err.code != DUPLICATE_ID_CODE)
        console.log(err)
      this._new_docs += err.result.result.nInserted;
    }
    return containsPendingSubmissions;
  }

  /**
   * parses all pages in a contest and returns the number of new-added-docs
   */
  async parseAll(): Promise<number> {

    let pageNumber = 1
    const endPage = await this.getEndPage();
    let contest_doc = await Contest.findOne({ id: this._codeforces_contest_id });

    if (contest_doc) {
      pageNumber = contest_doc.get("lastParsedPage");

    } else {
      contest_doc = new Contest({
        id: this._codeforces_contest_id,
        endPage,
      });
    }

    const cli = ora({ prefixText: '[' }).start();
    for (; pageNumber <= endPage; pageNumber++) {
      cli.text = `] Parsing contest ${this._codeforces_contest_id} on page ${pageNumber}/${endPage} ~ Added (${this._new_docs})`;
      const hasPendingSubmissions = await this.parsePage(pageNumber);
      if (hasPendingSubmissions) {
        cli.warn(`] Pausing - pending submissions on contest ${this._codeforces_contest_id}! ~ Added ${this._new_docs}`)
        return this._new_docs;
      }
      contest_doc.set('lastParsedPage', pageNumber);
      await contest_doc.save();
    }
    cli.succeed('] ' + chalk.greenBright(`Parsed Contest ${this._codeforces_contest_id} ~ Added ${this._new_docs}`));
    return this._new_docs;
  }
}

