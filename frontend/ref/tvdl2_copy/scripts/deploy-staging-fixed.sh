#!/bin/bash

# Deploy ViralPeek to Staging with Image Fixes
# Usage: ./deploy-staging-fixed.sh

set -e

echo "🚀 Deploying ViralPeek to Staging with Image Fixes"
echo "📦 Building Docker image..."

# Build new image with fixes
docker build -t registry.viralpeek.site/viralpeek-app:stg-image-fix .

# Push to registry
echo "📤 Pushing image to registry..."
docker push registry.viralpeek.site/viralpeek-app:stg-image-fix

# Deploy to staging
echo "🎯 Deploying to staging..."
cd helm
./deploy-staging.sh stg-image-fix

echo "✅ Deployment with image fixes completed!"
echo "🔧 Test the image debugger on staging: https://stg.trendiefox.com"
echo "📊 Check deployment status:"
echo "   kubectl get pods -n viralpeek-staging"
echo "   kubectl logs -n viralpeek-staging -l app.kubernetes.io/name=viralpeek --tail=50"