import got from 'got';
import crawl from './crawler/crawl';
import { Logger } from './logger';
import { setRcpcCookie } from '../config/rcpc-cookie';

const HANDLE_REDIRECTION_LOG_EVENT = 'redirection';

export async function handleCodeforcesRedirection(): Promise<void> {
  Logger.log(HANDLE_REDIRECTION_LOG_EVENT, `Start redirection handling.`);

  const [aesScript, codeforces$] = await Promise.all([
    (await got('https://codeforces.com/aes.min.js')).body,
    await crawl('https://codeforces.com'),
  ]);

  const hasRedirection = codeforces$('body').text().includes('Redirecting');
  if (!hasRedirection) {
    Logger.success(HANDLE_REDIRECTION_LOG_EVENT, `No redirection handling needed.`);
    return;
  }

  const cfScript = codeforces$('script').text().split(';document')[0];
  const script = `${aesScript}${cfScript}; toHex(slowAES.decrypt(c,2,a,b));`.replace(/for \(i/g, 'for (var i');
  const token = eval(script);
  setRcpcCookie(token);
  Logger.success(HANDLE_REDIRECTION_LOG_EVENT, `Redirection was handeled successfully.`);
}
