from fastapi import APIRouter, HTTPException
from services.vsphere.cluster_info import get_clusters_info, get_cluster_by_name

router = APIRouter(
    prefix="/clusters",
    tags=["Clusters"]
)

@router.get("/")
def read_clusters():
    """
    Get all clusters information
    """
    try:
        return get_clusters_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{cluster_name}")
def read_cluster(cluster_name: str):
    """
    Get information about a specific cluster by name
    """
    try:
        cluster = get_cluster_by_name(cluster_name)
        if cluster is None:
            raise HTTPException(status_code=404, detail=f"Cluster '{cluster_name}' not found")
        return cluster
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/overview")
def get_clusters_summary():
    """
    Get a summary overview of all clusters
    """
    try:
        clusters = get_clusters_info()
        total_clusters = len(clusters)
        total_hosts = sum(cluster['num_hosts'] for cluster in clusters)
        total_vms = sum(cluster['num_vms'] for cluster in clusters)
        running_vms = sum(cluster['vms_running'] for cluster in clusters)
        stopped_vms = sum(cluster['vms_stopped'] for cluster in clusters)
        
        total_cpu_mhz = sum(cluster['cpu_total_mhz'] for cluster in clusters)
        used_cpu_mhz = sum(cluster['cpu_used_mhz'] for cluster in clusters)
        total_memory_gb = sum(cluster['memory_total_gb'] for cluster in clusters)
        used_memory_gb = sum(cluster['memory_used_gb'] for cluster in clusters)
        
        return {
            "total_clusters": total_clusters,
            "total_hosts": total_hosts,
            "total_vms": total_vms,
            "running_vms": running_vms,
            "stopped_vms": stopped_vms,
            "cpu_usage_percent": safe_div(used_cpu_mhz, total_cpu_mhz) * 100,
            "memory_usage_percent": safe_div(used_memory_gb, total_memory_gb) * 100,
            "total_cpu_mhz": total_cpu_mhz,
            "used_cpu_mhz": used_cpu_mhz,
            "total_memory_gb": total_memory_gb,
            "used_memory_gb": used_memory_gb
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
