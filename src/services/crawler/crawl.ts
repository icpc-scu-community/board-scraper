import cheerio from 'cheerio';
import got from 'got';
import { CrawlingError } from './errors';
import { rcpcCookie } from '../../config/rcpc-cookie';

export default async function crawl(url: string): Promise<cheerio.Root> {
  try {
    const response = await got(url, getHeaders());
    return cheerio.load(response.body);
  } catch (error) {
    throw new CrawlingError(url, `${error}`);
  }
}

function getHeaders() {
  return rcpcCookie
    ? {
        headers: {
          cookie: `RCPC=${rcpcCookie}`,
        },
      }
    : {};
}
