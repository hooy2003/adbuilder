import JusifiedHostURL from './JusifiedHostURL';

let lastLogTimestamp = null;

const url = JusifiedHostURL;
const enabledInUrl = url.searchParams && url.searchParams.get('enable-log') !== null;

function consoleLogTagged(name) {
  const logger = (message) => {
    const currentTimestamp = Date.now();
    const timeDiff = lastLogTimestamp ? (currentTimestamp - lastLogTimestamp) : 0;
    lastLogTimestamp = currentTimestamp;

    if (!enabled()) return;

    // console.log(`[${name}] ${message} +${timeDiff}ms`);
  };

  logger.enabled = enabled();

  return logger;
}

function enabled() {
  if (enabledInUrl) return true;
  return process.env.NODE_ENV !== 'production';
}

export { consoleLogTagged };
