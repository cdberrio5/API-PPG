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
  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.SERVER_PORT, 10) || 8090,
  },
  serial: {
    baudRate: parseInt(process.env.SERIAL_BAUD_RATE, 10) || 9600,
    retryInterval: parseInt(process.env.SERIAL_RETRY_INTERVAL, 10) || 5000,
    maxRetries: parseInt(process.env.SERIAL_MAX_RETRIES, 10) || 5,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: path.join(__dirname, '..', 'logs'),
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  },
  notifier: {
    enabled: process.env.NOTIFIER_ENABLED === 'true',
    email: {
      service: process.env.NOTIFIER_EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.NOTIFIER_EMAIL_USER,
        pass: process.env.NOTIFIER_EMAIL_PASS,
      },
      to: process.env.NOTIFIER_EMAIL_TO,
      subject: process.env.NOTIFIER_EMAIL_SUBJECT || 'Alerta del Servicio',
    },
  },
};
