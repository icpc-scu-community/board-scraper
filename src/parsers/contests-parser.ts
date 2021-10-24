import { openMongooseConnection, closeMongooseConnection, DuplicateKeyError } from '../database/mongoose';
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
  await saveContests(successfullyParsedContests);
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

async function saveContests(contests: ContestType[]): Promise<void> {
  const logEvent = 'contests-parser:insert-documents';

  if (contests.length === 0) {
    Logger.success(logEvent, `No contests to be saved.`);
    return;
  }

  try {
    await ContestModel.insertMany(contests, { ordered: false });
    Logger.success(logEvent, `Contests has been saved successflly, number of affected documents: ${contests.length}`);
  } catch (error) {
    if (error instanceof DuplicateKeyError) {
      Logger.success(
        logEvent,
        `Some or all of the contests are already saved before, number of affected documents: ${error.nInserted}.`,
      );
    } else {
      Logger.fail(logEvent, `Something went wrong during contests insertion. ${error}`);
    }
  }
}
