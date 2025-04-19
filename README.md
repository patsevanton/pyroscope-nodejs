# Запуск pyroscope. Профилирование простого nodejs проекта

[Pyroscope](https://github.com/grafana/pyroscope) — это инструмент для непрерывного профилирования кода, который помогает находить узкие места в производительности приложений.

Основные особенности:
- Анализирует CPU, память и другие метрики в реальном времени.
- Поддерживает несколько языков (Go, Python, Java, Ruby и др.).
- Интегрируется с Grafana, Kubernetes и другими инструментами мониторинга.
- Позволяет сравнивать профили за разные периоды.
- Используется для оптимизации производительности сервисов.

В этом посте будет продемонстрирован запуск pyroscope в docker-compose и в kubernetes.
Затем будет запущено тестовое NodeJS приложение со специально написанными медленной функцией и функцией с утечкой памяти.  

# Быстрый запуск kubernetes в Yandex Cloud
```shell
git clone https://github.com/patsevanton/pyroscope-nodejs
export YC_FOLDER_ID='ваша_folder_id'
terraform apply
yc managed-kubernetes cluster get-credentials --id xxxx --force
```

# Добавляем репозиторий Helm charts от Grafana в локальный список репозиториев
```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

# Устанавливаем Pyroscope в namespace 'pyroscope' используя Helm chart из репозитория Grafana
# Передаем кастомные настройки из файла values_pyroscope.yaml
```shell
helm upgrade -n pyroscope --create-namespace --install pyroscope grafana/pyroscope --values values_pyroscope.yaml
```

# Устанавливаем/обновляем Grafana с настройками:
# Передаем кастомные настройки из файла values_pyroscope.yaml
```shell
helm upgrade -n grafana --create-namespace --install grafana grafana/grafana -f values_grafana.yaml
```

# Можно генерировать нагрузку для профилирования при запуске через docker-compose:
```shell
while true; do curl http://localhost:3000/fast; curl http://localhost:3000/slow; curl http://localhost:3000/leak; done
```

# Запускаем nodejs-app в kubernetes
```shell
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## Генерируем нагрузку для профилирования через kubernetes ingress:
```shell
while true; do curl nodejs-app.apatsev.org.ru/fast; curl nodejs-app.apatsev.org.ru/slow; curl nodejs-app.apatsev.org.ru/leak; done
```

## После запуска нагрузки
```shell
k top pod
NAME                          CPU(cores)   MEMORY(bytes)   
nodejs-app-77f7b96899-gprd8   390m         2125Mi          
nodejs-app-77f7b96899-z9fs8   533m         4087Mi  
```

## Скриншоты
