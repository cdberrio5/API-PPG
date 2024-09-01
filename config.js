// config.js
require('dotenv').config();
const path = require('path');

module.exports = {
  service: {
    name: process.env.SERVICE_NAME || 'PPG-API-SOCKETS',
    description: process.env.SERVICE_DESCRIPTION || 'Servicio para manejar la API de sockets de PPG',
    script: path.join(__dirname, 'index.js'),
    nodeOptions: process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(' ') : ['--trace-warnings'],
    env: [
      {
        name: 'NODE_ENV',
        value: process.env.NODE_ENV || 'production',
      },
    ],
  },
  monitoring: {
    url: process.env.MONITORING_URL || 'http://localhost:8090/hello',
    interval: parseInt(process.env.MONITORING_INTERVAL, 10) || 60000, // en milisegundos
    retryAttempts: parseInt(process.env.MONITORING_RETRY_ATTEMPTS, 10) || 3,
    retryDelay: parseInt(process.env.MONITORING_RETRY_DELAY, 10) || 5000, // en milisegundos
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIRECTORY || path.join(__dirname, 'logs'),
    filename: process.env.LOG_FILENAME || 'app-%DATE%.log',
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
  },
  notification: {
    enabled: process.env.NOTIFICATION_ENABLED === 'true',
    service: process.env.NOTIFICATION_SERVICE || 'gmail',
    auth: {
      user: process.env.NOTIFICATION_EMAIL_USER,
      pass: process.env.NOTIFICATION_EMAIL_PASS,
    },
    to: process.env.NOTIFICATION_EMAIL_TO,
    subject: process.env.NOTIFICATION_EMAIL_SUBJECT || 'Alerta del Servicio PPG-API-SOCKETS',
  },
};
