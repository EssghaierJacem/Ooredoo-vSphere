# 🐳 vSphere Monitoring System - Docker Deployment Guide

This guide provides complete instructions for deploying the vSphere monitoring system using Docker containers.

## 📋 Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (to clone the repository)
- **vCenter Server** access credentials

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd vsphere-monitoring-system
```

### 2. Configure Environment Variables

```bash
# Copy the environment template
cp env.example .env

# Edit the .env file with your actual values
nano .env
```

### 3. Deploy with One Command

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

## 📁 Project Structure

```
vsphere-monitoring-system/
├── Dashboard - vSphere/          # React Frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── FastAPI - vSphere/            # Python Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
├── database/                     # PostgreSQL Database
│   ├── Dockerfile
│   ├── schema.sql
│   ├── init.sql
│   └── postgresql.conf
├── Terraform - vSphere/          # Infrastructure as Code
├── docker-compose.yml           # Docker Compose configuration
├── env.example                  # Environment variables template
├── deploy.sh                    # Deployment script
└── README-Docker.md            # This file
```

## 🔧 Configuration

### Environment Variables

The system uses the following environment variables:

#### Required Variables

```bash
# vSphere Configuration
VCENTER_URL=your-vcenter-server.com
VCENTER_USER=administrator@vsphere.local
VCENTER_PASSWORD=your-vcenter-password

# Database Configuration
POSTGRES_PASSWORD=your_secure_database_password
```

#### Optional Variables

```bash
# API Configuration
LOG_LEVEL=INFO
VCENTER_PORT=443

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:8000

# SSL Configuration (for production)
DOMAIN_NAME=your-domain.com
SSL_EMAIL=admin@your-domain.com
```

## 🐳 Docker Services

### 1. Frontend (React Dashboard)

- **Image**: Custom React + Nginx
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Features**:
  - Serves React application
  - Proxies API requests to backend
  - Gzip compression
  - Security headers
  - Static asset caching

### 2. Backend (FastAPI)

- **Image**: Python 3.9 + FastAPI + Terraform
- **Port**: 8000
- **Features**:
  - REST API for vSphere operations
  - Terraform integration
  - Database connectivity
  - Health checks
  - Logging

### 3. Database (PostgreSQL)

- **Image**: PostgreSQL 14 Alpine
- **Port**: 5432
- **Features**:
  - Persistent data storage
  - Optimized for monitoring workloads
  - Automated backups
  - Health monitoring

## 🚀 Deployment Options

### Option 1: Simple Deployment

```bash
# Basic deployment
./deploy.sh
```

### Option 2: SSL Deployment

```bash
# Deployment with SSL certificates
./deploy.sh --ssl
```

### Option 3: Manual Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

## 📊 Access Points

After successful deployment:

- **Frontend Dashboard**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

## 🔍 Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Manual health checks
curl http://localhost/health          # Frontend
curl http://localhost:8000/system/health  # Backend
docker-compose exec database pg_isready -U vsphere_user
```

## 🛠️ Management Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update services
docker-compose pull
docker-compose up -d
```

### Database Management

```bash
# Access database
docker-compose exec database psql -U vsphere_user -d vsphere_monitoring

# Create backup
docker-compose exec database pg_dump -U vsphere_user vsphere_monitoring > backup.sql

# Restore backup
docker-compose exec -T database psql -U vsphere_user -d vsphere_monitoring < backup.sql
```

### Volume Management

```bash
# List volumes
docker volume ls

# Backup volumes
docker run --rm -v vsphere-monitoring-system_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v vsphere-monitoring-system_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🔒 Security Considerations

### Network Security

- Services communicate over internal Docker network
- Only necessary ports exposed to host
- Database not directly accessible from outside

### Data Security

- Environment variables for sensitive data
- Non-root users in containers
- Encrypted database connections
- Regular security updates

### SSL/TLS

```bash
# Generate SSL certificates
./deploy.sh --ssl

# Manual SSL setup
docker-compose run --rm nginx certbot certonly --standalone -d your-domain.com
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use load balancer
docker-compose up -d nginx
```

### Resource Limits

```yaml
# Add to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
        reservations:
          cpus: "1.0"
          memory: 1G
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
sudo netstat -tulpn | grep :80

# Stop conflicting service
sudo systemctl stop apache2  # or nginx
```

#### 2. Database Connection Issues

```bash
# Check database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

#### 3. vSphere Connection Issues

```bash
# Check backend logs
docker-compose logs backend

# Verify vCenter credentials in .env file
# Test connectivity manually
```

#### 4. Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Verify API URL in .env file
# Check nginx configuration
```

### Debug Mode

```bash
# Run in debug mode
LOG_LEVEL=DEBUG docker-compose up

# Access container shell
docker-compose exec backend bash
docker-compose exec database psql -U vsphere_user
```

## 📋 Maintenance

### Regular Maintenance Tasks

#### Daily

- Check service health
- Review logs for errors
- Monitor disk space

#### Weekly

- Update Docker images
- Review security patches
- Backup database

#### Monthly

- Update dependencies
- Review performance metrics
- Security audit

### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec database pg_dump -U vsphere_user vsphere_monitoring > backup_$DATE.sql
gzip backup_$DATE.sql
```

## 🆘 Support

### Getting Help

1. Check the logs: `docker-compose logs`
2. Verify configuration: `.env` file
3. Test connectivity: `curl` commands
4. Check documentation: API docs at `/docs`

### Useful Commands

```bash
# System information
docker system df
docker-compose config

# Resource usage
docker stats

# Clean up
docker system prune
docker volume prune
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Monitoring! 🚀**
