import { mongoURIEnvVar, contestsEnvVar } from './config';
import { openMongooseConnection, closeMongooseConnection } from './database/mongoose';
import { ScraperModel } from './database/models';

(async () => {
  await openMongooseConnection(mongoURIEnvVar);

  const startTime = new Date();
  console.log(`[ 🛫 ] Scraper Started ${startTime.toLocaleTimeString()}`);
  const lastUpdate = (await ScraperModel.findOne())?.lastUpdate;
  const lastUpdatedDate = lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A - First run';
  console.log(`[ 🌀 ] Last Updated ${lastUpdatedDate}`);
  console.log(`[ ❗ ] Parsing ${contestsEnvVar.length} contest(s)`);

  await new ScraperModel().save();

  const endTime = new Date();
  const takenTime = endTime.getTime() - startTime.getTime();
  console.log(`[ 🛬 ] Scraper Finished ${endTime.toLocaleTimeString()}`);
  console.log(`[ 🕑 ] Took ${calculateTime(takenTime)} ~ Total added ${'0'}`);

  await closeMongooseConnection();
})();

function calculateTime(distance: number) {
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}
