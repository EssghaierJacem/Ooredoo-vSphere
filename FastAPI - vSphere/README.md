# vSphere Monitoring API

A comprehensive FastAPI-based REST API for monitoring vSphere infrastructure including clusters, hosts, datastores, and virtual machines.

## Features

- **Real-time Monitoring**: Get live data from vSphere/vCenter
- **Comprehensive Coverage**: Monitor clusters, hosts, datastores, and VMs
- **Historical Data**: Store and retrieve historical monitoring data
- **System Metrics**: Track CPU, memory, and storage usage over time
- **Health Checks**: Built-in connection testing and system health monitoring
- **RESTful API**: Full REST API with automatic documentation
- **PostgreSQL Database**: Store monitoring data in PostgreSQL with proper relationships

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd vsphere_monitoring_api

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

#### Option A: Use Existing PostgreSQL Database

If you already have a PostgreSQL database with the required tables, just configure the connection.

#### Option B: Create New Database

```sql
-- Create database
CREATE DATABASE vsphere_monitoring;

-- Create tables (if not already created)
CREATE TABLE clusters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    num_hosts INT,
    num_vms INT,
    vms_running INT,
    vms_stopped INT,
    cpu_total_mhz INT,
    cpu_used_mhz INT,
    memory_total_gb NUMERIC(10,2),
    memory_used_gb NUMERIC(10,2),
    storage_total_gb NUMERIC(10,2),
    storage_free_gb NUMERIC(10,2),
    overall_status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hosts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ip_address TEXT,
    cluster_id INT REFERENCES clusters(id) ON DELETE CASCADE,
    cpu_model TEXT,
    cpu_cores INT,
    cpu_total_mhz INT,
    cpu_used_mhz INT,
    memory_total_gb NUMERIC(10,2),
    memory_used_gb NUMERIC(10,2),
    power_state TEXT,
    connection_state TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE datastores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    cluster_id INT REFERENCES clusters(id) ON DELETE CASCADE,
    capacity_gb NUMERIC(10,2),
    free_space_gb NUMERIC(10,2),
    accessible BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    host_name TEXT,
    ip_address TEXT,
    power_state TEXT,
    cpu_count INT,
    memory_mb INT,
    cluster_id INT REFERENCES clusters(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Work Orders Table (Manual SQL)

Add this table to your PostgreSQL database to support the new Work Order feature:

```sql
CREATE TABLE workorders (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    os VARCHAR NOT NULL,
    host_version VARCHAR NOT NULL,
    cpu INTEGER NOT NULL,
    ram INTEGER NOT NULL,
    disk FLOAT NOT NULL,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    host_id VARCHAR,
    vm_id VARCHAR,
    datastore_id VARCHAR,
    disks JSONB,
    nics JSONB
);
```

### 3. Configuration

Create a `.env` file in the project root:

```env
# vSphere Configuration
VCENTER_URL=your-vcenter-server.com
VCENTER_USER=your-username@domain.com
VCENTER_PASSWORD=your-password
VCENTER_PORT=443

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=vsphere_monitoring
POSTGRES_USER=your_db_username
POSTGRES_PASSWORD=your_db_password

# Alternative: Use full DATABASE_URL
# DATABASE_URL=postgresql://username:password@localhost:5432/vsphere_monitoring

