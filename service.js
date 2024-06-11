const Service = require('node-windows').Service;
const path = require('path');

console.log("INICIANDO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

const svc = new Service({
  name: 'PPG-API-SOCKETS',
  description: 'Descripción del servicio',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: ['--trace-warnings'],
  logpath: path.join(__dirname, 'logs')
});

svc.on('install', function () {
  console.log("started");
  svc.start();
});

if (process.argv[2] === '--install') {
  svc.install();
} else if (process.argv[2] === '--uninstall') {
  svc.uninstall();
}
