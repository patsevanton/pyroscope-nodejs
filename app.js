const Pyroscope = require('@pyroscope/nodejs');
const http = require('http');

// Инициализация Pyroscope
Pyroscope.init({
  serverAddress: process.env.PYROSCOPE_SERVER_ADDRESS || 'http://pyroscope-server:4040',
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

// Глобальный массив для утечки памяти
const memoryLeak = [];

// Создаем HTTP сервер с разными эндпоинтами для демонстрации
const server = http.createServer((req, res) => {
  if (req.url === '/fast') {
    fastRoute(req, res);
  } else if (req.url === '/slow') {
    slowRoute(req, res);
  } else if (req.url === '/leak') {
    leakMemoryRoute(req, res);
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

function leakMemoryRoute(req, res) {
  // Добавляем большие объекты в массив, который никогда не очищается
  for (let i = 0; i < 1000; i++) {
    memoryLeak.push({
      id: Date.now(),
      data: new Array(1000).fill('leak-data').join(''),
      timestamp: new Date().toISOString()
    });
  }

  res.writeHead(200);
  res.end(`Added 1000 objects to memory leak. Total: ${memoryLeak.length} objects\n`);
}

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