# Optional Configuration
LOG_LEVEL=INFO
```

### 4. Run the API

```bash
# Start the server
python run.py
```

The API will be available at:

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/system/health

## API Endpoints

### System

- `GET /system/health` - Basic health check
- `GET /system/connection/test` - Test vSphere connection
- `GET /system/overview/dashboard` - Comprehensive system overview

### Clusters

- `GET /clusters/` - Get all clusters
- `GET /clusters/{cluster_name}` - Get specific cluster
- `GET /clusters/summary/overview` - Cluster summary statistics

### Hosts

- `GET /hosts/` - Get all hosts
- `GET /hosts/{host_name}` - Get specific host
- `GET /hosts/cluster/{cluster_name}` - Get hosts in cluster
- `GET /hosts/summary/overview` - Host summary statistics

### Datastores

- `GET /datastores/` - Get all datastores
- `GET /datastores/{datastore_name}` - Get specific datastore
- `GET /datastores/type/{datastore_type}` - Get datastores by type
- `GET /datastores/accessible/{accessible}` - Get datastores by accessibility
- `GET /datastores/summary/overview` - Datastore summary statistics

### Virtual Machines

- `GET /vms/` - Get all VMs
- `GET /vms/{vm_name}` - Get specific VM
- `GET /vms/power-state/{power_state}` - Get VMs by power state
- `GET /vms/tools-status/{tools_status}` - Get VMs by tools status
- `GET /vms/templates/all` - Get all templates
- `GET /vms/running/all` - Get running VMs
- `GET /vms/stopped/all` - Get stopped VMs
- `GET /vms/summary/overview` - VM summary statistics

### Historical Data

- `POST /history/store` - Store current monitoring data in PostgreSQL
- `GET /history/data/{data_type}` - Get historical data by type
- `GET /history/metrics` - Get historical metrics
- `GET /history/metrics/summary` - Get metrics summary

## Example Usage

### Get System Overview

```bash
curl http://localhost:8000/system/overview/dashboard
```

### Get All Clusters

```bash
curl http://localhost:8000/clusters/
```

### Get Specific Host

```bash
curl http://localhost:8000/hosts/your-host-name
```

### Get Running VMs

```bash
curl http://localhost:8000/vms/running/all
```

### Store Historical Data in PostgreSQL

```bash
curl -X POST http://localhost:8000/history/store
```

## Data Structure

### Cluster Information

```json
{
  "name": "Cluster-1",
  "num_hosts": 4,
  "num_vms": 25,
  "vms_running": 20,
  "vms_stopped": 5,
  "overall_status": "green",
  "storage_total_gb": 2048.0,
  "storage_free_gb": 512.0,
  "cpu_total_mhz": 8000,
  "cpu_used_mhz": 3200,
  "memory_total_gb": 64.0,
  "memory_used_gb": 32.0
}
```

### Host Information

```json
{
  "name": "esxi-01",
  "ip_address": "192.168.1.100",
  "cluster_id": 1,
  "cpu_model": "Intel(R) Xeon(R) CPU E5-2680 v4",
  "cpu_cores": 16,
  "cpu_total_mhz": 3200,
  "cpu_used_mhz": 800,
  "memory_total_gb": 32.0,
  "memory_used_gb": 16.0,
  "power_state": "poweredOn",
  "connection_state": "connected"
}
```

### VM Information

```json
{
  "name": "web-server-01",
  "host_name": "esxi-01",
  "ip_address": "192.168.1.100",
  "power_state": "poweredOn",
  "cpu_count": 2,
  "memory_mb": 4096,
  "cluster_id": 1
}
```

## Development

### Project Structure

```
vsphere_monitoring_api/
├── app/
│   ├── __init__.py
│   ├── config.py          # Configuration settings
│   ├── database.py        # PostgreSQL models and connection
│   └── main.py           # FastAPI application
├── api/
│   └── routers/          # API route handlers
│       ├── clusters.py
│       ├── hosts.py
│       ├── datastores.py
│       ├── vms.py
│       ├── system.py
│       └── history.py
├── services/
│   ├── vsphere/          # vSphere service modules
│   │   ├── connection.py
│   │   ├── cluster_info.py
│   │   ├── host_info.py
│   │   ├── datastore_info.py
│   │   └── vm_info.py
│   └── insert_db.py      # PostgreSQL operations
├── models/               # Pydantic models (if needed)
├── utils/                # Utility functions
├── requirements.txt      # Python dependencies
├── run.py               # Application entry point
└── README.md           # This file
```

### Adding New Features

1. **New vSphere Service**: Add to `services/vsphere/`
2. **New API Endpoint**: Add to `api/routers/`
3. **New Database Model**: Add to `app/database.py`
4. **Configuration**: Add to `app/config.py`

## CI/CD Integration

This API is designed for easy integration with CI/CD pipelines:

### Docker Support

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run.py"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vsphere-monitoring-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vsphere-monitoring-api
  template:
    metadata:
      labels:
        app: vsphere-monitoring-api
    spec:
      containers:
        - name: api
          image: vsphere-monitoring-api:latest
          ports:
            - containerPort: 8000
          env:
            - name: VCENTER_URL
              valueFrom:
                secretKeyRef:
                  name: vsphere-secrets
                  key: vcenter-url
            - name: VCENTER_USER
              valueFrom:
                secretKeyRef:
                  name: vsphere-secrets
                  key: vcenter-user
            - name: VCENTER_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: vsphere-secrets
                  key: vcenter-password
            - name: POSTGRES_HOST
              value: "postgres-service"
            - name: POSTGRES_DB
              value: "vsphere_monitoring"
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-secrets
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secrets
                  key: password
```

## Monitoring and Alerting

The API provides endpoints for monitoring and alerting:

- **Health Checks**: `/system/health`
- **Connection Testing**: `/system/connection/test`
- **Resource Usage**: Summary endpoints for CPU, memory, storage
- **Historical Trends**: `/history/metrics` for trend analysis
- **Database Storage**: All monitoring data stored in PostgreSQL

## Security

- Environment variables for sensitive configuration
- SSL/TLS support for vSphere connections
- Input validation on all endpoints
- Error handling without exposing sensitive information
- PostgreSQL connection with proper authentication

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check vCenter credentials and network connectivity
2. **Database Connection Failed**: Verify PostgreSQL connection settings
3. **Missing Dependencies**: Run `pip install -r requirements.txt`
4. **SSL Errors**: Verify vCenter certificate configuration
5. **Database Schema**: Ensure PostgreSQL tables are created correctly

### Logs

Enable debug logging by setting `LOG_LEVEL=DEBUG` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
