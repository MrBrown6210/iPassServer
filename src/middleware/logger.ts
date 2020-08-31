// const { createLogger, format, transports } = require('winston');
import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${message} :: ${stack}`;
});

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/app-log.log" }),
  ],
});

export default module.exports = logger;
