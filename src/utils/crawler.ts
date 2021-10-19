import cheerio from 'cheerio';
import got from 'got';

export async function crawl(url: string): Promise<cheerio.Root> {
  const response = await got(url);
  return cheerio.load(response.body);
}
