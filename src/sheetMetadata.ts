import { crawl, DUPLICATE_ID_CODE } from './ContestParser';
import { Sheet } from './models';
import { connectToMongo } from './mongoConnect';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Spinnies = require('spinnies');
const spinnies = new Spinnies();

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
  await connectToMongo();
  const url = 'https://codeforces.com/group/MWSDmqGsZm/contests';
  spinnies.add('contests', { text: `Parsing contests page [${url}]` });
  const $ = await crawl(url);
  spinnies.succeed('contests');
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
    spinnies.add('DB', { text: 'Inserting documents into DB' });
    const docs = await Sheet.insertMany(sheets, { ordered: false });
    console.log('inserted', docs.length);
  } catch (err) {
    if (err.code != DUPLICATE_ID_CODE) console.error(err);
  }
  spinnies.succeed('DB');
})();

async function parseProblems(contest_id: string) {
  spinnies.add(contest_id, { text: 'Parsing problems in contest #' + contest_id });
  const $ = await crawl(`https://codeforces.com/group/MWSDmqGsZm/contest/${contest_id}`);
  const problems = $('.problems')
    .find('td:nth-child(2)')
    .find('a')
    .map((index, el) => ({ name: $(el).text(), id: String.fromCharCode(CHAR_CODE + index) }))
    .get();
  spinnies.succeed(contest_id);
  return problems;
}
