import cheerio from 'cheerio';
import got from 'got';
import { rcpcCookieEnvVar } from '../../config';
import { CrawlingError } from './errors';

export default async function crawl(url: string): Promise<cheerio.Root> {
  try {
    const response = await got(url, {
      headers: {
        cookie: `RCPC=${rcpcCookieEnvVar}`,
      },
    });
    return cheerio.load(response.body);
  } catch (error) {
    throw new CrawlingError(url, `${error}`);
  }
}
