export class CrawlingError extends Error {
  constructor(url: string, extraMessage?: string) {
    const formattedExtraMessage = extraMessage ? `\n${extraMessage}` : '';
    super(`Unexpected crawling result of "${url}"${formattedExtraMessage}.`);
  }
}
