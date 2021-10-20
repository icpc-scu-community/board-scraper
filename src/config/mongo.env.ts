import env from './env';

// Example: MONGO_URI=mongodb://localhost:27017/newcomers-board
export const mongoURIEnvVar = env('MONGO_URI');
