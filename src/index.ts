// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import chalk from 'chalk';
import { ContestParser } from './ContestParser';
import { contests } from './data.json';
import { Scraper } from './models';
import { openMongooseConnection } from './database/mongoose-connection';

const MONGO_URL = process.env['MONGO_URL'] || 'mongodb://localhost/newcomers-board';

(async () => {
  await openMongooseConnection(MONGO_URL);

  const startTime = new Date();
  console.log(`[ 🛫 ] Scraper Started ${chalk.yellowBright(startTime.toLocaleTimeString())}`);
  const lastUpdate = (await Scraper.findOne())?.get('lastUpdate');
  const lastUpdatedDate = lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A - First run';
  console.log(`[ 🌀 ] Last Updated ${chalk.yellowBright(lastUpdatedDate)}`);
  console.log(`[ ❗ ] Parsing ${chalk.blueBright(contests.length)} contest(s)`);

  const contestParsers = contests.map((contest) => new ContestParser(contest).parseAll());
  const parsedSubmissions = await Promise.all(contestParsers);
  const totalParsedSubmissions = parsedSubmissions.reduce((acc, current) => acc + current, 0);

  await new Scraper().save();

  const endTime = new Date();
  const takenTime = endTime.getTime() - startTime.getTime();
  console.log(`[ 🛬 ] Scraper Finished ${chalk.yellowBright(endTime.toLocaleTimeString())}`);
  console.log(
    `[ 🕑 ] Took ${chalk.cyanBright(calculateTime(takenTime))} ~ Total added ${chalk.cyan(totalParsedSubmissions)}`,
  );
  process.exit(0);
})();

function calculateTime(distance: number) {
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}
