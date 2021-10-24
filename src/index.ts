import { closeMongooseConnection, openMongooseConnection, updateMetadata } from './database';
import { parseContests, parseSubmissions } from './parsers';
import { Timer } from './services/Timer';

(async () => {
  // handle CTRL+C

  Timer.start()
    .then(openMongooseConnection)
    .then(parseContests)
    .then(parseSubmissions)
    .finally(updateMetadata)
    .finally(closeMongooseConnection)
    .finally(Timer.stop);
})();
