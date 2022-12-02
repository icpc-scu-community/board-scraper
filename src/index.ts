import express from 'express';
import { portEnvVar } from './config';
import { scrape } from './scraper';
import { Logger } from './services/logger';

const app = express();
const port = portEnvVar || 3000;

app.disable('x-powered-by');
app.get('/', (_, res) => {
  scrape();
  res.send();
});
app.use('*', (_, res) => res.status(403).send());

app.listen(port, () => Logger.success(`Dump server listening on port ${port}`));
