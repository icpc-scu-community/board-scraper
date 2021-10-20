import env from './env';

interface IContest {
  contestId: string;
  groupId: string;
}

// Example: CONTESTS=n3sTiYtHxI/348729,n3sTiYtHxI/348730
const CONTESTS_DELIMITER = ',';
const CONTEST_GROUP_DELIMITER = '/';

export const contestsEnvVar: IContest[] = env('CONTESTS')
  .split(CONTESTS_DELIMITER) // split contests
  .map((contest) => contest.split(CONTEST_GROUP_DELIMITER)) // split contest details
  .filter((contest) => contest.length === 2) // filter invalid contests
  .map(([groupId, contestId]) => ({
    contestId: contestId.trim(),
    groupId: groupId.trim(),
  }));
