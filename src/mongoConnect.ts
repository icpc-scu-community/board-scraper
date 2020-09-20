// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import mongoose from 'mongoose';

const MONGO_URL = process.env['MONGO_URL'] || 'mongodb://localhost/newcomers-board';

export async function connectToMongo(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(`[ 💽 ] Connected to MongoDB`);
  } catch (e) {
    console.error(e.message);
    process.exit(-1);
  }
}
