import cheerio from 'cheerio';
import got from 'got';

/**
 * @returns Cheerio to query the html response of the url
 * @param url the url of the page you want to crawl
 */
export async function crawl(url: string): Promise<cheerio.Root> {
  try {
    const response = await got(url);
    return cheerio.load(response.body);
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
}
