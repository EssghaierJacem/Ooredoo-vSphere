import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import Cluster, Host, Datastore, VM, MonitoringData, SystemMetrics, get_db
from services.vsphere.cluster_info import get_clusters_info
from services.vsphere.host_info import get_hosts_info
from services.vsphere.datastore_info import get_datastores_info
from services.vsphere.vm_info import get_vms_info
from utils.safe_math import safe_div

def store_monitoring_data():
    """
    Store current monitoring data in the PostgreSQL database
    """
    try:
        # Get database session
        db = next(get_db())
        
        # Get all monitoring data
        clusters_data = get_clusters_info()
        hosts_data = get_hosts_info()
        datastores_data = get_datastores_info()
        vms_data = get_vms_info()
        
        # Store clusters
        cluster_map = {}  # To map cluster names to IDs
        for cluster_data in clusters_data:
            cluster = Cluster(
                name=cluster_data['name'],
                num_hosts=cluster_data['num_hosts'],
                num_vms=cluster_data['num_vms'],
                vms_running=cluster_data['vms_running'],
                vms_stopped=cluster_data['vms_stopped'],
                cpu_total_mhz=int(cluster_data['cpu_total_mhz']),
                cpu_used_mhz=int(cluster_data['cpu_used_mhz']),
                memory_total_gb=float(cluster_data['memory_total_gb']),
                memory_used_gb=float(cluster_data['memory_used_gb']),
                storage_total_gb=float(cluster_data['total_storage_gb']),
                storage_free_gb=float(cluster_data['free_storage_gb']),
                overall_status=cluster_data['overall_status']
            )
            db.add(cluster)
            db.flush()  # Get the ID
            cluster_map[cluster_data['name']] = cluster.id
        
        # Store hosts
        for host_data in hosts_data:
            host = Host(
                name=host_data['name'],
                ip_address=host_data.get('management_ip', 'N/A'),
                cluster_id=cluster_map.get(host_data['cluster']),
                cpu_model=host_data['cpu_model'],
                cpu_cores=host_data['cpu_cores'],
                cpu_total_mhz=int(host_data['cpu_total_mhz']),
                cpu_used_mhz=int(host_data['cpu_used_mhz']),
                memory_total_gb=float(host_data['memory_total_gb']),
                memory_used_gb=float(host_data['memory_used_gb']),
                power_state=host_data['power_state'],
                connection_state=host_data['connection_state']
            )
            db.add(host)
        
        # Store datastores
        for datastore_data in datastores_data:
            # Find which cluster this datastore belongs to
            cluster_id = None
            for cluster_data in clusters_data:
                for ds in cluster_data.get('datastores', []):
                    if ds['name'] == datastore_data['name']:
                        cluster_id = cluster_map.get(cluster_data['name'])
                        break
                if cluster_id:
                    break
            
            datastore = Datastore(
                name=datastore_data['name'],
                cluster_id=cluster_id,
                capacity_gb=float(datastore_data['capacity_gb']),
                free_space_gb=float(datastore_data['free_space_gb']),
                accessible=datastore_data['accessible']
            )
            db.add(datastore)
        
        # Store VMs
        for vm_data in vms_data:
            # Find which cluster this VM belongs to
            cluster_id = None
            for cluster_data in clusters_data:
                if vm_data['name'] in [vm['name'] for vm in cluster_data.get('vms', [])]:
                    cluster_id = cluster_map.get(cluster_data['name'])
                    break
            
            vm = VM(
                name=vm_data['name'],
                host_name=vm_data.get('host_name', 'N/A'),
                ip_address=', '.join(vm_data.get('ip_addresses', [])),
                power_state=vm_data['power_state'],
                cpu_count=vm_data['num_cpu'],
                memory_mb=int(vm_data['memory_gb'] * 1024),  # Convert GB to MB
                cluster_id=cluster_id
            )
            db.add(vm)
        
        # Calculate and store system metrics
        total_cpu_mhz = sum(h['cpu_total_mhz'] for h in hosts_data)
        used_cpu_mhz = sum(h['cpu_used_mhz'] for h in hosts_data)
        total_memory_gb = sum(h['memory_total_gb'] for h in hosts_data)
        used_memory_gb = sum(h['memory_used_gb'] for h in hosts_data)
        total_storage_gb = sum(ds['capacity_gb'] for ds in datastores_data)
        used_storage_gb = sum(ds['used_space_gb'] for ds in datastores_data)
        
        # CPU usage metric
        cpu_metric = SystemMetrics(
            metric_type='cpu_usage',
            value=safe_div(used_cpu_mhz, total_cpu_mhz) * 100,
            unit='percent',
            description='Overall CPU usage across all hosts'
        )
        db.add(cpu_metric)
        
        # Memory usage metric
        memory_metric = SystemMetrics(
            metric_type='memory_usage',
            value=safe_div(used_memory_gb, total_memory_gb) * 100,
            unit='percent',
            description='Overall memory usage across all hosts'
        )
        db.add(memory_metric)
        
        # Storage usage metric
        storage_metric = SystemMetrics(
            metric_type='storage_usage',
            value=safe_div(used_storage_gb, total_storage_gb) * 100,
            unit='percent',
            description='Overall storage usage across all datastores'
        )
        db.add(storage_metric)
        
        # Commit all changes
        db.commit()
        db.close()
        
        return {
            "status": "success",
            "message": "Monitoring data stored successfully in PostgreSQL",
            "timestamp": datetime.utcnow().isoformat(),
            "records_stored": {
                "clusters": len(clusters_data),
                "hosts": len(hosts_data),
                "datastores": len(datastores_data),
                "vms": len(vms_data),
                "metrics": 3
            }
        }
        
    except Exception as e:
        if 'db' in locals():
            db.rollback()
            db.close()
        raise Exception(f"Failed to store monitoring data: {str(e)}")

