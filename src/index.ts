import puppeteer from "puppeteer";
import mongoose from "mongoose";
import { contests } from "./data.json";
import { ContestParser } from './ContestParser';
import { Scraper } from "./models";
import logSymbols from 'log-symbols';
import chalk from "chalk";

const MONGO_URL = 'mongodb://localhost/newcomers-board';

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .catch(function (err) {
    if (err) console.log(err);
  });

(async () => {
  console.log(`[ 🚀 ] Launching browser`)
  const browser = await puppeteer.launch({ headless: true, timeout: 0 });

  const startTime = new Date();
  console.log(`[ 🛫 ] Scraper Started ${chalk.yellowBright(startTime.toLocaleTimeString())}`)
  console.log(`[ ${logSymbols.info} ] Parsing ${chalk.blueBright(contests.length)} contest(s)`);

  let totalParsedSubmissions = 0;
  for (let i = 0; i < contests.length; i++) {
    const contestParser = new ContestParser(contests[i], browser);
    totalParsedSubmissions += await contestParser.parseAll();
  }

  await browser.close();

  const scraper = new Scraper();
  await scraper.save();

  const endTime = new Date();
  const takenTime = endTime.getTime() - startTime.getTime();
  console.log(`[ 🛬 ] Scraper Finished ${chalk.yellowBright(endTime.toLocaleTimeString())}`);
  console.log(`[ 🕑 ] Took ${chalk.cyanBright(calculateTime(takenTime))} ~ Total added ${chalk.cyan(totalParsedSubmissions)}`)
  process.exit(0);
})();

function calculateTime(distance: number) {

  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}