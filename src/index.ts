import { closeMongooseConnection, openMongooseConnection, MetadataModel } from './database';
import { parseContests, parseSubmissions } from './parsers';
import { Timer } from './services/Timer';

(async () => {
  Timer.start()
    .then(openMongooseConnection)
    .then(parseContests)
    .then(parseSubmissions)
    .finally(updateMetadata)
    .finally(closeMongooseConnection)
    .finally(Timer.stop);
})();

async function updateMetadata(): Promise<void> {
  await MetadataModel.create({});
}
