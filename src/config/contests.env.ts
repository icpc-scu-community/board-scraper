import env from './env';

interface IContestEnvVar {
  groupId: string;
  contestId: string;
}

// Example: CONTESTS=n3sTiYtHxI/348729,n3sTiYtHxI/348730
const CONTESTS_DELIMITER = ',';
const CONTEST_GROUP_DELIMITER = '/';

const sanitizedEnvVarValue = env('CONTESTS').toLowerCase().replace(/\s/g, '');
const contestIdentifiers = sanitizedEnvVarValue.split(CONTESTS_DELIMITER);
const uniqueContestIdentifiers = Array.from(new Set(contestIdentifiers));
export const contestsEnvVar: IContestEnvVar[] = uniqueContestIdentifiers
  .map((contest) => contest.split(CONTEST_GROUP_DELIMITER))
  .filter((contest) => contest.length === 2)
  .map(([groupId, contestId]) => ({
    groupId,
    contestId,
  }));
