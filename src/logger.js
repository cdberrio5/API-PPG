const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const config = require('config');

const logger = createLogger({
  level: config.get('logging.level'),
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      (info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: config.get('logging.filename'),
      dirname: config.get('logging.dir'),
      datePattern: config.get('logging.datePattern'),
      maxSize: config.get('logging.maxSize'),
      maxFiles: config.get('logging.maxFiles'),
      zippedArchive: true,
    }),
  ],
});

module.exports = logger;