export const contestPageUrl = (contestId: string, groupId: string): string => {
  return `https://codeforces.com/group/${groupId}/contest/${contestId}`;
};

export const statusPageUrl = (contestId: string, groupId: string, page = 1): string => {
  return `https://codeforces.com/group/${groupId}/contest/${contestId}/status/page/${page}?order=BY_ARRIVED_ASC`;
};
