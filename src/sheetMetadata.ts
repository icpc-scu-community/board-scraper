// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { DUPLICATE_ID_CODE } from './ContestParser';
import { Sheet } from './models';
import { openMongooseConnection } from './database/mongoose';
import { crawl } from './utils/crawler';
import Logger from './utils/logger';

const MONGO_URL = process.env['MONGO_URL'] || 'mongodb://localhost/newcomers-board';
const CHAR_CODE = 'A'.charCodeAt(0);

interface IContest {
  id: string;
  name: string;
  problems: {
    id: string;
    name: string;
  }[];
}

(async () => {
  await openMongooseConnection(MONGO_URL);
  const url = 'https://codeforces.com/group/MWSDmqGsZm/contests';
  Logger.log('contests', `Parsing contests page [${url}]`);
  const $ = await crawl(url);
  Logger.success('contests');
  const contests_names = $('[data-contestid]')
    .children('td')
    .map((_, el) => $(el).text().split('\n'))
    .get()
    .filter((el: string) => el.startsWith('Sheet'));

  const contests_ids = $('[data-contestid]')
    .map((_, el) => $(el).attr('data-contestid'))
    .get();

  const sheets: IContest[] = await Promise.all(
    contests_names.map(async (value, index) => ({
      name: value,
      id: contests_ids[index],
      problems: await parseProblems(contests_ids[index]),
    })),
  );

  // write data to file
  // fs.writeFileSync('sheets.json', JSON.stringify(sheets));
  try {
    Logger.log('DB', 'Inserting documents into DB');
    await Sheet.insertMany(sheets, { ordered: false });
  } catch (err) {
    if (err.code != DUPLICATE_ID_CODE) console.error(err);
  }
  Logger.success('DB');
  console.log('[ 💛 ] Bye!');
  process.exit(0);
})();

async function parseProblems(contest_id: string) {
  Logger.log(contest_id, `Parsing problems in contest #${contest_id}`);
  const $ = await crawl(`https://codeforces.com/group/MWSDmqGsZm/contest/${contest_id}`);
  const problems = $('.problems')
    .find('td:nth-child(2)')
    .find('a')
    .map((index, el) => ({ name: $(el).text(), id: String.fromCharCode(CHAR_CODE + index) }))
    .get();
  Logger.success(contest_id);
  return problems;
}
