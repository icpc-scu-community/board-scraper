import mongoose from 'mongoose';
import Logger from '../utils/logger';

const OPEN_CONNECTION_LOG_EVENT = 'open-mongoose-connection';
const CLOSE_CONNECTION_LOG_EVENT = 'close-mongoose-connection';

export async function openMongooseConnection(uri: string): Promise<void> {
  try {
    Logger.log(OPEN_CONNECTION_LOG_EVENT, `Trying to connect to MongoDB.`);
    await mongoose.connect(uri);
    Logger.success(OPEN_CONNECTION_LOG_EVENT, `Succesfuly connected to MongoDB.`);
  } catch (e) {
    Logger.fail(OPEN_CONNECTION_LOG_EVENT, `Failed to connect to MongoDB.\n${e}`);
    process.exit(1);
  }
}

export async function closeMongooseConnection(): Promise<void> {
  try {
    Logger.log(CLOSE_CONNECTION_LOG_EVENT, `Trying to disconnect from MongoDB.`);
    await mongoose.disconnect();
    Logger.success(CLOSE_CONNECTION_LOG_EVENT, `Succesfuly disconnected from MongoDB.`);
  } catch (e) {
    Logger.fail(CLOSE_CONNECTION_LOG_EVENT, `Failed to disconnect from MongoDB.\n${e}`);
    process.exit(1);
  }
}
