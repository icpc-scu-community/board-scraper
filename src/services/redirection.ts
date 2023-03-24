import { Codeforces } from 'codeforces-rcpc';
import { setRcpcCookie } from '../config/rcpc-cookie';
import { Logger } from './logger';

const HANDLE_REDIRECTION_LOG_EVENT = 'redirection';

export async function handleCodeforcesRedirection(): Promise<void> {
  Logger.log(HANDLE_REDIRECTION_LOG_EVENT, `Start redirection handling.`);

  const hasRedirection = await Codeforces.hasRedirection();
  if (!hasRedirection) {
    Logger.success(HANDLE_REDIRECTION_LOG_EVENT, `No redirection handling needed.`);
    return;
  }

  const cookie = await Codeforces.getRCPCValue();
  setRcpcCookie(cookie);
  Logger.success(HANDLE_REDIRECTION_LOG_EVENT, `Redirection was handeled successfully.`);
}
