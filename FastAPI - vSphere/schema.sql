-- vSphere Monitoring Database Schema

-- 1. Clusters Table
create table clusters (
   id               serial primary key,
   name             text not null,
   num_hosts        int,
   num_vms          int,
   vms_running      int,
   vms_stopped      int,
   cpu_total_mhz    int,
   cpu_used_mhz     int,
   memory_total_gb  numeric(10,2),
   memory_used_gb   numeric(10,2),
   storage_total_gb numeric(10,2),
   storage_free_gb  numeric(10,2),
   overall_status   text,
   created_at       timestamp default current_timestamp
);

-- 2. Hosts Table
create table hosts (
   id               serial primary key,
   name             text not null,
   ip_address       text,
   cluster_id       int
      references clusters ( id )
         on delete cascade,
   cpu_model        text,
   cpu_cores        int,
   cpu_total_mhz    int,
   cpu_used_mhz     int,
   memory_total_gb  numeric(10,2),
   memory_used_gb   numeric(10,2),
   power_state      text,
   connection_state text,
   created_at       timestamp default current_timestamp
);

-- 3. Datastores Table
create table datastores (
   id            serial primary key,
   name          text not null,
   cluster_id    int
      references clusters ( id )
         on delete cascade,
   capacity_gb   numeric(10,2),
   free_space_gb numeric(10,2),
   accessible    boolean,
   created_at    timestamp default current_timestamp
);

-- 4. VMs Table
create table vms (
   id          serial primary key,
   name        text not null,
   host_name   text,
   ip_address  text,
   power_state text,
   cpu_count   int,
   memory_mb   int,
   cluster_id  int
      references clusters ( id )
         on delete cascade,
   created_at  timestamp default current_timestamp
);

-- 5. Workorders Table
create table workorders (
   id                   serial primary key,
   name                 varchar not null,
   os                   varchar not null,
   host_version         varchar not null,
   cpu                  integer not null,
   ram                  integer not null,
   disk                 float not null,
   status               varchar default 'pending',
   created_at           timestamp default current_timestamp,
   host_id              varchar,
   vm_id                varchar,
   datastore_id         varchar,
   disks                jsonb,
   nics                 jsonb,
   last_execution_log   text,
   resource_pool_id     varchar,
   ip_pool_id           varchar,
   template_id          varchar,
   hostname             varchar,
   ip                   varchar,
   netmask              varchar,
   gateway              varchar,
   domain               varchar,
   hardware_version     varchar,
   scsi_controller_type varchar,
   folder_id            varchar,
   network_id           varchar,
   datacenter_name      varchar
);

-- 6. Monitoring Data Table
create table monitoring_data (
   id          serial primary key,
   timestamp   timestamp default current_timestamp,
   data_type   varchar,         -- 'cluster', 'host', 'datastore', 'vm'
   entity_name varchar,
   data_json   text
);

-- 7. System Metrics Table
create table system_metrics (
   id          serial primary key,
   timestamp   timestamp default current_timestamp,
   metric_type varchar,       -- 'cpu_usage', 'memory_usage', 'storage_usage'
   value       float,
   unit        varchar,              -- 'percent', 'mhz', 'gb'
   description varchar
);

-- 8. Networks Table (optional, if you want to persist networks)
create table networks (
   id              varchar primary key,           -- vSphere network name
   moid            varchar,
   name            varchar not null,
   vlan            integer,
   type            varchar,
   description     text,
   datacenter_name varchar
);