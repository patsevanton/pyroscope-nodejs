# Тестирование pyroscope с nodejs

# Устанавливаем переменную окружения YC_FOLDER_ID, содержащую идентификатор вашей рабочей папки в Yandex Cloud
```shell
export YC_FOLDER_ID='ваша_folder_id'
```

# Применяем конфигурацию Terraform для создания инфраструктуры
```shell
terraform apply
```

# Получаем credentials (учетные данные) для доступа к управляемому Kubernetes кластеру в Yandex Cloud
# --id - идентификатор вашего кластера Kubernetes
# --force - принудительное обновление конфигурации, даже если она уже существует
```shell
yc managed-kubernetes cluster get-credentials --id xxxx --ваш_id_k8s --force
```

# Добавляем репозиторий Helm charts от Grafana в локальный список репозиториев
```shell
helm repo add grafana https://grafana.github.io/helm-charts
```

# Обновляем информацию о доступных charts во всех добавленных репозиториях Helm
```shell
helm repo update
```

# Устанавливаем Pyroscope в namespace 'pyroscope' используя Helm chart из репозитория Grafana
# -n - указывает namespace для установки
# --values - позволяет передать кастомные настройки из файла values_pyroscope.yaml
```shell
helm upgrade -n pyroscope --create-namespace --install pyroscope grafana/pyroscope --values values_pyroscope.yaml
```

# Устанавливаем/обновляем Grafana с настройками:
# - Анонимный доступ с правами Admin
# - Ingress для внешнего доступа
# - Плагин grafana-pyroscope-app
```shell
helm upgrade -n grafana --create-namespace --install grafana grafana/grafana -f values_grafana.yaml
```

Можно генерировать нагрузку для профилирования при запуске через docker-compose:
```shell
while true; do curl http://localhost:3000/fast; curl http://localhost:3000/slow; curl http://localhost:3000/leak; done
```

# Запускаем nodejs-app в kubernetes
```shell
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

Генерируем нагрузку для профилирования через kubernetes ingress:
```shell
while true; do curl nodejs-app.apatsev.org.ru/fast; curl nodejs-app.apatsev.org.ru/slow; curl nodejs-app.apatsev.org.ru/leak; done
```

После запуска нагрузки
```shell
k top pod
NAME                          CPU(cores)   MEMORY(bytes)   
nodejs-app-77f7b96899-gprd8   390m         2125Mi          
nodejs-app-77f7b96899-z9fs8   533m         4087Mi  
```

Скриншоты
