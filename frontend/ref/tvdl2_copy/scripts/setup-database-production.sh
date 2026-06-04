#!/bin/bash

# Script setup database production
# Tạo database và chạy migration lần đầu

set -e

echo "🗄️  SETUP DATABASE PRODUCTION"
echo "============================="

# Database configuration (MySQL)
DB_HOST="${MYSQL_DB_HOST:-db}"
DB_PORT="${MYSQL_DB_PORT:-3306}"
DB_NAME="${MYSQL_DB_NAME:-tvdl2}"
DB_USER="${MYSQL_USER:-admin}"
DB_PASSWORD="${MYSQL_PASSWORD:-Admin@12}"

# Parse arguments
CREATE_DB=false
RUN_MIGRATION=false
RUN_SEED=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --create-db)
            CREATE_DB=true
            shift
            ;;
        --run-migration)
            RUN_MIGRATION=true
            shift
            ;;
        --run-seed)
            RUN_SEED=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --create-db      Create database if not exists"
            echo "  --run-migration  Run Prisma migration"
            echo "  --run-seed       Run seed after migration"
            echo "  --dry-run        Show what would be done"
            echo "  --help           Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "📋 Configuration:"
echo "   Database Type: MySQL"
echo "   Database Host: $DB_HOST"
echo "   Database Port: $DB_PORT"
echo "   Database Name: $DB_NAME"
echo "   Database User: $DB_USER"
echo "   Create DB: $CREATE_DB"
echo "   Run Migration: $RUN_MIGRATION"
echo "   Run Seed: $RUN_SEED"
echo "   Dry Run: $DRY_RUN"
echo ""

# Test database connection
echo "🔗 Testing MySQL database connection..."
if [ "$DRY_RUN" = false ]; then
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database server connection successful"
    else
        echo "❌ Cannot connect to database server"
        echo "💡 Make sure:"
        echo "   - MySQL server is running"
        echo "   - Credentials are correct"
        echo "   - Network is accessible"
        echo "   - Password is correct: $DB_PASSWORD"
        exit 1
    fi
else
    echo "🎯 DRY RUN: Would test MySQL database connection"
fi

# Create database if requested
if [ "$CREATE_DB" = true ]; then
    echo "🏗️  Creating database..."
    if [ "$DRY_RUN" = false ]; then
        # Check if database exists
        if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" > /dev/null 2>&1; then
            echo "✅ Database '$DB_NAME' already exists"
        else
            echo "🔨 Creating database '$DB_NAME'..."
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            echo "✅ Database '$DB_NAME' created successfully"
        fi
    else
        echo "🎯 DRY RUN: Would create database '$DB_NAME'"
    fi
fi

# Test connection to target database
echo "🔍 Testing connection to target database..."
if [ "$DRY_RUN" = false ]; then
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Target database connection successful"
    else
        echo "❌ Cannot connect to target database '$DB_NAME'"
        echo "💡 Try running with --create-db flag"
        exit 1
    fi
else
    echo "🎯 DRY RUN: Would test target database connection"
fi

# Run migration if requested
if [ "$RUN_MIGRATION" = true ]; then
    echo "🔧 Running Prisma migration..."
    if [ "$DRY_RUN" = false ]; then
        # Check if we have DATABASE_URL
        if [ -z "$DATABASE_URL" ]; then
            echo "⚠️  DATABASE_URL not set, constructing from components..."
            export DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
        fi
        
        echo "🔍 Checking migration status..."
        npx prisma migrate status
        
        echo "🚀 Deploying migrations..."
        npx prisma migrate deploy
        
        echo "✅ Migration completed successfully!"
        
        # Show tables
        echo "📊 Database tables:"
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES;"
    else
        echo "🎯 DRY RUN: Would run Prisma migration"
    fi
fi

# Run seed if requested
if [ "$RUN_SEED" = true ]; then
    echo "🌱 Running database seed..."
    if [ "$DRY_RUN" = false ]; then
        # Use production seed
        npm run db:seed:prod
        echo "✅ Seed completed successfully!"
    else
        echo "🎯 DRY RUN: Would run database seed"
    fi
fi

echo ""
echo "🎉 Database setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy application: ./helm/deploy-production.sh"
echo "   2. Check deployment: kubectl get pods -n viralpeek-prd"
echo "   3. Test application: curl -I https://trendiefox.com"
echo ""
echo "🆘 If you need help:"
echo "   - Check logs: kubectl logs -n viralpeek-prd -l app.kubernetes.io/name=viralpeek"
echo "   - Check database: mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -D $DB_NAME"
echo "   - Recovery: npm run db:recovery"