const nodemailer = require('nodemailer');
const config = require('config');
const logger = require('./logger');

let transporter = null;

if (config.get('notifier.enabled')) {
  transporter = nodemailer.createTransport({
    service: config.get('notifier.email.service'),
    auth: {
      user: config.get('notifier.email.auth.user'),
      pass: config.get('notifier.email.auth.pass'),
    },
  });
}

async function sendEmailNotification(subject, message) {
  if (!transporter) {
    logger.warn('Notificaciones están deshabilitadas o mal configuradas.');
    return;
  }

  const mailOptions = {
    from: config.get('notifier.email.auth.user'),
    to: config.get('notifier.email.to'),
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Notificación de correo electrónico enviada con éxito.');
  } catch (error) {
    logger.error(`Error al enviar notificación de correo electrónico: ${error.message}`);
  }
}

module.exports = {
  sendEmailNotification,
};