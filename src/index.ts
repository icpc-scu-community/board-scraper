import puppeteer, { Browser } from "puppeteer";
import mongoose from "mongoose";
import { contests } from "./data.json";
import { Submission, Contest } from "./models.js";


mongoose
  .connect("mongodb://localhost/newcomers", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(function (err) {
    if (err) console.log(err);
  });
console.log(contests);


function getContestLink(contest_id: string, page = 1) {
  return `https://codeforces.com/group/MWSDmqGsZm/contest/${contest_id}/status/page/${page}?order=BY_ARRIVED_ASC`;
}

async function getContestLastPage(contest_id: string, browser: puppeteer.Browser) {
  const page = await browser.newPage();
  await page.goto(getContestLink(contest_id), {
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

async function parseSubmissionsIn(browser: Browser, contest_id: string, page_number = 1) {

  console.log(`\t[${contest_id}] => page #${page_number}`)
  const page = await browser.newPage();
  await page.goto(
    getContestLink(contest_id, page_number),
    { waitUntil: "domcontentloaded" }
  );
  try {
    const submissions = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        ".status-frame-datatable > tbody tr:not(:first-of-type)"
      );
      const output: any[] = [];
      rows.forEach(row => {
        const columns = row.querySelectorAll("td");
        const attrs = ["id", "date", "name", "problem", "lang", "verdict", "time", "memory",];
        const submission: { [key: string]: string } = {};
        for (let i = 0; i < attrs.length; i++) {
          const attr_name = attrs[i];
          submission[attr_name] = columns[i].innerText;
        }
        output.push(submission);
      });
      return output;
    });
    submissions.forEach(sub_json => {
      const sub = new Submission(sub_json);
      sub.save();
    });
  } catch (error) {
    console.error(error);
  }
  page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: false, timeout: 0 });

  for (let i = 0; i < contests.length; i++) {
    // const contest_doc = await Contest.find({id: contest.id});
    // if(contest && contest.lastParsedPage )
    const contest = contests[i];
    const contest_doc = await Contest.find({ id: contest.id });
    if (contest_doc) {

    } else {

    }
    const lastPage = await getContestLastPage(contest.id, browser);
    console.log(`[] Parsing contest ${contest.id} (has ${lastPage} page(s))`);
    for (let pageNumber = 1; pageNumber <= lastPage; pageNumber++) {
      await parseSubmissionsIn(browser, contest.id, pageNumber);
    }

    // await browser.close();
  }
})();
