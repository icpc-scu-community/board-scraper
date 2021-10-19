import Spinnies from 'spinnies';

export function createSpinnies(): Spinnies {
  return new Spinnies({ succeedPrefix: '[ ✔ ]', failPrefix: '[ ✖ ]' });
}

export default class Logger {
  private spinnies: Spinnies;

  constructor(spinniesOptions: Spinnies.Options = { succeedPrefix: '[ ✔ ]', failPrefix: '[ ✖ ]' }) {
    this.spinnies = new Spinnies(spinniesOptions);
  }

  public log(event: string, message?: string): void {
    this.spinnies.add(event, { text: message });
  }

  public success(event: string, message?: string): void {
    this.spinnies.succeed(event, { text: message });
  }

  public error(event: string, message?: string): void {
    this.spinnies.fail(event, { text: message });
  }
}
