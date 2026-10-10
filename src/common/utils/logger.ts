import * as winston from 'winston';
import { randomUUID } from 'crypto';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LOG_FILENAME, DATE_PATTERN, MAX_FILES } from '../constants/log.constants';
import { appConfig } from '../../config/config';

const config = appConfig();
const { combine, timestamp, printf, colorize } = winston.format;

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

if (config.logging.enableFileLogging) {
  const fileRotateTransport = new DailyRotateFile({
    filename: LOG_FILENAME,
    datePattern: DATE_PATTERN,
    maxFiles: config.logging.maxFiles || MAX_FILES,
  });
  transports.push(fileRotateTransport);
}

const myFormat = printf(({ timestamp, level, message, meta, traceID }) => {
  return `${timestamp}|${level}|traceID: ${traceID}|${message}${meta ? '| ' + JSON.stringify(meta) : ''}`;
});

const generateTraceID = (): string => randomUUID();

const traceIdFormat = winston.format((info) => {
  if (!info.traceID) {
    info.traceID = generateTraceID();
  }
  return info;
});

export const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    colorize(),
    timestamp({ format: 'MM-DD-YY HH:mm:ss' }),
    traceIdFormat(),
    myFormat,
  ),
  transports,
});

export default logger;
