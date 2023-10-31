const express = require('express');
const SerialPort = require('serialport');
const ip = require('ip');
const { EventEmitter } = require('events');
const commandLineArgs = require('command-line-args');
const { Server } = require('socket.io');

const listSerialPorts = SerialPort.SerialPort.list;

class SerialController {
  constructor(io, app) {
    this.serialCache = {};
    this.eventEmitter = new EventEmitter();
    this.serialPortRetryInterval = 5000;
    this.io = io;
    this.app = app;
    this.serverPort = 3000;
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
        const dataString = data.toString();
        this.serialCache[port] = dataString;

        console.log('Enviando datos:', port, dataString);
        this.io.emit('web-message', { port, data: dataString });
      });

      serialPort.on('error', (error) => {
        console.error(`Error en el puerto ${port}:`, error);
        serialPort.close();
        reject(error);
      });

      serialPort.emit('')

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

      this.app.get('/hello', (req, res) => {
        res.status(200).send('Hello World!');
      });

      const server = this.app.listen(this.serverPort, ip.address(), () => {
        console.log(`Listening http://${ip.address()}:${this.serverPort}`);
      });

      const io = new Server(server);

      io.on('connection', (socket) => {
        console.log(`Socket ${socket.id} connected...`);

        socket.on('web-message', (data) => {
          io.sockets.emit('web-message', data + ' comida');
          console.log(data);
        });
      });

      this.eventEmitter.on('serialport-data', (portname, data) => {
        console.log(`${portname}: ${data}`, 83);
        io.sockets.emit('web-message', `${portname}: ${data}`);
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
        await this.initFromConfigSerialPorts(loadConfig);
        await this.initServer();
      }
    } catch (error) {
      console.error('Error running SerialController:', error);
    }
  }
}

// Uso en tu aplicación
const app = express();
const io = new Server();

const serialController = new SerialController(io, app);
serialController.run();
