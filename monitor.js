// monitor.js
const axios = require('axios');
const config = require('./config');
const logger = require('./logger');
const { restartService } = require('./serviceManager');
const { sendNotification } = require('./notifier');

let monitorInterval = null;
let consecutiveFailures = 0;

async function checkAPIHealth() {
  try {
    const response = await axios.get(config.monitoring.url, { timeout: 5000 });
    if (response.status === 200) {
      logger.info('La API responde correctamente.');
      consecutiveFailures = 0;
    } else {
      logger.warn(`Respuesta inesperada de la API: ${response.status}`);
      handleAPIFailure(`Respuesta inesperada de la API: ${response.status}`);
    }
  } catch (error) {
    logger.error(`Error al verificar la API: ${error.message}`);
    handleAPIFailure(`Error al verificar la API: ${error.message}`);
  }
}

function handleAPIFailure(errorMessage) {
  consecutiveFailures += 1;
  if (consecutiveFailures >= config.monitoring.retryAttempts) {
    logger.error('Se alcanzó el número máximo de intentos fallidos. Reiniciando el servicio...');
    sendNotification(`El servicio ${config.service.name} se reiniciará debido a fallos consecutivos: ${errorMessage}`);
    restartService();
    consecutiveFailures = 0;
  } else {
    logger.warn(`Reintento ${consecutiveFailures}/${config.monitoring.retryAttempts} después de ${config.monitoring.retryDelay}ms`);
    setTimeout(checkAPIHealth, config.monitoring.retryDelay);
  }
}

function startMonitoring() {
  monitorInterval = setInterval(checkAPIHealth, config.monitoring.interval);
  logger.info(`Monitoreo iniciado. Verificando la API cada ${config.monitoring.interval / 1000} segundos.`);
  checkAPIHealth(); // Primera verificación inmediata
}

function stopMonitoring() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    logger.info('Monitoreo detenido.');
  }
}

module.exports = {
  startMonitoring,
  stopMonitoring,
};
