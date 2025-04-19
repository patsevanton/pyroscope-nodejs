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

# Создаем новый namespace (пространство имен) 'pyroscope-test' в кластере Kubernetes
# Namespace помогает изолировать ресурсы и управлять доступом
```shell
kubectl create namespace pyroscope-test
```

# Устанавливаем Pyroscope в namespace 'pyroscope-test' используя Helm chart из репозитория Grafana
# -n - указывает namespace для установки
# --values - позволяет передать кастомные настройки из файла values_pyroscope.yaml
```shell
helm -n pyroscope-test install pyroscope grafana/pyroscope --values values_pyroscope.yaml
```

# Устанавливаем/обновляем Grafana с настройками:
# - Анонимный доступ с правами Admin
# - Ingress для внешнего доступа
# - Плагин grafana-pyroscope-app
```shell
helm upgrade -n pyroscope-test --install grafana grafana/grafana \
--set image.repository=grafana/grafana \
--set image.tag=main \
--set env.GF_INSTALL_PLUGINS=grafana-pyroscope-app \
--set env.GF_AUTH_ANONYMOUS_ENABLED=true \
--set env.GF_AUTH_ANONYMOUS_ORG_ROLE=Admin \
--set ingress.enabled=true \
--set ingress.annotations."kubernetes\.io/ingress\.class"=nginx \
--set ingress.hosts[0]=grafana.apatsev.org.ru \
--set ingress.paths[0]=/
```
