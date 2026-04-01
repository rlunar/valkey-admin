# Minikube test flow

This flow keeps the Kubernetes changes in repo-managed files and applies them iteratively.

## 1. Build images into Minikube

```bash
eval $(minikube docker-env)
docker build -f docker/Dockerfile.server -t valkey-admin-app:test .
docker build -f docker/Dockerfile.metrics -t valkey-admin-metrics:test .
```

## 2. Deploy the app

```bash
kubectl apply -f k8s/app.yaml
kubectl rollout status deployment/valkey-admin-app -n valkey
```

## 3. Create the metrics config

```bash
kubectl apply -n valkey -f k8s/metrics-configmap.yaml
```

## 4. Patch the existing Helm-managed StatefulSet

```bash
kubectl patch statefulset valkey \
  -n valkey \
  --type strategic \
  --patch-file k8s/valkey-statefulset-sidecar-patch.yaml
```

## 5. Watch rollout

```bash
kubectl rollout status statefulset/valkey -n valkey
kubectl get pods -n valkey
```

Expected result: each Valkey pod becomes `2/2`.

## 6. Verify sidecar registration

```bash
kubectl logs -n valkey valkey-0 -c metrics
kubectl logs -n valkey deploy/valkey-admin-app -f
```

Expected signals:

- metrics logs show `Register success`
- app logs stop showing local metrics spawn attempts

## 7. Iterate from repo files

If you need to change the sidecar config, edit:

- `k8s/valkey-statefulset-sidecar-patch.yaml`
- `k8s/metrics-configmap.yaml`
- `k8s/app.yaml`

Then reapply:

```bash
kubectl apply -f k8s/app.yaml
kubectl apply -n valkey -f k8s/metrics-configmap.yaml
kubectl patch statefulset valkey \
  -n valkey \
  --type strategic \
  --patch-file k8s/valkey-statefulset-sidecar-patch.yaml
```
