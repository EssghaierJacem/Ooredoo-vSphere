from fastapi import APIRouter, HTTPException
from services.vsphere.connection import test_connection
from services.vsphere.cluster_info import get_clusters_info
from services.vsphere.host_info import get_hosts_info
from services.vsphere.datastore_info import get_datastores_info
from services.vsphere.vm_info import get_vms_info

router = APIRouter(
    prefix="/system",
    tags=["System"]
)

@router.get("/health")
def health_check():
    """
    Basic health check endpoint
    """
    return {
        "status": "healthy",
        "service": "vSphere Monitoring API",
        "version": "1.0.0"
    }

@router.get("/connection/test")
def test_vsphere_connection():
    """
    Test vSphere connection and return detailed status
    """
    try:
        connection_status = test_connection()
        return connection_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/overview/dashboard")
def get_system_overview():
    """
    Get a comprehensive system overview for dashboard
    """
    try:
        # Test connection first
        connection_status = test_connection()
        
        if connection_status['status'] == 'error':
            return {
                "connection_status": connection_status,
                "error": "Cannot retrieve system overview due to connection issues"
            }
        
        # Get all system information
        clusters = get_clusters_info()
        hosts = get_hosts_info()
        datastores = get_datastores_info()
        vms = get_vms_info()
        
        # Calculate summary statistics
        total_clusters = len(clusters)
        total_hosts = len(hosts)
        total_datastores = len(datastores)
        total_vms = len(vms)
        
        # Host statistics
        connected_hosts = len([h for h in hosts if h['connection_state'] == 'connected'])
        powered_on_hosts = len([h for h in hosts if h['power_state'] == 'poweredOn'])
        
        # VM statistics
        running_vms = len([vm for vm in vms if vm['power_state'] == 'poweredOn'])
        stopped_vms = len([vm for vm in vms if vm['power_state'] == 'poweredOff'])
        templates = len([vm for vm in vms if vm['template']])
        
        # Resource usage
        total_cpu_mhz = sum(h['cpu_total_mhz'] for h in hosts)
        used_cpu_mhz = sum(h['cpu_used_mhz'] for h in hosts)
        total_memory_gb = sum(h['memory_total_gb'] for h in hosts)
        used_memory_gb = sum(h['memory_used_gb'] for h in hosts)
        
        # Storage statistics
        total_storage_gb = sum(ds['capacity_gb'] for ds in datastores)
        free_storage_gb = sum(ds['free_space_gb'] for ds in datastores)
        used_storage_gb = sum(ds['used_space_gb'] for ds in datastores)
        
        return {
            "connection_status": connection_status,
            "summary": {
                "total_clusters": total_clusters,
                "total_hosts": total_hosts,
                "total_datastores": total_datastores,
                "total_vms": total_vms,
                "connected_hosts": connected_hosts,
                "powered_on_hosts": powered_on_hosts,
                "running_vms": running_vms,
                "stopped_vms": stopped_vms,
                "templates": templates
            },
            "resource_usage": {
                "cpu_usage_percent": (used_cpu_mhz / total_cpu_mhz * 100) if total_cpu_mhz > 0 else 0,
                "memory_usage_percent": (used_memory_gb / total_memory_gb * 100) if total_memory_gb > 0 else 0,
                "storage_usage_percent": (used_storage_gb / total_storage_gb * 100) if total_storage_gb > 0 else 0,
                "total_cpu_mhz": total_cpu_mhz,
                "used_cpu_mhz": used_cpu_mhz,
                "total_memory_gb": total_memory_gb,
                "used_memory_gb": used_memory_gb,
                "total_storage_gb": total_storage_gb,
                "used_storage_gb": used_storage_gb,
                "free_storage_gb": free_storage_gb
            },
            "alerts": {
                "hosts_disconnected": total_hosts - connected_hosts,
                "hosts_powered_off": total_hosts - powered_on_hosts,
                "vms_stopped": stopped_vms,
                "low_storage": len([ds for ds in datastores if ds['free_space_gb'] < 100])  # Less than 100GB free
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 