#!/bin/bash

# Database Backup Script for Roomy Backend V2
# This script creates automated backups of the PostgreSQL database

# Configuration
DB_NAME="roomy_db_v2"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/roomy_backup_${DATE}.sql"
RETENTION_DAYS=30

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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump is not installed or not in PATH"
    exit 1
fi

# Check if database is accessible
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
    error "Cannot connect to database at $DB_HOST:$DB_PORT"
    exit 1
fi

log "Starting database backup..."

# Create backup
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 \
    --file="${BACKUP_FILE}.dump"; then
    
    log "Database backup completed successfully: ${BACKUP_FILE}.dump"
    
    # Also create a plain SQL backup for easier inspection
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --no-password \
        --format=plain \
        --file="$BACKUP_FILE"; then
        
        log "Plain SQL backup created: $BACKUP_FILE"
    else
        warning "Failed to create plain SQL backup"
    fi
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.dump" | cut -f1)
    log "Backup size: $BACKUP_SIZE"
    
else
    error "Database backup failed"
    exit 1
fi

# Clean up old backups (keep only last 30 days)
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "roomy_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "roomy_backup_*.dump" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "roomy_backup_*.dump" -type f | wc -l)
log "Total backups retained: $BACKUP_COUNT"

log "Backup process completed successfully!"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# if command -v aws &> /dev/null; then
#     log "Uploading backup to S3..."
#     aws s3 cp "${BACKUP_FILE}.dump" "s3://your-backup-bucket/roomy-backups/"
#     if [ $? -eq 0 ]; then
#         log "Backup uploaded to S3 successfully"
#     else
#         warning "Failed to upload backup to S3"
#     fi
# fi
