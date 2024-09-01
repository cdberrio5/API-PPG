const { Service } = require('node-windows');
const path = require('path');
const logger = require('./logger');
const config = require('config');

const svc = new Service({
  name: config.get('service.name') || 'PPG-API-SOCKETS',
  description: config.get('service.description') || 'Servicio para manejar la API de sockets de PPG',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096',
  ],
  env: [
    { name: 'NODE_ENV', value: process.env.NODE_ENV || 'production' },
  ],
});

svc.on('install', () => {
  logger.info('Servicio instalado correctamente.');
  svc.start();
});

svc.on('alreadyinstalled', () => {
  logger.warn('El servicio ya está instalado.');
});

svc.on('start', () => {
  logger.info('Servicio iniciado correctamente.');
});

svc.on('stop', () => {
  logger.info('Servicio detenido.');
});

svc.on('uninstall', () => {
  logger.info('Servicio desinstalado.');
});

svc.on('error', (err) => {
  logger.error(`Error en el servicio: ${err.message}`);
});

const action = process.argv[2];

switch (action) {
  case '--install':
    svc.install();
    break;
  case '--uninstall':
    svc.uninstall();
    break;
  default:
    logger.error('Comando no reconocido. Usa --install o --uninstall.');
    process.exit(1);
}