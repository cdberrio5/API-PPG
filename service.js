// index.js
const { installService, uninstallService, isServiceInstalled, serviceInstance } = require('./serviceManager');
const { startMonitoring, stopMonitoring } = require('./monitor');
const logger = require('./logger');

function handleServiceEvents() {
  serviceInstance.on('start', () => {
    logger.info('Servicio iniciado.');
    startMonitoring();
  });

  serviceInstance.on('stop', () => {
    logger.info('Servicio detenido.');
    stopMonitoring();
  });

  serviceInstance.on('error', (err) => {
    logger.error(`Error en el servicio: ${err.message}`);
  });
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case '--install':
      isServiceInstalled((installed) => {
        if (installed) {
          logger.warn('El servicio ya está instalado.');
        } else {
          installService();
        }
      });
      break;
    case '--uninstall':
      isServiceInstalled((installed) => {
        if (installed) {
          uninstallService();
        } else {
          logger.warn('El servicio no está instalado.');
        }
      });
      break;
    default:
      logger.error('Comando no reconocido. Usa --install o --uninstall.');
      process.exit(1);
  }
}

handleServiceEvents();
main();