def get_historical_data(data_type: str, entity_name: str = None, limit: int = 100):
    """
    Retrieve historical monitoring data from database
    
    Args:
        data_type (str): Type of data to retrieve ('cluster', 'host', 'datastore', 'vm')
        entity_name (str): Optional specific entity name to filter by
        limit (int): Maximum number of records to return
        
    Returns:
        list: Historical data records
    """
    try:
        db = next(get_db())
        
        query = db.query(MonitoringData).filter(MonitoringData.data_type == data_type)
        
        if entity_name:
            query = query.filter(MonitoringData.entity_name == entity_name)
        
        records = query.order_by(MonitoringData.timestamp.desc()).limit(limit).all()
        
        result = []
        for record in records:
            result.append({
                "id": record.id,
                "timestamp": record.timestamp.isoformat(),
                "data_type": record.data_type,
                "entity_name": record.entity_name,
                "data": json.loads(record.data_json)
            })
        
        db.close()
        return result
        
    except Exception as e:
        if 'db' in locals():
            db.close()
        raise Exception(f"Failed to retrieve historical data: {str(e)}")

def get_metrics_history(metric_type: str = None, limit: int = 100):
    """
    Retrieve historical system metrics from database
    
    Args:
        metric_type (str): Optional specific metric type to filter by
        limit (int): Maximum number of records to return
        
    Returns:
        list: Historical metrics records
    """
    try:
        db = next(get_db())
        
        query = db.query(SystemMetrics)
        
        if metric_type:
            query = query.filter(SystemMetrics.metric_type == metric_type)
        
        records = query.order_by(SystemMetrics.timestamp.desc()).limit(limit).all()
        
        result = []
        for record in records:
            result.append({
                "id": record.id,
                "timestamp": record.timestamp.isoformat(),
                "metric_type": record.metric_type,
                "value": record.value,
                "unit": record.unit,
                "description": record.description
            })
        
        db.close()
        return result
        
    except Exception as e:
        if 'db' in locals():
            db.close()
        raise Exception(f"Failed to retrieve metrics history: {str(e)}")

def get_clusters_from_db():
    """
    Get clusters from PostgreSQL database
    """
    try:
        db = next(get_db())
        clusters = db.query(Cluster).all()
        
        result = []
        for cluster in clusters:
            result.append({
                "id": cluster.id,
                "name": cluster.name,
                "num_hosts": cluster.num_hosts,
                "num_vms": cluster.num_vms,
                "vms_running": cluster.vms_running,
                "vms_stopped": cluster.vms_stopped,
                "cpu_total_mhz": cluster.cpu_total_mhz,
                "cpu_used_mhz": cluster.cpu_used_mhz,
                "memory_total_gb": float(cluster.memory_total_gb) if cluster.memory_total_gb else 0,
                "memory_used_gb": float(cluster.memory_used_gb) if cluster.memory_used_gb else 0,
                "storage_total_gb": float(cluster.storage_total_gb) if cluster.storage_total_gb else 0,
                "storage_free_gb": float(cluster.storage_free_gb) if cluster.storage_free_gb else 0,
                "overall_status": cluster.overall_status,
                "created_at": cluster.created_at.isoformat() if cluster.created_at else None
            })
        
        db.close()
        return result
        
    except Exception as e:
        if 'db' in locals():
            db.close()
        raise Exception(f"Failed to retrieve clusters from database: {str(e)}")
