#!/bin/bash

# =============================================================================
# vSphere Monitoring System - Docker Deployment Script
# =============================================================================

set -e

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

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Please edit .env file with your actual values before continuing."
            print_warning "Press Enter when you're ready to continue..."
            read -r
        else
            print_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p database/backups
    mkdir -p nginx/ssl
    
    print_success "Directories created"
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Build images
    docker-compose build
    
    # Start services
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check database
    if docker-compose exec -T database pg_isready -U vsphere_user -d vsphere_monitoring > /dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_error "Database health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:8000/system/health > /dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
    fi
}

# Function to display access information
show_access_info() {
    print_success "Deployment completed successfully!"
    echo ""
    echo "Access Information:"
    echo "=================="
    echo "Frontend Dashboard: http://localhost"
    echo "Backend API: http://localhost:8000"
    echo "API Documentation: http://localhost:8000/docs"
    echo "Database: localhost:5432"
    echo ""
    echo "Default Database Credentials:"
    echo "Database: vsphere_monitoring"
    echo "Username: vsphere_user"
    echo "Password: (as set in .env file)"
    echo ""
    echo "Useful Commands:"
    echo "==============="
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
    echo "Update services: docker-compose pull && docker-compose up -d"
}

# Function to setup SSL (optional)
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Check if domain is configured
    if [ -z "$DOMAIN_NAME" ] || [ "$DOMAIN_NAME" = "your-domain.com" ]; then
        print_warning "SSL setup skipped - no domain configured"
        return
    fi
    
    # Install certbot
    docker-compose run --rm nginx sh -c "
        apk add --no-cache certbot
        certbot certonly --standalone -d $DOMAIN_NAME --email $SSL_EMAIL --agree-tos --non-interactive
    "
    
    print_success "SSL certificates generated"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "vSphere Monitoring System - Deployment"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_env_file
    
    # Create directories
    create_directories
    
    # Deploy services
    deploy_services
    
    # Check health
    check_health
    
    # Show access information
    show_access_info
    
    # Optional SSL setup
    if [ "$1" = "--ssl" ]; then
        setup_ssl
    fi
}

# Handle command line arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --ssl     Setup SSL certificates (requires domain configuration)"
        echo "  --help    Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0              # Deploy without SSL"
        echo "  $0 --ssl        # Deploy with SSL setup"
        ;;
    --ssl)
        main "$1"
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 