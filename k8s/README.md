# Kubernetes layout

This repo now supports a split Kubernetes deployment model:

- `valkey` runs in a `StatefulSet`
- `metrics` runs as a sidecar in the same pod as each Valkey node
- `frontend + server` stay together in a separate `Deployment`

## Images

Build the app deployment image:

```bash
docker build -f docker/Dockerfile.server -t your-registry/valkey-admin-app:latest .
```

Build the metrics sidecar image:

```bash
docker build -f docker/Dockerfile.metrics -t your-registry/valkey-admin-metrics:latest .
```

The existing non-kubernetes image remains available at `docker/Dockerfile.app`.

## Apply manifests

```bash
kubectl apply -f k8s/metrics-configmap.yaml
kubectl apply -f k8s/valkey-statefulset.yaml
kubectl apply -f k8s/app.yaml
```

If you already have a Helm-managed Valkey cluster, use the repo patch flow in [minikube-test.md](./minikube-test.md) instead of applying `k8s/valkey-statefulset.yaml`.

## Required runtime contract

The important Kubernetes-specific env vars for the metrics sidecar are:

- `VALKEY_HOST` / `VALKEY_PORT`: where the sidecar connects to Valkey, and also the identity it registers back to the app server. In this k8s layout that should match the hostname and port that Valkey advertises for the pod.
- `METRICS_ADVERTISE_HOST` / `METRICS_ADVERTISE_PORT`: the reachable address that the app server should call for metrics APIs. In Kubernetes this should usually be the pod IP and the sidecar container port.
- `SERVER_HOST` / `SERVER_PORT`: how the sidecar reaches the app deployment service.

## Notes

- The sample `StatefulSet` assumes Valkey advertises pod DNS names through the headless service.
- Cluster bootstrap and persistence details may need to be adapted to your existing Valkey topology and storage class.
- The app deployment only needs one reachable Valkey node in `VALKEY_HOST` / `VALKEY_PORT`; it uses that to discover the rest of the cluster.
