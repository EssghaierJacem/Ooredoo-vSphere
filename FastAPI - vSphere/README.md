# vSphere Monitoring & Automation API

A modern FastAPI-based REST API and automation backend for vSphere infrastructure: monitoring, provisioning, and full DevOps workflow for VM requests.

---

## Features & Progress

- **Live vSphere Monitoring**: Clusters, hosts, datastores, VMs, and networks
- **Workorder Automation**: End-to-end VM provisioning, including all vSphere placement and customization options
- **Network Selection**: UI and backend use live vSphere network names, always valid for Terraform
- **Guest OS/ID Validation**: Only valid vSphere guest IDs selectable, preventing provisioning errors
- **Contextual Placement**: Datastore, host, resource pool, folder, and network options are contextually filtered and validated
- **Terraform Integration**: Dynamic, robust, and always in sync with workorder data
- **Frontend**: Modern React UI, with validation, tooltips, and a clean workflow
- **Backend**: FastAPI, clear endpoints, robust error handling, and clean code
- **Database**: PostgreSQL, with all fields needed for full vSphere automation and auditability

---

## Database Schema

This project uses the following PostgreSQL tables:

### `clusters`

```sql
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
```

### `hosts`

```sql
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
```

### `datastores`

```sql
CREATE TABLE datastores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    cluster_id INT REFERENCES clusters(id) ON DELETE CASCADE,
    capacity_gb NUMERIC(10,2),
    free_space_gb NUMERIC(10,2),
    accessible BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `vms`

```sql
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

### `workorders`

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
    nics JSONB,
    last_execution_log TEXT,
    resource_pool_id VARCHAR,
    ip_pool_id VARCHAR,
    template_id VARCHAR,
    hostname VARCHAR,
    ip VARCHAR,
    netmask VARCHAR,
    gateway VARCHAR,
    domain VARCHAR,
    hardware_version VARCHAR,
    scsi_controller_type VARCHAR,
    folder_id VARCHAR,
    network_id VARCHAR,
    datacenter_name VARCHAR
);
```

### `monitoring_data`

```sql
CREATE TABLE monitoring_data (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_type VARCHAR,         -- 'cluster', 'host', 'datastore', 'vm'
    entity_name VARCHAR,
    data_json TEXT
);
```

### `system_metrics`

```sql
CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metric_type VARCHAR,       -- 'cpu_usage', 'memory_usage', 'storage_usage'
    value FLOAT,
    unit VARCHAR,              -- 'percent', 'mhz', 'gb'
    description VARCHAR
);
```

### `networks`

```sql
CREATE TABLE networks (
    id VARCHAR PRIMARY KEY,           -- vSphere network name
    moid VARCHAR,
    name VARCHAR NOT NULL,
    vlan INTEGER,
    type VARCHAR,
    description TEXT,
    datacenter_name VARCHAR
);
```

### `vni_workorders`

```sql
create table vni_workorders (
   id                serial primary key,
   owner             varchar not null,
   requested_date    timestamp not null,
   requested_by      varchar not null,
   virtual_machines  jsonb,
   deadline          timestamp not null,
   project           varchar not null,
   t0_gw             varchar not null,
   t1_gw             varchar not null,
   description       varchar not null,
   vni_name          varchar not null,
   cidr              varchar not null,
   subnet_mask       varchar not null,
   gateway           varchar not null,
   first_ip          varchar not null,
   last_ip           varchar not null,
   number_of_ips     integer not null,
   status            varchar default 'pending',
   created_at        timestamp default current_timestamp,
   updated_at        timestamp default current_timestamp,
   last_execution_log text,
   notes             text,
   priority          varchar default 'normal',
   assigned_to       varchar
);
```

---

## Quick Start

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
2. **Configure your `.env`** (see example in repo)
3. **Create the database**
   ```bash
   psql -U <user> -d <db> -f schema.sql
   ```
4. **Run the API**
   ```bash
   python run.py
   ```
5. **Access the API docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Highlights

- `/workorders/` — Full CRUD for infrastructure requests
- `/networks/` — Live vSphere network inventory
- `/hosts/`, `/clusters/`, `/datastores/`, `/vms/` — Real-time and historical inventory
- `/history/store` — Store a snapshot of all monitoring data

---

## Contributing & License

- Fork, branch, PR — standard GitHub flow
- MIT License
