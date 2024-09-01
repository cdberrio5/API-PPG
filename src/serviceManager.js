// serviceManager.js
const { Service } = require('node-windows');
const { exec } = require('child_process');
const config = require('../config/default');
const logger = require('./logger');
const path = require('path');

const svc = new Service({
  name: config.service.name,
  description: config.service.description,
  script: config.service.script,
  nodeOptions: config.service.nodeOptions,
  env: config.service.env,
  workingDirectory: path.resolve(__dirname),
});

function installService() {
  svc.on('install', () => {
    logger.info('Servicio instalado correctamente.');
    svc.start();
  });

  svc.on('start', () => {
    logger.info('Servicio iniciado.');
  });

  svc.on('error', (err) => {
    logger.error(`Error en el servicio: ${err.message}`);
  });

  svc.install();
}

function uninstallService() {
  svc.on('uninstall', () => {
    logger.info('Servicio desinstalado correctamente.');
  });

  svc.on('error', (err) => {
    logger.error(`Error al desinstalar el servicio: ${err.message}`);
  });

  svc.uninstall();
}

function restartService() {
  svc.restart();
  logger.info('Servicio reiniciado.');
}

function isServiceInstalled(callback) {
  exec(`sc query "${config.service.name}"`, (error, stdout, stderr) => {
    if (error || stderr) {
      return callback(false);
    }
    if (stdout.includes('STATE')) {
      return callback(true);
    }
    return callback(false);
  });
}

module.exports = {
  installService,
  uninstallService,
  restartService,
  isServiceInstalled,
  serviceInstance: svc,
};
