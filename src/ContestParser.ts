import { Browser } from "puppeteer";
import { Submission, Contest } from "./models";

type sub_t = { [key: string]: string };

export class ContestParser {
  private _main_link: string;

  constructor(private _codeforces_contest_id: string, private _browser: Browser) {
    this._main_link = this.formulateLink();
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
    console.log(`\t@page #${page_number}`)
    const page = await this._browser.newPage();
    await page.goto(
      this.formulateLink(page_number),
      { waitUntil: "domcontentloaded" }
    );

    let submissions: sub_t[] = [];
    let containsPendingSubmissions = false;
    try {
      ({ submissions, containsPendingSubmissions } = await page.evaluate(() => {
        const SUBMISSIONS_TABLE_SELECTOR = ".status-frame-datatable > tbody tr:not(:first-of-type)";
        const containsPendingSubmissions = !!document.querySelector(`${SUBMISSIONS_TABLE_SELECTOR} > td[waiting=true]`)
        const rows = document.querySelectorAll(SUBMISSIONS_TABLE_SELECTOR);
        const attrs = ["id", "date", "name", "problem", "lang", "verdict", "time", "memory",];

        const submissions = containsPendingSubmissions ? [] : Array.from(rows).map(row => {
          const columns = row.querySelectorAll("td");
          const submission: sub_t = {};
          for (let i = 0; i < attrs.length; i++) {
            const attr_name = attrs[i];
            submission[attr_name] = columns[i].innerText;
          }
          return submission;
        });
        return { submissions, containsPendingSubmissions }

      }));
    } catch (error) {
      console.error(error);
    }


    page.close();
    submissions.forEach(async (submission) => {
      submission['contestId'] = this._codeforces_contest_id;
      const sub = new Submission(submission);
      try {
        await sub.save();
      } catch (err) { console.log(err.errmsg) };
    })
    return containsPendingSubmissions;
  }

  async parseAll() {

    let pageNumber = 1
    const endPage = await this.getEndPage();
    let contest_doc = await Contest.findOne({ id: this._codeforces_contest_id });

    console.log(`[] Parsing contest ${this._codeforces_contest_id} (has ${endPage} page(s))`);

    if (contest_doc) {
      pageNumber = contest_doc.get("lastParsedPage");
      console.log(`\Last parsed page: ${pageNumber}`)
    } else {
      contest_doc = new Contest({
        id: this._codeforces_contest_id,
        endPage,
      });
    }
    console.log(`\tStarting from: ${pageNumber}, to: ${endPage}`);
    for (; pageNumber <= endPage; pageNumber++) {
      const hasPendingSubmissions = await this.parsePage(pageNumber);
      if (hasPendingSubmissions) {
        console.log("\tPausing parsing because of pending submissions!");
        break;
      }
      contest_doc.set('lastParsedPage', pageNumber);
      await contest_doc.save();
    }

  }
}

