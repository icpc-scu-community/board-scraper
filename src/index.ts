import { mongoURIEnvVar } from './config';
import { openMongooseConnection, closeMongooseConnection } from './database/mongoose';
import { ScraperModel } from './database/models';
import { Logger } from './services/logger';
import { formatTime } from './utils';

(async () => {
  // log start time
  const startTime = new Date();
  Logger.success(`Scraper started at ${startTime.toLocaleTimeString()}.`);

  // db connection start
  await openMongooseConnection(mongoURIEnvVar);

  // parsing goes here
  const lastUpdate = (await ScraperModel.findOne())?.lastUpdate;
  const lastUpdatedDate = lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A - First run';
  Logger.success(`Last Updated ${lastUpdatedDate}`);

  // update last update time
  await new ScraperModel().save();

  // db connection end
  await closeMongooseConnection();

  // log end time
  const endTime = new Date();
  const takenTime = endTime.getTime() - startTime.getTime();
  Logger.success(`Scraper finished at ${endTime.toLocaleTimeString()}.`);
  Logger.success(`Took ${formatTime(takenTime)} ~ Total added ${'0'}.`);
})();
