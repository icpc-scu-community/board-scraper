import axios from 'axios';
import cheerio from 'cheerio';
import { rcpcCookie } from '../../config/rcpc-cookie';
import { CrawlingError } from './errors';

export default async function crawl(url: string): Promise<cheerio.Root> {
  try {
    const response = await axios.get(url, getHeaders());
    return cheerio.load(response.data);
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
