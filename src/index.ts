import cron from 'node-cron';
import { cronExpressionEnvVar } from './config';
import { scrape } from './scraper';
import { startServer } from './server';

startServer();
cron.schedule(cronExpressionEnvVar, scrape);
