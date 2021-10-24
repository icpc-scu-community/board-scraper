import { formatTime } from '../utils';
import { Logger } from './logger';

export class Timer {
  static startTime: Date;

  static start(): Promise<void> {
    return new Promise((resolve) => {
      Timer.startTime = new Date();
      Logger.success(`Scraper started at ${Timer.startTime.toLocaleTimeString()}.`);
      resolve();
    });
  }

  static stop(): Promise<void> {
    return new Promise((resolve) => {
      const endTime = new Date();
      const takenTime = endTime.getTime() - Timer.startTime.getTime();
      Logger.success(`Scraper finished at ${endTime.toLocaleTimeString()}!`);
      Logger.success(`Took ${formatTime(takenTime)}.`);
      resolve();
    });
  }
}
