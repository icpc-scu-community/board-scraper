import crawl from './crawl';
import { CrawlingError } from './errors';

interface SubmissionsCrawlingResult {
  containsPendingSubmissions: boolean;
  submissions: {
    id: string;
    handle: string;
    problem: string;
    verdict: string;
  }[];
}

export async function crawlSubmissions(
  groupId: string,
  contestId: string,
  page: number,
): Promise<SubmissionsCrawlingResult> {
  const url = getStatusPageUrl(groupId, contestId, page);
  const $ = await crawl(url);

  const containsPendingSubmissions = !!$('td[waiting=true]').text();
  const submissions = $('tr[data-submission-id]')
    .map((_, row) => {
      const [id, __, handle, problem, ___, verdict] = $(row)
        .children('td')
        .map((_, cell) => $(cell).text().trim())
        .get();
      return { id, handle, problem, verdict, contestId };
    })
    .get();

  if (submissions.length === 0) {
    throw new CrawlingError(url);
  }

  return {
    containsPendingSubmissions,
    submissions,
  };
}

export async function crawlSubmissionsTotalPages(groupId: string, contestId: string): Promise<number> {
  const url = getStatusPageUrl(groupId, contestId);
  const $ = await crawl(url);
  return parseInt($('[pageindex]').last().attr('pageindex') || '1');
}

function getStatusPageUrl(groupId: string, contestId: string, page = 1) {
  return `https://codeforces.com/group/${groupId}/contest/${contestId}/status/page/${page}?order=BY_ARRIVED_ASC`;
}
