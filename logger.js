// logger.js
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const config = require('./config');

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: config.logging.filename,
  dirname: config.logging.directory,
  datePattern: config.logging.datePattern,
  maxSize: config.logging.maxSize,
  maxFiles: config.logging.maxFiles,
});

const logger = createLogger({
  level: config.logging.level,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(
      (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
    )
  ),
  transports: [
    new transports.Console(),
    dailyRotateFileTransport,
  ],
});

module.exports = logger;
