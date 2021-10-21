import { openMongooseConnection, closeMongooseConnection } from '../database/mongoose';
import { mongoURIEnvVar } from '../config';

(async () => {
  await openMongooseConnection(mongoURIEnvVar);
  await closeMongooseConnection();
})();
