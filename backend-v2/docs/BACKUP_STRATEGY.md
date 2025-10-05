# Database Backup Strategy for Roomy Backend V2

## Overview

This document outlines the comprehensive backup strategy for the Roomy Backend V2 PostgreSQL database. The strategy includes automated daily backups, retention policies, and disaster recovery procedures.

## Backup Components

### 1. Automated Backup Script (`scripts/backup-database.sh`)

**Features:**
- Creates both custom format (compressed) and plain SQL backups
- Automatic cleanup of old backups (30-day retention)
- Comprehensive logging and error handling
- Database connectivity verification
- Backup size reporting

**Usage:**
```bash
# Manual backup
./scripts/backup-database.sh

# Make executable if needed
chmod +x scripts/backup-database.sh
```

### 2. Database Restore Script (`scripts/restore-database.sh`)

**Features:**
- Interactive and force restore modes
- Automatic database recreation
- Prisma migration execution
- Backup file validation
- Comprehensive error handling

**Usage:**
```bash
# List available backups
./scripts/restore-database.sh --list

# Restore from backup
./scripts/restore-database.sh roomy_backup_20240101_120000.dump

# Force restore without confirmation
./scripts/restore-database.sh --force roomy_backup_20240101_120000.dump
```

### 3. Automated Cron Setup (`scripts/setup-backup-cron.sh`)

**Features:**
- Sets up daily automated backups at 2:00 AM
- Tests backup script before installation
- Manages cron job lifecycle
- Provides status monitoring

**Usage:**
```bash
# Setup automated backups
./scripts/setup-backup-cron.sh

# Check status
./scripts/setup-backup-cron.sh --status

# Test backup script
./scripts/setup-backup-cron.sh --test

# Remove automated backups
./scripts/setup-backup-cron.sh --remove
```

## Backup Schedule

### Daily Backups
- **Time:** 2:00 AM (configurable)
- **Format:** Both custom (compressed) and plain SQL
- **Retention:** 30 days
- **Location:** `./backups/`

### Backup Naming Convention
```
roomy_backup_YYYYMMDD_HHMMSS.sql      # Plain SQL format
roomy_backup_YYYYMMDD_HHMMSS.dump     # Custom compressed format
```

## Retention Policy

### Local Backups
- **Retention Period:** 30 days
- **Cleanup:** Automatic daily cleanup of expired backups
- **Storage:** Local filesystem in `./backups/` directory

### Cloud Storage (Optional)
- **Service:** AWS S3 (configurable)
- **Retention:** 90 days (configurable)
- **Encryption:** Server-side encryption enabled
- **Access:** IAM role-based access control

## Disaster Recovery Procedures

### 1. Database Corruption Recovery

```bash
# 1. Stop the application
pm2 stop roomy-backend-v2

# 2. List available backups
./scripts/restore-database.sh --list

# 3. Restore from most recent backup
./scripts/restore-database.sh --force roomy_backup_20240101_120000.dump

# 4. Verify data integrity
psql -d roomy_db_v2 -c "SELECT COUNT(*) FROM users;"

# 5. Restart the application
pm2 start roomy-backend-v2
```

### 2. Point-in-Time Recovery

For more granular recovery, use PostgreSQL's WAL (Write-Ahead Logging):

```bash
# 1. Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /path/to/wal_archive/%f'

# 2. Create base backup
pg_basebackup -D /path/to/base_backup -Ft -z -P

# 3. Restore to specific point in time
pg_restore --create --clean --if-exists -d postgres base_backup.tar
```

### 3. Partial Data Recovery

For recovering specific tables or data:

```bash
# 1. Create temporary database
createdb roomy_temp

# 2. Restore backup to temporary database
pg_restore -d roomy_temp roomy_backup_20240101_120000.dump

# 3. Export specific data
pg_dump -d roomy_temp -t users --data-only > users_data.sql

# 4. Import to production database
psql -d roomy_db_v2 -f users_data.sql
```

## Monitoring and Alerting

### Backup Monitoring

1. **Log Monitoring:**
   ```bash
   # Monitor backup logs
   tail -f /var/log/roomy-backup.log
   
   # Check for backup failures
   grep -i error /var/log/roomy-backup.log
   ```

2. **Backup Verification:**
   ```bash
   # Verify backup integrity
   pg_restore --list latest_backup.dump
   
   # Test restore in staging environment
   ./scripts/restore-database.sh --test
   ```

### Alerting Setup

Configure alerts for:
- Backup failures
- Backup size anomalies
- Disk space warnings
- Database connectivity issues

## Security Considerations

### Backup Security
- **Encryption:** All backups encrypted at rest
- **Access Control:** Limited access to backup files
- **Network Security:** Secure transfer protocols
- **Audit Logging:** All backup operations logged

### Access Management
```bash
# Set proper permissions for backup directory
chmod 700 ./backups/
chown postgres:postgres ./backups/

# Secure backup scripts
chmod 750 scripts/backup-*.sh
chown root:postgres scripts/backup-*.sh
```

## Performance Considerations

### Backup Performance
- **Compression:** Level 9 compression for custom format
- **Parallel Processing:** Use `pg_dump` with `--jobs` parameter for large databases
- **Network Optimization:** Local backups preferred over network storage

### Impact Minimization
- **Timing:** Backups scheduled during low-traffic hours
- **Resource Usage:** Monitor CPU and I/O during backups
- **Lock Duration:** Minimize table locks during backup

## Testing and Validation

### Regular Testing Schedule
- **Weekly:** Test restore procedures in staging environment
- **Monthly:** Full disaster recovery drill
- **Quarterly:** Review and update backup procedures

### Validation Checklist
- [ ] Backup files are created successfully
- [ ] Backup files are not corrupted
- [ ] Restore procedures work correctly
- [ ] Data integrity is maintained
- [ ] Application functionality is preserved
- [ ] Performance is acceptable

## Maintenance Tasks

### Daily
- Monitor backup completion
- Check backup log files
- Verify disk space availability

### Weekly
- Test restore procedures
- Review backup retention
- Check backup file integrity

### Monthly
- Update backup documentation
- Review backup performance
- Test disaster recovery procedures

## Troubleshooting

### Common Issues

1. **Backup Fails:**
   ```bash
   # Check database connectivity
   pg_isready -h localhost -p 5432 -U postgres
   
   # Check disk space
   df -h ./backups/
   
   # Check permissions
   ls -la scripts/backup-database.sh
   ```

2. **Restore Fails:**
   ```bash
   # Check backup file integrity
   file roomy_backup_20240101_120000.dump
   
   # Check database permissions
   psql -d postgres -c "SELECT current_user;"
   
   # Check available disk space
   df -h
   ```

3. **Cron Job Issues:**
   ```bash
   # Check cron service
   systemctl status cron
   
   # Check cron logs
   tail -f /var/log/cron
   
   # List current cron jobs
   crontab -l
   ```

## Configuration Files

### Environment Variables
```bash
# Database connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/roomy_db_v2"

# Backup configuration
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION_LEVEL=9
BACKUP_SCHEDULE="0 2 * * *"
```

### PostgreSQL Configuration
```postgresql
# postgresql.conf
wal_level = replica
max_wal_senders = 3
checkpoint_completion_target = 0.9
```

## Contact Information

For backup-related issues or questions:
- **System Administrator:** [Your Name]
- **Database Administrator:** [DBA Name]
- **Emergency Contact:** [Emergency Phone]

## Version History

- **v1.0** (2024-01-01): Initial backup strategy implementation
- **v1.1** (2024-01-15): Added automated cron setup
- **v1.2** (2024-02-01): Enhanced monitoring and alerting
