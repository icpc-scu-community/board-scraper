import { openMongooseConnection, closeMongooseConnection } from '../database/mongoose-connection';
import { mongoURIEnvVar } from '../config';

(async () => {
  await openMongooseConnection(mongoURIEnvVar);
  await closeMongooseConnection();
})();
