import Spinnies from 'spinnies';

export function createSpinnies(): Spinnies {
  return new Spinnies({ succeedPrefix: '[ ✔ ]', failPrefix: '[ ✖ ]' });
}
export default class Logger {
  private static instance: Logger;
  private spinnies: Spinnies;

  private constructor() {
    this.spinnies = new Spinnies({ succeedPrefix: '[ ✔ ]', failPrefix: '[ ✖ ]' });
  }

  public static get(): Logger {
    if (!this.instance) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  public log(event: string, message?: string): void {
    this.spinnies.add(event, { text: message });
  }

  public success(event: string, message?: string): void {
    if (!this.spinnies.pick(event)) this.log(event, message);
    this.spinnies.succeed(event, { text: message });
  }

  public fail(event: string, message?: string): void {
    if (!this.spinnies.pick(event)) this.log(event, message);
    this.spinnies.fail(event, { text: message });
  }
}
