#!/bin/bash

# Build Ultra-Minimal Docker image - Target: <300MB
# Usage: ./build-docker-minimal.sh [IMAGE_TAG] [IMAGE_NAME]

set -e

IMAGE_TAG=${1:-"1.0-minimal"}
IMAGE_NAME=${2:-"test-minimal"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Building ULTRA-MINIMAL Docker image"
echo "📦 Image Name: ${IMAGE_NAME}" 
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo "📦 Full Image: ${FULL_IMAGE_NAME}"
echo "🎯 Target: <300MB (64% reduction from 834MB)"

# Build with ultra-minimal Dockerfile
echo "🏗️  Building with ultra-minimal dependencies..."
docker build \
    --tag "${FULL_IMAGE_NAME}" \
    --file Dockerfile.ultra-minimal \
    .

if [ $? -eq 0 ]; then
    echo "✅ Ultra-minimal Docker image built successfully!"
    
    # Show size comparison
    echo ""
    echo "📊 Image Size Comparison:"
    echo "Original image (test:1.0):"
    docker images test:1.0 --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "Original image not found"
    echo ""
    echo "Ultra-minimal image:"
    docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    # Calculate reduction
    OLD_SIZE=$(docker images test:1.0 --format "{{.Size}}" 2>/dev/null | sed 's/MB//' || echo "834")
    NEW_SIZE=$(docker images "${FULL_IMAGE_NAME}" --format "{{.Size}}" | sed 's/MB//')
    
    echo ""
    echo "📈 Optimization Results:"
    echo "   Original size: ${OLD_SIZE}MB"
    echo "   Minimal size: ${NEW_SIZE}"
    if [[ "$NEW_SIZE" =~ ^[0-9]+$ ]] && [[ "$OLD_SIZE" =~ ^[0-9]+$ ]]; then
        REDUCTION=$(echo "scale=1; (($OLD_SIZE - $NEW_SIZE) / $OLD_SIZE) * 100" | bc -l 2>/dev/null || echo "N/A")
        echo "   Size reduction: ${REDUCTION}%"
    fi
    
    echo ""
    echo "🚀 Ready to use:"
    echo "   docker run -p 3009:3000 ${FULL_IMAGE_NAME}"
    
    echo ""
    echo "💡 Ultra-minimal optimizations:"
    echo "   ✓ Reduced dependencies from 41 to 21"
    echo "   ✓ Removed unnecessary @types packages"
    echo "   ✓ Removed unused UI components"
    echo "   ✓ Removed development tools"
    echo "   ✓ Multi-stage build with cleanup"
    echo "   ✓ Minimal Alpine base"
    echo "   ✓ dumb-init for signals"
    
else
    echo "❌ Failed to build ultra-minimal image"
    exit 1
fi