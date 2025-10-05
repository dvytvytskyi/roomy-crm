#!/bin/bash

# Database Restore Script for Roomy Backend V2
# This script restores the PostgreSQL database from a backup

# Configuration
DB_NAME="roomy_db_v2"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS] BACKUP_FILE"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -l, --list     List available backups"
    echo "  -f, --force    Force restore without confirmation"
    echo ""
    echo "Examples:"
    echo "  $0 --list"
    echo "  $0 roomy_backup_20240101_120000.dump"
    echo "  $0 --force roomy_backup_20240101_120000.dump"
    exit 1
}

# Function to list available backups
list_backups() {
    log "Available backups in $BACKUP_DIR:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"/roomy_backup_*.dump 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        warning "Backup directory $BACKUP_DIR does not exist"
    fi
}

# Parse command line arguments
FORCE=false
BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -l|--list)
            list_backups
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            else
                error "Multiple backup files specified"
                exit 1
            fi
            shift
            ;;
    esac
done

# Check if backup file is specified
if [ -z "$BACKUP_FILE" ]; then
    error "No backup file specified"
    usage
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try to find the backup in the backup directory
    if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
        error "Also checked: $BACKUP_DIR/$BACKUP_FILE"
        list_backups
        exit 1
    else
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    fi
fi

# Check if pg_restore is available
if ! command -v pg_restore &> /dev/null; then
    error "pg_restore is not installed or not in PATH"
    exit 1
fi

# Check if database is accessible
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
    error "Cannot connect to database at $DB_HOST:$DB_PORT"
    exit 1
fi

log "Preparing to restore database from: $BACKUP_FILE"

# Show backup file info
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" 2>/dev/null || stat -f %Sm "$BACKUP_FILE" 2>/dev/null)
log "Backup size: $BACKUP_SIZE"
log "Backup date: $BACKUP_DATE"

# Confirmation prompt (unless --force is used)
if [ "$FORCE" = false ]; then
    warning "This will DROP and recreate the database '$DB_NAME'"
    warning "All current data will be LOST!"
    echo -n "Are you sure you want to continue? (yes/no): "
    read -r confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

log "Starting database restore..."

# Drop and recreate database
log "Dropping existing database..."
if dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null; then
    log "Database dropped successfully"
else
    warning "Database may not exist or could not be dropped"
fi

log "Creating new database..."
if createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"; then
    log "Database created successfully"
else
    error "Failed to create database"
    exit 1
fi

# Restore from backup
log "Restoring data from backup..."
if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --no-password \
    --clean \
    --if-exists \
    "$BACKUP_FILE"; then
    
    log "Database restore completed successfully!"
    
    # Run Prisma migrations to ensure schema is up to date
    log "Running Prisma migrations..."
    if npx prisma migrate deploy; then
        log "Prisma migrations completed successfully"
    else
        warning "Prisma migrations failed - you may need to run them manually"
    fi
    
    # Generate Prisma client
    log "Generating Prisma client..."
    if npx prisma generate; then
        log "Prisma client generated successfully"
    else
        warning "Failed to generate Prisma client"
    fi
    
else
    error "Database restore failed"
    exit 1
fi

log "Database restore process completed successfully!"
log "You can now start your application with the restored data."
