// Импорт необходимых модулей
const Pyroscope = require('@pyroscope/nodejs'); // Модуль для профилирования
const http = require('http'); // Нативный HTTP модуль Node.js

// Инициализация Pyroscope для сбора метрик производительности
Pyroscope.init({
  // Адрес сервера Pyroscope (берется из переменных окружения или используется значение по умолчанию)
  serverAddress: process.env.PYROSCOPE_SERVER_ADDRESS || 'http://pyroscope-server:4040',
  // Имя приложения для идентификации в Pyroscope
  appName: 'nodejs-example-app',
  // Теги для дополнительной классификации данных
  tags: {
    environment: 'development', // Среда выполнения (разработка)
    version: '1.0.0'           // Версия приложения
  },
  // Настройки сбора данных о процессорном времени
  wall: {
    collectCpuTime: true // Включаем сбор данных о времени CPU
  }
});

// Запуск сбора метрик
Pyroscope.start();

// Глобальный массив для демонстрации утечки памяти
const memoryLeak = [];

// Создаем HTTP сервер с разными эндпоинтами для демонстрации различных сценариев
const server = http.createServer((req, res) => {
  // Маршрутизация запросов
  if (req.url === '/fast') {
    fastRoute(req, res);       // Быстрый эндпоинт
  } else if (req.url === '/slow') {
    slowRoute(req, res);       // Медленный эндпоинт (искусственная нагрузка)
  } else if (req.url === '/leak') {
    leakMemoryRoute(req, res); // Эндпоинт с утечкой памяти
  } else {
    // Дефолтный эндпоинт
    res.writeHead(200);
    res.end('Hello from Node.js!\n');
  }
});

// Обработчик быстрого маршрута
function fastRoute(req, res) {
  res.writeHead(200);
  res.end('Fast response!\n'); // Простой быстрый ответ
}

// Обработчик медленного маршрута
function slowRoute(req, res) {
  // Искусственно создаем CPU нагрузку для демонстрации профилирования
  let sum = 0;
  for (let i = 0; i < 100000000; i++) {
    sum += Math.random(); // Тяжелые вычисления
  }

  res.writeHead(200);
  res.end(`Slow response! Sum: ${sum}\n`);
}

// Обработчик маршрута с утечкой памяти
function leakMemoryRoute(req, res) {
  // Добавляем большие объекты в глобальный массив, который никогда не очищается
  for (let i = 0; i < 1000; i++) {
    memoryLeak.push({
      id: Date.now(), // Уникальный идентификатор
      data: new Array(1000).fill('leak-data').join(''), // Большая строка
      timestamp: new Date().toISOString() // Временная метка
    });
  }

  res.writeHead(200);
  res.end(`Added 1000 objects to memory leak. Total: ${memoryLeak.length} objects\n`);
}

// Запуск сервера на порту 3000
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
