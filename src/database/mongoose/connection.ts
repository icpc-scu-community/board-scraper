import mongoose from 'mongoose';
import { duplicateKeyErrorHandler } from './plugins';
import { Logger } from '../../services/logger';
import { mongoURIEnvVar } from '../../config';

const OPEN_CONNECTION_LOG_EVENT = 'monggose:open-mongoose-connection';
const CLOSE_CONNECTION_LOG_EVENT = 'monggose:close-mongoose-connection';

mongoose.plugin(duplicateKeyErrorHandler);

export async function openMongooseConnection(): Promise<void> {
  try {
    Logger.log(OPEN_CONNECTION_LOG_EVENT, `Trying to connect to MongoDB.`);
    await mongoose.connect(mongoURIEnvVar);
    Logger.success(OPEN_CONNECTION_LOG_EVENT, `Successfully connected to MongoDB.`);
  } catch (error) {
    Logger.fail(OPEN_CONNECTION_LOG_EVENT, `Failed to connect to MongoDB.\n${error}`);
    process.exit(1);
  }
}

export async function closeMongooseConnection(): Promise<void> {
  try {
    Logger.log(CLOSE_CONNECTION_LOG_EVENT, `Trying to disconnect from MongoDB.`);
    await mongoose.disconnect();
    Logger.success(CLOSE_CONNECTION_LOG_EVENT, `Successfully disconnected from MongoDB.`);
  } catch (error) {
    Logger.fail(CLOSE_CONNECTION_LOG_EVENT, `Failed to disconnect from MongoDB.\n${error}`);
    process.exit(1);
  }
}
