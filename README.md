# pyroscope-nodejs

export YC_FOLDER_ID='ваша_folder_id'

terraform apply

helm repo add grafana https://grafana.github.io/helm-charts

helm repo update

kubectl create namespace pyroscope-test

yc managed-kubernetes cluster get-credentials --id xxxx --ваш_id_k8s --force

helm -n pyroscope-test install pyroscope grafana/pyroscope --values values_pyroscope.yaml

helm upgrade -n pyroscope-test --install grafana grafana/grafana   --set image.repository=grafana/grafana   --set image.tag=main   --set env.GF_INSTALL_PLUGINS=grafana-pyroscope-app   --set env.GF_AUTH_ANONYMOUS_ENABLED=true   --set env.GF_AUTH_ANONYMOUS_ORG_ROLE=Admin   --set ingress.enabled=true   --set ingress.annotations."kubernetes\.io/ingress\.class"=nginx   --set ingress.hosts[0]=grafana.apatsev.org.ru   --set ingress.paths[0]=/

helm -n pyroscope-test install pyroscope grafana/pyroscope --values values_pyroscope.yaml 
