const Pyroscope = require('@pyroscope/nodejs');
const http = require('http');

// Инициализация Pyroscope
Pyroscope.init({
  serverAddress: 'http://pyroscope-server:4040',
  appName: 'nodejs-example-app',
  tags: {
    environment: 'development',
    version: '1.0.0'
  },
  wall: {
    collectCpuTime: true
  }
});

Pyroscope.start();

// Создаем HTTP сервер с разными эндпоинтами для демонстрации
const server = http.createServer((req, res) => {
  if (req.url === '/fast') {
    fastRoute(req, res);
  } else if (req.url === '/slow') {
    slowRoute(req, res);
  } else {
    res.writeHead(200);
    res.end('Hello from Node.js!\n');
  }
});

function fastRoute(req, res) {
  res.writeHead(200);
  res.end('Fast response!\n');
}

function slowRoute(req, res) {
  // Искусственно создаем нагрузку для профилирования
  let sum = 0;
  for (let i = 0; i < 100000000; i++) {
    sum += Math.random();
  }

  res.writeHead(200);
  res.end(`Slow response! Sum: ${sum}\n`);
}

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
