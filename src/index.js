const puppeteer = require('puppeteer');

const contests = [
  {
    id: '219158',
    url: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158',
    latestScrappedPage: 1
  }
];

(async () => {
  const browser = await puppeteer.launch({ headless: false, timeout: 0 });
  const page = await browser.newPage();

  for (let i = 0; i < contests.length; i++) {
    const contest = contests[i];

    await page.goto(
      'https://codeforces.com/group/MWSDmqGsZm/contest/219158/status/page/1?order=BY_ARRIVED_ASC',
      { waitUntil: 'domcontentloaded' }
    );

    try {
      const output = await page.evaluate(() => {
        const rows = document.querySelectorAll(
          '.status-frame-datatable > tbody tr:not(:first-of-type)'
        );
        const output = [];
        rows.forEach(row => {
          const columns = row.querySelectorAll('td');
          output.push({
            name: columns[2].innerText,
            problem: columns[3].innerText,
            verdict: columns[5].innerText
          });
        });
        return output;
      });
      console.log(output);
    } catch (error) {
      console.error(error);
    }

    await browser.close();
  }
})();
