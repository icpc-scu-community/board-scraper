import mongoose from 'mongoose';
import Logger from '../utils/logger';

const logger = Logger.get();
const OPEN_CONNECTION_EVENT = 'open-mongoose-connection';
const CLOSE_CONNECTION_EVENT = 'close-mongoose-connection';

export async function openMongooseConnection(uri: string): Promise<void> {
  try {
    logger.log(OPEN_CONNECTION_EVENT, `Trying to connect to MongoDB with URI: ${uri}.`);
    await mongoose.connect(uri);
    logger.success(OPEN_CONNECTION_EVENT, `Succesfuly connected to MongoDB with URI: ${uri}.`);
  } catch (e) {
    logger.error(OPEN_CONNECTION_EVENT, `Failed to connect to MongoDB with URI: ${uri}.\n${e}`);
    process.exit(1);
  }
}

export async function closeMongooseConnection(): Promise<void> {
  try {
    logger.log(CLOSE_CONNECTION_EVENT, `Trying to disconnect from MongoDB.`);
    await mongoose.disconnect();
    logger.success(CLOSE_CONNECTION_EVENT, `Succesfuly disconnected from MongoDB.`);
  } catch (e) {
    logger.error(CLOSE_CONNECTION_EVENT, `Failed to disconnect from MongoDB.\n${e}`);
    process.exit(1);
  }
}
