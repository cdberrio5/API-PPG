const { SerialPort } = require('serialport');
const EventEmitter = require('events');
const config = require('config');
const logger = require('./logger');
const { sendEmailNotification } = require('./notifier');

class SerialController extends EventEmitter {
  constructor() {
    super();
    this.serialPorts = [];
  }

  async detectSerialPorts() {
    try {
      const ports = await SerialPort.list();
      const portPaths = ports.map((port) => port.path);
      logger.info(`Puertos seriales detectados: ${portPaths.join(', ')}`);
      return portPaths;
    } catch (error) {
      logger.error(`Error al detectar puertos seriales: ${error.message}`);
      sendEmailNotification('Error al detectar puertos seriales', error.message);
      return [];
    }
  }

  async connectToPort(portPath) {
    let attempts = 0;
    const maxRetries = config.get('serial.maxRetries');
    const retryInterval = config.get('serial.retryInterval');

    const connect = () => {
      return new Promise((resolve, reject) => {
        const port = new SerialPort({
          path: portPath,
          baudRate: config.get('serial.baudRate'),
          autoOpen: false,
        });

        port.on('open', () => {
          logger.info(`Conectado al puerto serial: ${portPath}`);
          this.serialPorts.push(port);
          this.setupPortListeners(port);
          resolve();
        });

        port.on('error', (err) => {
          logger.error(`Error en el puerto ${portPath}: ${err.message}`);
          port.close();
          reject(err);
        });

        port.open();
      });
    };

    while (attempts < maxRetries) {
      try {
        await connect();
        return;
      } catch (error) {
        attempts++;
        logger.warn(`Reintentando conexión a ${portPath} (${attempts}/${maxRetries})`);
        if (attempts >= maxRetries) {
          logger.error(`No se pudo conectar al puerto ${portPath} después de ${maxRetries} intentos.`);
          sendEmailNotification(`Error de conexión en puerto ${portPath}`, error.message);
        } else {
          await this.delay(retryInterval);
        }
      }
    }
  }

  setupPortListeners(port) {
    port.on('data', (data) => {
      const message = data.toString().trim();
      logger.info(`Datos recibidos de ${port.path}: ${message}`);
      this.emit('data', { port: port.path, message });
    });

    port.on('close', () => {
      logger.warn(`Conexión cerrada en el puerto ${port.path}. Intentando reconectar...`);
      this.removePort(port.path);
      this.connectToPort(port.path);
    });
  }

  removePort(portPath) {
    this.serialPorts = this.serialPorts.filter((port) => port.path !== portPath);
  }

  async initialize() {
    const portPaths = await this.detectSerialPorts();
    const connectPromises = portPaths.map((path) => this.connectToPort(path));
    await Promise.all(connectPromises);
    logger.info('Inicialización de puertos seriales completa.');
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  closeAllPorts() {
    this.serialPorts.forEach((port) => {
      if (port.isOpen) {
        port.close();
      }
    });
  }
}

module.exports = SerialController;
