#!/bin/bash

# Production setup script for Roomy CRM
# This script sets up the application for production deployment

set -e

echo "🚀 Setting up Roomy CRM for production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    local required_vars=(
        "JWT_SECRET"
        "POSTGRES_PASSWORD"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "S3_BUCKET"
        "S3_REGION"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please set these variables in your .env file or environment"
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Generate production SSL certificates
generate_ssl_certs() {
    print_status "Generating SSL certificates for production..."
    
    # Check if domain is provided
    if [ -z "$DOMAIN" ]; then
        print_warning "No DOMAIN environment variable set. Skipping SSL certificate generation."
        print_warning "You'll need to generate SSL certificates manually for production."
        return
    fi
    
    # Create SSL directory
    mkdir -p nginx/ssl
    
    # Generate self-signed certificate for now
    # In production, you should use Let's Encrypt or a proper CA
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=AE/ST=Dubai/L=Dubai/O=Roomy/CN=$DOMAIN"
    
    print_success "SSL certificates generated for domain: $DOMAIN"
    print_warning "For production, consider using Let's Encrypt for proper SSL certificates"
}

# Build and start containers
start_containers() {
    print_status "Building and starting Docker containers..."
    
    # Build images
    docker-compose build
    
    # Start containers
    docker-compose up -d
    
    print_success "Containers started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U roomy_user -d roomy_db; do sleep 2; done'
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout 30 bash -c 'until docker-compose exec -T redis redis-cli ping; do sleep 2; done'
    
    # Wait for backend
    print_status "Waiting for backend..."
    timeout 60 bash -c 'until curl -f http://localhost:3001/health; do sleep 2; done'
    
    print_success "All services are ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit for the database to be fully ready
    sleep 10
    
    # Run Prisma migrations
    docker-compose exec backend npx prisma db push
    
    # Run data migration
    docker-compose exec backend node scripts/migrate-data.js
    
    print_success "Database migrations completed"
}

# Show status
show_status() {
    print_status "Application status:"
    echo ""
    
    # Show container status
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  - Backend API: https://localhost:3001"
    echo "  - Health Check: https://localhost:3001/health"
    echo "  - Database: localhost:5432"
    echo "  - Redis: localhost:6379"
    
    echo ""
    print_status "Logs:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Backend logs: docker-compose logs -f backend"
    echo "  - Database logs: docker-compose logs -f postgres"
    
    echo ""
    print_success "Setup completed! 🎉"
}

# Main execution
main() {
    echo "🏠 Roomy CRM Production Setup"
    echo "=============================="
    echo ""
    
    # Load environment variables
    if [ -f .env ]; then
        source .env
        print_success "Environment variables loaded from .env"
    else
        print_warning "No .env file found. Make sure environment variables are set."
    fi
    
    # Run setup steps
    check_docker
    check_env_vars
    generate_ssl_certs
    start_containers
    wait_for_services
    run_migrations
    show_status
}

# Run main function
main "$@"
