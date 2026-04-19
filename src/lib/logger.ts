/**
 * A simple logger utility that respects the environment and silences linter warnings.
 * This is usable on both the Client and Server.
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  error: (...args: Array<unknown>) => {
    if (isDev) {
      // biome-ignore lint/suspicious/noConsole: intentional dev logging
      console.error(...args);
    }
  },
  warn: (...args: Array<unknown>) => {
    if (isDev) {
      // biome-ignore lint/suspicious/noConsole: intentional dev logging
      console.warn(...args);
    }
  },
  info: (...args: Array<unknown>) => {
    if (isDev) {
      // biome-ignore lint/suspicious/noConsole: intentional dev logging
      console.info(...args);
    }
  },
  debug: (...args: Array<unknown>) => {
    if (isDev) {
      // biome-ignore lint/suspicious/noConsole: intentional dev logging
      console.debug(...args);
    }
  },
};
