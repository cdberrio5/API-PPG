const express = require('express');
const SerialPort = require('serialport');
const ip = require('ip');
const { EventEmitter } = require('events');
const commandLineArgs = require('command-line-args');
const { Server } = require('socket.io');
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, 'api.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
console.log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] Index: ${message}\n`;
  logStream.write(logMessage);
  process.stdout.write(logMessage);
};

const listSerialPorts = SerialPort.SerialPort.list;

class SerialController {
  constructor(app) {
    this.serialCache = {};
    this.eventEmitter = new EventEmitter();
    this.serialPortRetryInterval = 5000;
    this.app = app;
    this.serverPort = 8090;
  }

  async detectSerialPorts() {
    try {
      const ports = await listSerialPorts();
      return ports.map((port) => port.path);
    } catch (error) {
      console.error('Error detecting serial ports:', error);
      return [];
    }
  }

  async connectToSerialPort(port) {
    let connected = false;
    while (!connected) {
      try {
        await this.tryConnect(port);
        connected = true;
      } catch (error) {
        console.error(`Error conectando al puerto ${port}:`, error);
        await this.sleep(this.serialPortRetryInterval);
      }
    }
  }

  async tryConnect(port) {
    return new Promise((resolve, reject) => {
      const serialPort = new SerialPort.SerialPort({ path: port, baudRate: 9600 });

      serialPort.on('data', (data) => {
        const dataString = data.toString().trim();
        this.serialCache[port] = dataString;

        console.log('Enviando datos:', port, dataString);
        this.io.emit('web-message', port+": "+dataString);
      });

      serialPort.on('error', (error) => {
        console.error(`Error en el puerto ${port}:`, error);
        serialPort.close();
        reject(error);
      });
      
      serialPort.on('open', () => {
        console.log(`Conectado al puerto: ${port}`);
        resolve();
      });
    });
  }

  async initFromConfigSerialPorts(ports) {
    console.log(ports)
    const promises = ports.map((port) => this.connectToSerialPort(port));
    await Promise.all(promises);
    console.log('Todos los puertos seriales conectados');
  }

  async initServer() {
    try {
      this.app.use(express.static('public'));

      this.app.use(cors({
        origin: "*",
        credentials: true
      }));

      this.app.get('/hello', (req, res) => {
        res.status(200).send('Hello World!');
      });

      const server = this.app.listen(this.serverPort, ip.address(), () => {
        console.log(`Listening http://${ip.address()}:${this.serverPort}`);
      });

      this.io = new Server(server, {
        cors: {
          origin: "http://smedapp01",
          methods: ["GET", "POST"],
          transports: ['websocket', 'polling'],
          credentials: true
        },
        allowEIO3: true
      });
    } catch (error) {
      console.error('Error initializing server:', error);
    }
  }

  async loadConfig() {
    try {
      const configData = await this.detectSerialPorts();

      return configData;
    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  startStatusMonitoring() {
    setInterval(() => {
      this.checkServerStatus();
    }, 60000); // Verificar cada 60 segundos
  }

  checkServerStatus() {
    http.get(`http://${ip.address()}:${this.serverPort}/hello`, (res) => {
      if (res.statusCode !== 200) {
        console.error(`El servidor no responde correctamente. Código de estado: ${res.statusCode}`);
        // Aquí podrías implementar lógica para reiniciar el servidor si es necesario
      }
    }).on('error', (err) => {
      console.error('Error al verificar el estado del servidor:', err.message);
      // Aquí también podrías implementar lógica para manejar el error
    });
  }

  async run() {
    try {
      const options = commandLineArgs([
        { name: 'showports', alias: 's', type: Boolean, description: 'Display serial ports.' },
        { name: 'port', alias: 'p', type: String, description: 'Connect to a specific serial port.' },
      ]);

      if (options.showports) {
        const ports = await this.detectSerialPorts();
        console.log('Available Serial Ports:', ports);
      } else {
        const loadConfig = await this.loadConfig();
        await this.initServer();
        await this.initFromConfigSerialPorts(loadConfig);
        await this.startStatusMonitoring();
      }
    } catch (error) {
      console.error('Error running SerialController:', error);
    }
  }
}

// Uso en tu aplicación
const app = express();

const serialController = new SerialController(app);
serialController.run();
