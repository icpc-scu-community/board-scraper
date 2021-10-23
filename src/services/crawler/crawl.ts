import cheerio from 'cheerio';
import got from 'got';
import { CrawlingError } from './errors';

export default async function crawl(url: string): Promise<cheerio.Root> {
  try {
    const response = await got(url);
    return cheerio.load(response.body);
  } catch (e) {
    const message = e instanceof Error ? e.message : undefined;
    throw new CrawlingError(url, message);
  }
}