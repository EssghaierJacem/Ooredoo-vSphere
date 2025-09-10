from fastapi import APIRouter, HTTPException
from utils.safe_math import safe_div
from services.vsphere.host_info import get_hosts_info, get_host_by_name, get_hosts_by_cluster

router = APIRouter(
    prefix="/hosts",
    tags=["Hosts"]
)

@router.get("/")
def read_hosts():
    """
    Get all hosts information
    """
    try:
        return get_hosts_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{host_name}")
def read_host(host_name: str):
    """
    Get information about a specific host by name
    """
    try:
        host = get_host_by_name(host_name)
        if host is None:
            raise HTTPException(status_code=404, detail=f"Host '{host_name}' not found")
        return host
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cluster/{cluster_name}")
def read_hosts_by_cluster(cluster_name: str):
    """
    Get all hosts in a specific cluster
    """
    try:
        hosts = get_hosts_by_cluster(cluster_name)
        return hosts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/overview")
def get_hosts_summary():
    """
    Get a summary overview of all hosts
    """
    try:
        hosts = get_hosts_info()
        total_hosts = len(hosts)
        connected_hosts = len([h for h in hosts if h['connection_state'] == 'connected'])
        disconnected_hosts = len([h for h in hosts if h['connection_state'] == 'disconnected'])
        powered_on_hosts = len([h for h in hosts if h['power_state'] == 'poweredOn'])
        powered_off_hosts = len([h for h in hosts if h['power_state'] == 'poweredOff'])
        
        total_cpu_mhz = sum(host['cpu_total_mhz'] for host in hosts)
        used_cpu_mhz = sum(host['cpu_used_mhz'] for host in hosts)
        total_memory_gb = sum(host['memory_total_gb'] for host in hosts)
        used_memory_gb = sum(host['memory_used_gb'] for host in hosts)
        
        return {
            "total_hosts": total_hosts,
            "connected_hosts": connected_hosts,
            "disconnected_hosts": disconnected_hosts,
            "powered_on_hosts": powered_on_hosts,
            "powered_off_hosts": powered_off_hosts,
            "cpu_usage_percent": safe_div(used_cpu_mhz, total_cpu_mhz) * 100,
            "memory_usage_percent": safe_div(used_memory_gb, total_memory_gb) * 100,
            "total_cpu_mhz": total_cpu_mhz,
            "used_cpu_mhz": used_cpu_mhz,
            "total_memory_gb": total_memory_gb,
            "used_memory_gb": used_memory_gb
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
