import puppeteer from "puppeteer";
import mongoose from "mongoose";
import { contests } from "./data.json";
import { ContestParser } from './ContestParser';

mongoose
  .connect("mongodb://localhost/newcomers", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .catch(function (err) {
    if (err) console.log(err);
  });

console.log(contests);

(async () => {
  const browser = await puppeteer.launch({ headless: false, timeout: 0 });

  for (let i = 0; i < contests.length; i++) {
    const contestParser = new ContestParser(contests[i].id, browser);
    await contestParser.parseAll();
  }

  await browser.close();
})();
