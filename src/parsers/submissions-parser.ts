import { openMongooseConnection, closeMongooseConnection, DuplicateKeyError } from '../database/mongoose';
import { mongoURIEnvVar, contestsEnvVar } from '../config';
import { Logger, crawl, statusPageUrl } from '../utils';
import { ContestType, ContestModel, SubmissionModel, SubmissionType } from '../database/models';

(async () => {
  await openMongooseConnection(mongoURIEnvVar);

  const contests: ContestType[] = await ContestModel.find({
    id: { $in: contestsEnvVar.map(({ contestId }) => contestId) },
    groupId: { $in: contestsEnvVar.map(({ groupId }) => groupId) },
  });
  const submissionsParsing = contests.map((contest) => parseContestSubmissions(contest));
  await Promise.all(submissionsParsing);

  await closeMongooseConnection();
})();

async function parseContestSubmissions(contest: ContestType): Promise<number> {
  const contestId = contest.id;
  const groupId = contest.groupId;

  const contestIdentifer = `${groupId}/${contestId}`;
  const logEvent = `submission-parser:${contestIdentifer}`;
  Logger.log(logEvent, `Parsing submissions of contest "${contestIdentifer}"`);

  // get total pages
  const $firstStatusPage = await crawl(statusPageUrl(contestId, groupId));
  const totalPages = parseInt($firstStatusPage('[pageindex]').last().attr('pageindex') || '1');

  // parse page by page
  let newDocsCnt = 0;
  for (let page = contest.lastParsedStatusPage; page <= totalPages; page++) {
    Logger.log(
      logEvent,
      `Parsing submissions of contest "${contestIdentifer}" on page ${page}/${totalPages} ~ Added (${newDocsCnt})`,
    );

    // crawl the page
    const $statusPage = await crawl(statusPageUrl(contestId, groupId, page));

    // check for pending submissions
    const containsPendingSubmissions = !!$statusPage('td[waiting=true]').text();
    if (containsPendingSubmissions) {
      Logger.fail(logEvent, `Pausing - pending submissions on contest "${contestIdentifer}"! ~ Added ${newDocsCnt}`);
      return newDocsCnt;
    }

    // parse submissions
    const submissions: SubmissionType[] = $statusPage('tr[data-submission-id]')
      .map((_, row) => {
        const [id, __, handle, problem, ___, verdict] = $statusPage(row)
          .children('td')
          .map((_, cell) => $statusPage(cell).text().trim())
          .get();
        return { id, handle, problem, verdict, contestId };
      })
      .get();

    // save submissions
    try {
      const docs = await SubmissionModel.insertMany(submissions, { ordered: false });
      newDocsCnt += docs.length;
    } catch (error: unknown) {
      // parsing the same page twice may produce a duplicate key error and it should be expected
      if (error instanceof DuplicateKeyError) {
        newDocsCnt += error.nInserted;
      } else {
        Logger.fail(logEvent, `Pausing - something went wrong on contest "${contestIdentifer}"! ~ Added ${newDocsCnt}`);
        return newDocsCnt;
      }
    }

    // update last parsed page
    contest.lastParsedStatusPage = page;
    await contest.save();
  }

  Logger.success(logEvent, `Successfuly parsed contest "${contestIdentifer}" ~ Added ${newDocsCnt}`);
  return newDocsCnt;
}
