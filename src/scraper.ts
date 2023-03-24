import { closeMongooseConnection, openMongooseConnection, MetadataModel } from './database';
import { parseContests, parseSubmissions } from './parsers';
import { handleCodeforcesRedirection } from './services/redirection';
import { Timer } from './services/Timer';

let isRunning = false;

export async function scrape() {
  if (isRunning) return;
  toggleRun();
  Timer.start()
    .then(openMongooseConnection)
    .then(handleCodeforcesRedirection)
    .then(parseContests)
    .then(parseSubmissions)
    .finally(updateMetadata)
    .finally(closeMongooseConnection)
    .finally(Timer.stop)
    .finally(toggleRun);
}

async function updateMetadata(): Promise<void> {
  await MetadataModel.create({});
}

function toggleRun() {
  isRunning = !isRunning;
}
