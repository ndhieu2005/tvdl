#!/bin/bash

# Test build script to verify fixes
# Usage: ./test-build.sh

set -e

echo "🧪 Testing build fixes..."

# Test npm install with current configuration
echo "📦 Testing npm install..."
npm install --legacy-peer-deps

# Test Next.js build
echo "🏗️  Testing Next.js build..."
npm run build

# Test Docker build (if Docker is available)
if command -v docker &> /dev/null; then
    echo "🐳 Testing Docker build..."
    docker build -t viralpeek-test:latest .
    echo "✅ Docker build successful!"
else
    echo "⚠️  Docker not available, skipping Docker build test"
fi

echo "✅ All tests passed!"
echo "🚀 Ready for deployment!"