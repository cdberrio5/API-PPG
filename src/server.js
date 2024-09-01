const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const ip = require('ip');
const config = require('config');
const logger = require('./logger');

class AppServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
  }

  setupMiddlewares() {
    this.app.use(cors());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    this.app.get('/hello', (req, res) => {
      res.status(200).send('Hello World!');
    });
  }

  setupSocketHandlers(serialController) {
    serialController.on('data', ({ port, message }) => {
      this.io.emit('serial-data', { port, message });
    });

    this.io.on('connection', (socket) => {
      logger.info(`Cliente conectado: ${socket.id}`);
      socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
      });
    });
  }

  start() {
    const host = config.get('server.host');
    const port = config.get('server.port');

    this.setupMiddlewares();
    this.setupRoutes();

    this.server.listen(port, host, () => {
      logger.info(`Servidor iniciado en http://${ip.address()}:${port}`);
    });
  }

  stop() {
    this.server.close(() => {
      logger.info('Servidor detenido.');
    });
    this.io.close();
  }
}

module.exports = AppServer;
