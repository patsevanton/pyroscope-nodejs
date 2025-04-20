# Профилирование Node.js приложения с помощью Pyroscope (без автоинструментирования)

**Pyroscope** — это мощный инструмент непрерывного профилирования, созданный для мониторинга производительности приложений в реальном времени. В этой статье мы рассмотрим, как быстро развернуть Pyroscope, подключить к нему Node.js приложение и проанализировать поведение кода без использования Grafana Alloy.


## Что такое Pyroscope?

[Pyroscope](https://github.com/grafana/pyroscope) — это open-source решение от Grafana Labs для профилирования производительности, которое позволяет:

- отслеживать использование CPU, памяти и других ресурсов в реальном времени;
- поддерживать профилирование для языков Go, Python, Java, Ruby, Node.js и др.;
- сравнивать профили за разные промежутки времени;
- интегрироваться с Grafana, Kubernetes и другими инструментами мониторинга.


## Цель эксперимента

В рамках этого примера мы:
- Запустим Pyroscope как в Docker, так и в Kubernetes (включая Yandex Cloud).
- Подключим тестовое Node.js приложение с преднамеренно медленной функцией и функцией с утечкой памяти.
- Сгенерируем нагрузку и проанализируем результаты профилирования.

> **Важно:** Grafana Alloy в этом примере **не используется** — данные отправляются напрямую из Node.js приложения в Pyroscope.


## Быстрый старт с Docker Compose
```shell
docker-compose up -d
```
Для начала можно запустить нагрузку локально, имитируя активность пользователя:

```bash
while true; do \
  curl http://localhost:3000/fast; \
  curl http://localhost:3000/slow; \
  curl http://localhost:3000/leak; \
done
```

## Развёртывание в Kubernetes (Yandex Cloud)

### 1. Клонируем репозиторий с конфигурацией

```bash
git clone https://github.com/patsevanton/pyroscope-nodejs
cd pyroscope-nodejs
```

### 2. Настраиваем инфраструктуру через Terraform

```bash
export YC_FOLDER_ID='ваш_folder_id'
terraform apply
```

Получаем доступ к кластеру:

```bash
yc managed-kubernetes cluster get-credentials --id xxxx --force
```

## Установка Pyroscope и Grafana через Helm

### Добавляем Helm репозиторий Grafana

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### Устанавливаем Pyroscope

```bash
helm upgrade -n pyroscope --create-namespace --install pyroscope \
  grafana/pyroscope --values values_pyroscope.yaml
```

### Устанавливаем Grafana с поддержкой Pyroscope

```bash
helm upgrade -n grafana --create-namespace --install grafana \
  grafana/grafana -f values_grafana.yaml
```


## Развёртывание Node.js приложения

Приложение содержит три эндпоинта:
- `/fast` — быстрый ответ,
- `/slow` — медленная функция,
- `/leak` — функция с утечкой памяти.

### Деплой в Kubernetes

```bash
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
```


## Генерация нагрузки

После деплоя можно запустить нагрузку через Ingress:

```bash
while true; do \
  curl nodejs-app.apatsev.org.ru/fast; \
  curl nodejs-app.apatsev.org.ru/slow; \
  curl nodejs-app.apatsev.org.ru/leak; \
done
```

## Мониторинг использования ресурсов

Проверим, сколько памяти потребляют pod-ы:

```bash
kubectl top pod
```

Пример вывода:

```
NAME                          CPU(cores)   MEMORY(bytes)   
nodejs-app-77f7b96899-7cff6   19m          1652Mi          
nodejs-app-77f7b96899-hvfrl   32m          1676Mi 
```

## Анализ профиля

Pyroscope предоставляет как собственный web-интерфейс, так и интеграцию с Grafana. Вот как это выглядит:

### Встроенный UI Pyroscope

![UI 1](https://habrastorage.org/webt/zk/3l/at/zk3latbwghzaxdnuyezha0mx7zc.png)
![UI 2](https://habrastorage.org/webt/5r/p0/_w/5rp0_wgdcnili5ytzo-ovv1bib8.png)

### Pyroscope в Grafana

![Grafana 1](https://habrastorage.org/webt/jc/dl/jj/jcdljjhrd7qfjxcpmi3vc6jwkns.png)
![Grafana 2](https://habrastorage.org/webt/dc/sz/ir/dcszirjryh_ugttlhdnraq6m7fk.png)
![Grafana 3](https://habrastorage.org/webt/nc/qx/ve/ncqxveh6g1lo6xndhcg_mb46fwy.png)
![Grafana 4](https://habrastorage.org/webt/z3/ou/ud/z3ouudbzmayznipiak-5w7frvjc.png)
![Grafana 5](https://habrastorage.org/webt/3g/fu/87/3gfu87hmdm1h-ckgh6d6tzsellu.png)

## Что показывает профилирование?

После анализа профиля можно сделать следующие выводы:

- **Функция `leakMemoryRoute`** в файле `./app.js` на строке **63** потребляет **223 MB** — явная утечка памяти.
- **Функция `slowRoute`** на строке **51** работает **почти 7 минут** — требует оптимизации.

## Заключение
Pyroscope — это отличный инструмент для разработчиков, стремящихся понять и улучшить производительность своих приложений. Благодаря простой интеграции с Node.js и Kubernetes, вы можете быстро выявлять узкие места и принимать обоснованные решения по оптимизации.

