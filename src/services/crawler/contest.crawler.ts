import crawl from './crawl';
import { CrawlingError } from './errors';

interface ContestCrawlingResult {
  name: string;
  problems: { id: string; name: string }[];
}

export async function crawlContest(groupId: string, contestId: string): Promise<ContestCrawlingResult> {
  const url = getContestPageUrl(groupId, contestId);
  const $ = await crawl(url);

  const name = $('#sidebar div:nth-child(3) a').text().trim();
  const problems = $('.problems')
    .find('tr:not(:first-child)')
    .get()
    .map((el) => ({
      id: $(el).find('td:nth-child(1) a').text().trim(),
      name: $(el).find('td:nth-child(2) a').text().trim(),
    }));

  if (!name || problems.length === 0) {
    throw new CrawlingError(url);
  }

  return { name, problems };
}

function getContestPageUrl(groupId: string, contestId: string) {
  return `https://codeforces.com/group/${groupId}/contest/${contestId}`;
}
