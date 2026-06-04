#!/bin/bash

# Monitor ViralPeek deployment
# Usage: ./monitor-deployment.sh [ENVIRONMENT]

set -e

ENVIRONMENT=${1:-"production"}

if [ "$ENVIRONMENT" = "production" ]; then
  NAMESPACE="viralpeek-prod"
  URL="https://viralpeek.site"
elif [ "$ENVIRONMENT" = "staging" ]; then
  NAMESPACE="viralpeek-staging"
  URL="https://stg.viralpeek.site"
else
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Valid environments: production, staging"
  exit 1
fi

echo "📊 Monitoring ViralPeek deployment in $ENVIRONMENT"
echo "🏷️  Namespace: $NAMESPACE"
echo "🌐 URL: $URL"

# Check deployment status
echo "🚀 Deployment Status:"
kubectl get deployment -n $NAMESPACE -l app.kubernetes.io/name=viralpeek

# Check pods
echo "🐳 Pods Status:"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=viralpeek

# Check services
echo "🌐 Services:"
kubectl get svc -n $NAMESPACE -l app.kubernetes.io/name=viralpeek

# Check ingress
echo "🔗 Ingress:"
kubectl get ingress -n $NAMESPACE -l app.kubernetes.io/name=viralpeek

# Health check
echo "🏥 Health Check:"
if curl -s -f "$URL/api/health" > /dev/null; then
  echo "✅ Health check passed"
  curl -s "$URL/api/health" | jq .
else
  echo "❌ Health check failed"
fi

# Get recent logs
echo "📝 Recent Logs (last 50 lines):"
kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=viralpeek --tail=50

# HPA status (if enabled)
if kubectl get hpa -n $NAMESPACE -l app.kubernetes.io/name=viralpeek &> /dev/null; then
  echo "📈 HPA Status:"
  kubectl get hpa -n $NAMESPACE -l app.kubernetes.io/name=viralpeek
fi

echo "✅ Monitoring completed"