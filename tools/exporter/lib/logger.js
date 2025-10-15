/* eslint-disable no-console */

import process from 'node:process';

const DEBUG_ENABLED = process.env.LEGACY_EXPORTER_DEBUG === '1';

function formatMessage(scope, level, message) {
  const time = new Date().toISOString();
  return `[${time}] [${scope}] [${level}] ${message}`;
}

function log(scope, level, message) {
  const formatted = formatMessage(scope, level, message);
  switch (level) {
    case 'ERROR':
      console.error(formatted);
      break;
    case 'WARN':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export function createLogger(scope = 'exporter') {
  return {
    info(message) {
      log(scope, 'INFO', message);
    },
    warn(message) {
      log(scope, 'WARN', message);
    },
    error(message) {
      log(scope, 'ERROR', message);
    },
    debug(message) {
      if (DEBUG_ENABLED) {
        log(scope, 'DEBUG', message);
      }
    },
    child(childScope) {
      return createLogger(`${scope}:${childScope}`);
    },
  };
}

export default createLogger;
