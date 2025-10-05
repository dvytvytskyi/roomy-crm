#!/bin/bash

# Setup Automated Backup Cron Job for Roomy Backend V2
# This script sets up automated daily backups using cron

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-database.sh"
CRON_SCHEDULE="0 2 * * *"  # Daily at 2:00 AM
CRON_COMMENT="Roomy Database Backup"

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
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -r, --remove   Remove existing backup cron job"
    echo "  -s, --status   Show current backup cron job status"
    echo "  -t, --test     Test backup script"
    echo ""
    echo "This script will set up automated daily database backups at 2:00 AM"
    exit 1
}

# Function to check if backup script exists and is executable
check_backup_script() {
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        error "Backup script not found: $BACKUP_SCRIPT"
        exit 1
    fi
    
    if [ ! -x "$BACKUP_SCRIPT" ]; then
        log "Making backup script executable..."
        chmod +x "$BACKUP_SCRIPT"
    fi
}

# Function to test backup script
test_backup_script() {
    log "Testing backup script..."
    if "$BACKUP_SCRIPT"; then
        log "Backup script test completed successfully"
    else
        error "Backup script test failed"
        exit 1
    fi
}

# Function to add cron job
add_cron_job() {
    log "Adding backup cron job..."
    
    # Create cron job entry
    CRON_ENTRY="$CRON_SCHEDULE $BACKUP_SCRIPT >> /var/log/roomy-backup.log 2>&1 # $CRON_COMMENT"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$CRON_COMMENT"; then
        warning "Backup cron job already exists"
        log "Current backup cron jobs:"
        crontab -l 2>/dev/null | grep "$CRON_COMMENT"
        return 0
    fi
    
    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    
    if [ $? -eq 0 ]; then
        log "Backup cron job added successfully"
        log "Schedule: $CRON_SCHEDULE (Daily at 2:00 AM)"
        log "Script: $BACKUP_SCRIPT"
        log "Logs: /var/log/roomy-backup.log"
    else
        error "Failed to add cron job"
        exit 1
    fi
}

# Function to remove cron job
remove_cron_job() {
    log "Removing backup cron job..."
    
    # Check if cron job exists
    if ! crontab -l 2>/dev/null | grep -q "$CRON_COMMENT"; then
        warning "No backup cron job found"
        return 0
    fi
    
    # Remove cron job
    crontab -l 2>/dev/null | grep -v "$CRON_COMMENT" | crontab -
    
    if [ $? -eq 0 ]; then
        log "Backup cron job removed successfully"
    else
        error "Failed to remove cron job"
        exit 1
    fi
}

# Function to show cron job status
show_cron_status() {
    log "Current backup cron jobs:"
    
    if crontab -l 2>/dev/null | grep -q "$CRON_COMMENT"; then
        crontab -l 2>/dev/null | grep "$CRON_COMMENT" | while read -r line; do
            echo "  $line"
        done
        
        # Check if log file exists
        if [ -f "/var/log/roomy-backup.log" ]; then
            log "Last backup log entries:"
            tail -5 /var/log/roomy-backup.log | while read -r line; do
                echo "  $line"
            done
        else
            warning "No backup log file found at /var/log/roomy-backup.log"
        fi
    else
        warning "No backup cron job found"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -r|--remove)
            remove_cron_job
            exit 0
            ;;
        -s|--status)
            show_cron_status
            exit 0
            ;;
        -t|--test)
            check_backup_script
            test_backup_script
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            usage
            ;;
    esac
done

# Main setup process
log "Setting up automated database backup..."

# Check prerequisites
check_backup_script

# Test backup script first
test_backup_script

# Add cron job
add_cron_job

# Show final status
log "Setup completed successfully!"
show_cron_status

log ""
log "Next steps:"
log "1. Monitor backup logs: tail -f /var/log/roomy-backup.log"
log "2. Check backup files: ls -la ./backups/"
log "3. Test restore: ./scripts/restore-database.sh --list"
log "4. Remove cron job if needed: $0 --remove"
