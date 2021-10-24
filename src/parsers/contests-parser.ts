import { openMongooseConnection, closeMongooseConnection } from '../database/mongoose';
import { mongoURIEnvVar, contestsEnvVar } from '../config';
import { Logger } from '../services/logger';
import { crawlContest } from '../services/crawler';
import { ContestType, ContestModel } from '../database/models';

(async () => {
  // parse
  const contestsParsing = contestsEnvVar.map(({ groupId, contestId }) => parseContest(groupId, contestId));
  const contestsParsingResults = await Promise.allSettled(contestsParsing);
  const successfullyParsedContests = contestsParsingResults
    .filter((promiseResult) => promiseResult.status === 'fulfilled')
    .map((promiseResult) => (promiseResult as PromiseFulfilledResult<ContestType>).value);

  // save
  await openMongooseConnection(mongoURIEnvVar);
  await ContestModel.insertMany(successfullyParsedContests, { ordered: false });
  await closeMongooseConnection();
})();

async function parseContest(groupId: string, contestId: string): Promise<ContestType> {
  const contestIdentifer = `${groupId}/${contestId}`;
  const logEvent = `contests-parser:${contestIdentifer}`;

  Logger.log(logEvent, `Parsing problems of contest "${contestIdentifer}"`);
  try {
    const { name, problems } = await crawlContest(groupId, contestId);
    Logger.success(logEvent);
    return new ContestModel({ id: contestId, groupId, name, problems });
  } catch (error) {
    Logger.fail(logEvent, `Parsing problems of contest "${contestIdentifer}" has been failed.${error}`);
    throw error;
  }
}
