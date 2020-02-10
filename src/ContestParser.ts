import { Browser } from "puppeteer";
import { Submission, Contest } from "./models";

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

  private async parsePage(page_number: number) {
    console.log(`\t@page #${page_number}`)
    const page = await this._browser.newPage();
    await page.goto(
      this.formulateLink(page_number),
      { waitUntil: "domcontentloaded" }
    );
    try {
      const submissions = await page.evaluate(() => {
        const rows = document.querySelectorAll(
          ".status-frame-datatable > tbody tr:not(:first-of-type)"
        );
        const attrs = ["id", "date", "name", "problem", "lang", "verdict", "time", "memory",];
        const output: any[] = [];
        rows.forEach(row => {
          const columns = row.querySelectorAll("td");
          const submission: { [key: string]: string } = {};
          for (let i = 0; i < attrs.length; i++) {
            const attr_name = attrs[i];
            submission[attr_name] = columns[i].innerText;
          }
          output.push(submission);
        });
        return output;
      });
      submissions.forEach(async (submission) => {
        submission['contest_id'] = this._codeforces_contest_id;
        const sub = new Submission(submission);
        try {
          await sub.save();
        } catch (err) { console.log(err.errmsg) };
      })

    } catch (error) {
      console.error(error);
    }
    page.close();
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
      await this.parsePage(pageNumber);
      contest_doc.set('lastParsedPage', pageNumber);
      await contest_doc.save();
    }

  }
}

