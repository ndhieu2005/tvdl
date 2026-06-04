# Scripts Directory

This directory contains build and deployment scripts for the ViralPeek application.

## Docker Build Scripts

### build-docker-staging.sh
Builds Docker image for staging environment.

**Usage:**
```bash
./scripts/build-docker-staging.sh [IMAGE_TAG] [IMAGE_NAME]
```

**Examples:**
```bash
# Default tag and registry
./scripts/build-docker-staging.sh

# Custom tag
./scripts/build-docker-staging.sh stg-v1.0.0

# Custom tag and registry
./scripts/build-docker-staging.sh stg-v1.0.0 my-registry.com/viralpeek-app
```

### build-docker-production.sh
Builds Docker image for production environment.

**Usage:**
```bash
./scripts/build-docker-production.sh [IMAGE_TAG] [IMAGE_NAME]
```

**Examples:**
```bash
# Default tag and registry
./scripts/build-docker-production.sh

# Custom tag
./scripts/build-docker-production.sh v1.0.0

# Custom tag and registry
./scripts/build-docker-production.sh v1.0.0 my-registry.com/viralpeek-app
```

### build-docker-helper.sh
Helper script that can build for both environments.

**Usage:**
```bash
./scripts/build-docker-helper.sh [ENVIRONMENT] [IMAGE_TAG] [IMAGE_NAME]
```

**Examples:**
```bash
# Build for staging
./scripts/build-docker-helper.sh staging stg-v1.0.0

# Build for production
./scripts/build-docker-helper.sh production v1.0.0

# Build with custom registry
./scripts/build-docker-helper.sh stg latest my-registry.com/viralpeek-app
```

## Environment Variables

### Staging (.env.staging)
```bash
DATABASE_URL=postgresql://...
STORAGE_ENDPOINT=https://...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=...
NEXT_PUBLIC_SITE_URL=https://stg.trendiefox.com
NEXT_PUBLIC_ENVIRONMENT=staging
NODE_ENV=production
```

### Production (.env.production)
```bash
DATABASE_URL=postgresql://...
STORAGE_ENDPOINT=https://...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=...
NEXT_PUBLIC_SITE_URL=https://trendiefox.com
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

## Default Values

| Parameter | Staging Default | Production Default |
|-----------|-----------------|-------------------|
| IMAGE_TAG | stg-latest | latest |
| IMAGE_NAME | registry.viralpeek.site/viralpeek-app | registry.viralpeek.site/viralpeek-app |

## Prerequisites

1. Docker installed and running
2. Docker registry access configured
3. Environment files (`.env.staging` or `.env.production`) present in project root
4. All scripts have executable permissions:
   ```bash
   chmod +x scripts/*.sh
   ```

## Notes

- Scripts will push to registry after successful build
- Build failures will exit with non-zero code
- Environment variables are loaded from respective `.env` files
- All scripts include comprehensive logging and error handling