import express from 'express';
import { portEnvVar } from './config';
import { Logger } from './services/logger';

const app = express();
const port = portEnvVar || 3000;

app.disable('x-powered-by');
app.use('*', (_, res) => res.status(403).send());

export async function startServer(): Promise<void> {
  return new Promise((resolve) => {
    app.listen(port, () => {
      Logger.success(`Dump server listening on port ${port}`);
      resolve();
    });
  });
}