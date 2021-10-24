import { DuplicateKeyError } from '../database/mongoose';
import { contestsEnvVar } from '../config';
import { Logger } from '../services/logger';
import { crawlSubmissions, crawlSubmissionsTotalPages } from '../services/crawler';
import { ContestType, ContestModel, SubmissionModel } from '../database/models';

export async function parseSubmissions(): Promise<void> {
  const contests: ContestType[] = await ContestModel.find({
    id: { $in: contestsEnvVar.map(({ contestId }) => contestId) },
    groupId: { $in: contestsEnvVar.map(({ groupId }) => groupId) },
  });
  const submissionsParsing = contests.map((contest) => parseContestSubmissions(contest));
  await Promise.all(submissionsParsing);
}

async function parseContestSubmissions(contest: ContestType): Promise<number> {
  const groupId = contest.groupId;
  const contestId = contest.id;

  const contestIdentifer = `${groupId}/${contestId}`;
  const logEvent = `submission-parser:${contestIdentifer}`;
  Logger.log(logEvent, `Parsing submissions of contest "${contestIdentifer}".`);

  // get total pages
  const totalPages = await crawlSubmissionsTotalPages(groupId, contestId);

  // parse page by page
  let newDocsCnt = 0;
  for (let page = contest.lastParsedStatusPage; page <= totalPages; page++) {
    Logger.log(
      logEvent,
      `Parsing submissions of contest "${contestIdentifer}" on page ${page}/${totalPages} ~ Added ${newDocsCnt}.`,
    );

    // crawl the page
    const { containsPendingSubmissions, submissions } = await crawlSubmissions(groupId, contestId, page);
    if (containsPendingSubmissions) {
      Logger.fail(logEvent, `Pausing - pending submissions on contest "${contestIdentifer}"! ~ Added ${newDocsCnt}.`);
      return newDocsCnt;
    }

    // save submissions
    try {
      const docs = await SubmissionModel.insertMany(submissions, { ordered: false });
      newDocsCnt += docs.length;
    } catch (error) {
      // parsing the same page twice may produce a duplicate key error and it should be expected
      if (error instanceof DuplicateKeyError) {
        newDocsCnt += error.nInserted;
      } else {
        Logger.fail(
          logEvent,
          `Pausing - something went wrong on contest "${contestIdentifer}"! ~ Added ${newDocsCnt}.`,
        );
        return newDocsCnt;
      }
    }

    // update last parsed page
    contest.lastParsedStatusPage = page;
    await contest.save();
  }

  Logger.success(logEvent, `Successfuly parsed contest "${contestIdentifer}" ~ Added ${newDocsCnt}.`);
  return newDocsCnt;
}
