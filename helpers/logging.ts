import winston from "winston";
// @ts-ignore
import logstash from "winston-logstash-transport";

const MESSAGE = Symbol.for("message");
const LEVEL = Symbol.for("level");

const errorToLog = (log: any) => {
  // convert an instance of the Error class to a formatted log
  const formatted: any = {
    message: null,
    level: "error",
  };
  formatted[LEVEL] = "error";
  if (log.message) {
    formatted.message = `${log.message}: ${log.stack}`;
  } else {
    formatted.message = log.stack;
  }
  return formatted;
};

const errorFormatter = (logEntry: any) => {
  if (logEntry instanceof Error) {
    // an error object was passed in
    return errorToLog(logEntry);
  }
  if (logEntry.stack) {
    // an error object was passed in addition to an error message
    logEntry.message = `${logEntry.message}: ${logEntry.stack}`;
  }
  if (logEntry.message && typeof logEntry.message === "object") {
    if (logEntry.message?.err instanceof Error) {
      // Ugh. So here we are with a log message that is an instance of the Error class
      return errorToLog(logEntry.message.err);
    } else {
      // here we have an object as the log message but it's not an Error object
      logEntry.message = JSON.stringify(logEntry.message);
    }
  }
  return logEntry;
};

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli({
        colors: {
          error: "red",
          warn: "yellow",
          info: "blue",
          http: "green",
          verbose: "cyan",
          debug: "white",
        },
      })
  ),
  handleExceptions: true,
});
const logstashTransport = new logstash.LogstashTransport({
  mode: "udp",
  host: "127.0.0.1",
  port: 1514,
});

const envTag = (logEntry: any) => {
  const tag = {
    env: process.env.APPLICATION_ENV || "local",
  };
  const taggedLog = Object.assign(tag, logEntry);
  logEntry[MESSAGE] = JSON.stringify(taggedLog);
  return logEntry;
};

const transports = [];

// configure transports (defined above)
transports.push(consoleTransport);
transports.push(logstashTransport);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
      winston.format(errorFormatter)(),
      winston.format(envTag)()
  ),
  transports,
});

logger.stream = {
// @ts-ignore
  "write": function (message: any, _encoding) {
    logger.http(message);
  },
};


export class Console {
  options : any = {};
  constructor(options = {}) {
    this.options = options;
  }

  log(data: any) {
    logger.info({
      ...this.options,
      ...data,
    });
  }
  info(data: object) {
    logger.info({
      ...this.options,
      ...data,
    });
  }
  error(data: object) {
    logger.error({
      ...this.options,
      ...data,
    });
  }
  warn(data: object) {
    logger.warn({
      ...this.options,
      ...data,
    });
  }
  debug(data: object) {
    logger.debug({
      ...this.options,
      ...data,
    });
  }
}
