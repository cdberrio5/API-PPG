require('dotenv').config();
const logger = require('./logger');
const SerialController = require('./serialController');
const AppServer = require('./server');
const { sendEmailNotification } = require('./notifier');

async function main() {
  logger.info('Iniciando aplicación...');

  const serialController = new SerialController();
  const appServer = new AppServer();

  try {
    await serialController.initialize();
    appServer.setupSocketHandlers(serialController);
    appServer.start();

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    function shutdown() {
      logger.info('Apagando aplicación...');
      serialController.closeAllPorts();
      appServer.stop();
      process.exit(0);
    }
  } catch (error) {
    logger.error(`Error al iniciar la aplicación: ${error.message}`);
    sendEmailNotification('Error crítico en la aplicación', error.message);
    process.exit(1);
  }
}

main();