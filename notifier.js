// notifier.js
const nodemailer = require('nodemailer');
const config = require('./config');
const logger = require('./logger');

let transporter = null;

if (config.notification.enabled) {
  transporter = nodemailer.createTransport({
    service: config.notification.service,
    auth: {
      user: config.notification.auth.user,
      pass: config.notification.auth.pass,
    },
  });
}

async function sendNotification(message) {
  if (!transporter) {
    logger.warn('Notificaciones deshabilitadas o configuración incompleta.');
    return;
  }

  const mailOptions = {
    from: config.notification.auth.user,
    to: config.notification.to,
    subject: config.notification.subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Notificación enviada correctamente.');
  } catch (error) {
    logger.error(`Error al enviar la notificación: ${error.message}`);
  }
}

module.exports = {
  sendNotification,
};
