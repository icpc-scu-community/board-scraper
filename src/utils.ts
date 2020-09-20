import cheerio from 'cheerio';
import got from 'got';
import logSymbols from 'log-symbols';
import Spinnies from 'spinnies';

export function createSpinnies(): Spinnies {
  return new Spinnies({ succeedPrefix: `[ ${logSymbols.success} ]`, failPrefix: `[ ${logSymbols.error} ]` });
}

/**
 * @returns Cheerio to query the html response of the url
 * @param url the url of the page you want to crawl
 */
export async function crawl(url: string): Promise<CheerioStatic> {
  try {
    const response = await got(url);
    return cheerio.load(response.body);
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
}
