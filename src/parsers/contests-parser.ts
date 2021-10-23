import { openMongooseConnection, closeMongooseConnection } from '../database/mongoose';
import { mongoURIEnvVar, contestsEnvVar } from '../config';
import { Logger } from '../services/logger';
import { crawlContest } from '../services/crawler';
import { ContestType, ContestModel } from '../database/models';

(async () => {
  // parse
  const contestsParsing = contestsEnvVar.map(({ contestId, groupId }) => parseContest(contestId, groupId));
  const contests = await Promise.all(contestsParsing);

  // save
  await openMongooseConnection(mongoURIEnvVar);
  await ContestModel.insertMany(contests, { ordered: false });
  await closeMongooseConnection();
})();

async function parseContest(contestId: string, groupId: string): Promise<ContestType> {
  const logEvent = `contests-parser:${groupId}/${contestId}`;
  Logger.log(logEvent, `Parsing problems in group "${groupId}", contest "${contestId}"`);
  const { name, problems } = await crawlContest(groupId, contestId);
  Logger.success(logEvent);

  return new ContestModel({
    id: contestId,
    groupId,
    name,
    problems,
  });
}
