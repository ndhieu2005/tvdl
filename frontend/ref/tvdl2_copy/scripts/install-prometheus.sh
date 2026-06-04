#!/bin/bash

# Install Prometheus Operator for monitoring
# This script installs Prometheus Operator to enable ServiceMonitor

set -e

echo "🔧 Installing Prometheus Operator..."

# Add prometheus-community helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create monitoring namespace
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Install kube-prometheus-stack (includes Prometheus Operator)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.enabled=true \
  --set grafana.adminPassword="admin123" \
  --wait

echo "✅ Prometheus Operator installed successfully!"
echo "📊 Grafana dashboard: http://localhost:3000 (admin/admin123)"
echo "📈 Prometheus UI: http://localhost:9090"
echo ""
echo "🚀 Now you can enable ServiceMonitor in your values.yaml"