import puppeteer from "puppeteer";
import mongoose from "mongoose";
import { contests } from "./data.json";
import { ContestParser } from './ContestParser';
import { Scraper } from "./models.js";

mongoose
  .connect("mongodb://localhost/newcomers", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .catch(function (err) {
    if (err) console.log(err);
  });


(async () => {
  const browser = await puppeteer.launch({ headless: true, timeout: 0 });

  console.log(`[] Scraper Started @${new Date()}`);
  console.log(`[] Parsing ${contests.length} contest(s)`);

  for (let i = 0; i < contests.length; i++) {
    const contestParser = new ContestParser(contests[i], browser);
    await contestParser.parseAll();
  }

  await browser.close();
  
  const scraper = new Scraper();
  await scraper.save();

  console.log(`[] Scraper Finished @${new Date()}`);
})();
