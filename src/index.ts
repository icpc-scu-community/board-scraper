import { closeMongooseConnection, openMongooseConnection, MetadataModel } from './database';
import { parseContests, parseSubmissions } from './parsers';
import { handleCodeforcesRedirection } from './services/redirection';
import { Timer } from './services/Timer';

(async () => {
  Timer.start()
    .then(openMongooseConnection)
    .then(handleCodeforcesRedirection)
    .then(parseContests)
    .then(parseSubmissions)
    .finally(updateMetadata)
    .finally(closeMongooseConnection)
    .finally(Timer.stop);
})();

async function updateMetadata(): Promise<void> {
  await MetadataModel.create({});
}
