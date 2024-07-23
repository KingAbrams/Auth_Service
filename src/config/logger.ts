import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf } = format;

const myFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const loggerConfig = {
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console()],
};

export const logger = createLogger(loggerConfig);
