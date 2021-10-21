import { openMongooseConnection, closeMongooseConnection } from '../database/mongoose';
import { mongoURIEnvVar, contestsEnvVar } from '../config';
import { Logger, crawl, contestPageUrl } from '../utils';
import { Contest } from '../database/models';

(async () => {
  // parse
  const contestsParsing = contestsEnvVar.map(({ contestId, groupId }) => parseContest(contestId, groupId));
  const contests = await Promise.all(contestsParsing);

  // save
  await openMongooseConnection(mongoURIEnvVar);
  await Contest.insertMany(contests, { ordered: false });
  await closeMongooseConnection();
})();

async function parseContest(contestId: string, groupId: string) {
  const logEvent = `${groupId}/${contestId}`;
  Logger.log(logEvent, `Parsing problems in group "${groupId}", contest "${contestId}"`);

  const $ = await crawl(contestPageUrl(contestId, groupId));
  const problems = $('.problems')
    .find('tr:not(:first-child)')
    .map((_, el) => ({
      id: $(el).find('td:nth-child(1) a').text().trim(),
      name: $(el).find('td:nth-child(2) a').text().trim(),
    }))
    .get();
  const name = $('#sidebar div:nth-child(3) a').text().trim();
  Logger.success(logEvent);

  return {
    id: contestId,
    groupId,
    name,
    problems,
  };
}
