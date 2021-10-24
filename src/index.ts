import { openMongooseConnection, closeMongooseConnection, ScraperModel } from './database';
import { mongoURIEnvVar } from './config';
import { formatTime } from './utils';
import { Logger } from './services/logger';
import { parseContests, parseSubmissions } from './parsers';

(async () => {
  const startTime = new Date();
  Logger.success(`Scraper started at ${startTime.toLocaleTimeString()}.`);

  openMongooseConnection(mongoURIEnvVar)
    .then(() => parseContests())
    .then(() => parseSubmissions())
    .finally(() => ScraperModel.create({}))
    .finally(() => closeMongooseConnection())
    .finally(() => {
      const endTime = new Date();
      const takenTime = endTime.getTime() - startTime.getTime();
      Logger.success(`Scraper finished at ${endTime.toLocaleTimeString()}.`);
      Logger.success(`Took ${formatTime(takenTime)} ~ Total added ${'0'}.`);
    });
})();
