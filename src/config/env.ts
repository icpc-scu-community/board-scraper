import { Logger } from '../utils';

function env(name: string, required?: true): string;
function env(name: string, required: false): string | undefined;
function env(name: string, required = true): string | undefined {
  const envVar = process.env[name];
  if (required && envVar === undefined) {
    Logger.fail(`Environement variable "${name}" is required but not set.`);
    process.exit(1);
  }
  return envVar;
}

export default env;
