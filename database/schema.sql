-- vSphere Monitoring Database Schema

-- 1. Clusters Table
create table if not exists clusters (
   id               serial primary key,
   name             text not null,
   num_hosts        integer,
   num_vms          integer,
   vms_running      integer,
   vms_stopped      integer,
   cpu_total_mhz    integer,
   cpu_used_mhz     integer,
   memory_total_gb  numeric(10,2),
   memory_used_gb   numeric(10,2),
   storage_total_gb numeric(10,2),
   storage_free_gb  numeric(10,2),
   overall_status   text,
   created_at       timestamp default current_timestamp
);

-- 2. Hosts Table
create table if not exists hosts (
   id               serial primary key,
   name             text not null,
   ip_address       text,
   cluster_id       integer
      references clusters ( id )
         on delete cascade,
   cpu_model        text,
   cpu_cores        integer,
   cpu_total_mhz    integer,
   cpu_used_mhz     integer,
   memory_total_gb  numeric(10,2),
   memory_used_gb   numeric(10,2),
   power_state      text,
   connection_state text,
   created_at       timestamp default current_timestamp
);

-- 3. Datastores Table
create table if not exists datastores (
   id            serial primary key,
   name          text not null,
   cluster_id    integer
      references clusters ( id )
         on delete cascade,
   capacity_gb   numeric(10,2),
   free_space_gb numeric(10,2),
   accessible    boolean,
   created_at    timestamp default current_timestamp
);

-- 4. VMs Table
create table if not exists vms (
   id          serial primary key,
   name        text not null,
   host_name   text,
   ip_address  text,
   power_state text,
   cpu_count   integer,
   memory_mb   integer,
   cluster_id  integer
      references clusters ( id )
         on delete cascade,
   created_at  timestamp default current_timestamp
);

-- 5. Workorders Table
create table if not exists workorders (
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

-- 6. VNI Workorders Table
create table if not exists vni_workorders (
   id                 serial primary key,
   owner              varchar not null,
   requested_date     timestamp not null,
   requested_by       varchar not null,
   virtual_machines   jsonb,
   deadline           timestamp not null,
   project            varchar not null,
   t0_gw              varchar not null,
   t1_gw              varchar not null,
   description        varchar not null,
   vni_name           varchar not null,
   cidr               varchar not null,
   subnet_mask        varchar not null,
   gateway            varchar not null,
   first_ip           varchar not null,
   last_ip            varchar not null,
   number_of_ips      integer not null,
   status             varchar default 'pending',
   created_at         timestamp default current_timestamp,
   updated_at         timestamp default current_timestamp,
   last_execution_log text,
   notes              text,
   priority           varchar default 'normal',
   assigned_to        varchar
);

-- 7. Networks Table
create table if not exists networks (
   id              varchar primary key,
   moid            varchar,
   name            varchar not null,
   vlan            integer,
   type            varchar,
   description     text,
   datacenter_name varchar
);

-- 8. Monitoring Data Table
create table if not exists monitoring_data (
   id          serial primary key,
   timestamp   timestamp default current_timestamp,
   data_type   varchar,
   entity_name varchar,
   data_json   text
);

-- 9. System Metrics Table
create table if not exists system_metrics (
   id          serial primary key,
   timestamp   timestamp default current_timestamp,
   metric_type varchar,
   value       float,
   unit        varchar,
   description varchar
);

-- Create indexes for better performance
create index if not exists idx_clusters_name on
   clusters (
      name
   );
create index if not exists idx_hosts_cluster_id on
   hosts (
      cluster_id
   );
create index if not exists idx_datastores_cluster_id on
   datastores (
      cluster_id
   );
create index if not exists idx_vms_cluster_id on
   vms (
      cluster_id
   );
create index if not exists idx_workorders_status on
   workorders (
      status
   );
create index if not exists idx_vni_workorders_status on
   vni_workorders (
      status
   );
create index if not exists idx_monitoring_data_timestamp on
   monitoring_data (
      timestamp
   );
create index if not exists idx_system_metrics_timestamp on
   system_metrics (
      timestamp
   );