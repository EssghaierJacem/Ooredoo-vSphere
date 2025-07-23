from pyVmomi import vim
from .connection import get_vsphere_connection

def get_hosts_info():
    """
    Get comprehensive information about all hosts in vSphere
    
    Returns:
        list: List of dictionaries containing host information
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        si = get_vsphere_connection()
        content = si.RetrieveContent()
        hosts = []

        for dc in content.rootFolder.childEntity:
            for cluster in dc.hostFolder.childEntity:
                if isinstance(cluster, vim.ClusterComputeResource):
                    for h in cluster.host:
                        hw = h.hardware
                        summary = h.summary
                        quick_stats = summary.quickStats

                        total_mem_gb = hw.memorySize / (1024 ** 3)
                        used_mem_gb = quick_stats.overallMemoryUsage / 1024  # in MB → GB
                        free_mem_gb = total_mem_gb - used_mem_gb

                        cpu_cores = hw.cpuInfo.numCpuCores
                        cpu_hz = hw.cpuInfo.hz / 1_000_000  # Hz → MHz
                        total_cpu_mhz = cpu_cores * cpu_hz
                        used_cpu_mhz = quick_stats.overallCpuUsage or 0
                        free_cpu_mhz = total_cpu_mhz - used_cpu_mhz

                        # Find accessible datastores
                        accessible_datastores = []
                        if hasattr(h, 'datastore'):
                            for ds in h.datastore:
                                accessible_datastores.append({
                                    'id': getattr(ds, '_moId', None),
                                    'name': ds.name
                                })
                        # Find accessible networks
                        accessible_networks = []
                        if hasattr(h, 'network'):
                            for net in h.network:
                                accessible_networks.append({
                                    'id': getattr(net, '_moId', None),
                                    'name': net.name
                                })
                        hosts.append({
                            'id': h._moId,
                            'name': h.name,
                            'cluster': cluster.name,
                            'cpu_model': hw.cpuPkg[0].description,
                            'cpu_cores': cpu_cores,
                            'cpu_total_mhz': total_cpu_mhz,
                            'cpu_used_mhz': used_cpu_mhz,
                            'cpu_free_mhz': free_cpu_mhz,
                            'memory_total_gb': total_mem_gb,
                            'memory_used_gb': used_mem_gb,
                            'memory_free_gb': free_mem_gb,
                            'connection_state': h.runtime.connectionState,
                            'power_state': h.runtime.powerState,
                            'overall_status': str(summary.overallStatus),
                            'management_ip': summary.managementServerIp or "N/A",
                            'product_name': summary.config.product.name,
                            'product_version': summary.config.product.version,
                            'accessible_datastores': accessible_datastores,
                            'accessible_networks': accessible_networks,
                        })
        
        return hosts
        
    except Exception as e:
        raise Exception(f"Failed to retrieve host information: {str(e)}")

def get_host_by_name(host_name: str):
    """
    Get information about a specific host by name
    
    Args:
        host_name (str): Name of the host to retrieve
        
    Returns:
        dict: Host information or None if not found
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        hosts = get_hosts_info()
        for host in hosts:
            if host['name'] == host_name:
                return host
        return None
        
    except Exception as e:
        raise Exception(f"Failed to retrieve host '{host_name}': {str(e)}")

def get_hosts_by_cluster(cluster_name: str):
    """
    Get all hosts in a specific cluster
    
    Args:
        cluster_name (str): Name of the cluster
        
    Returns:
        list: List of hosts in the specified cluster
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        hosts = get_hosts_info()
        cluster_hosts = [host for host in hosts if host['cluster'] == cluster_name]
        return cluster_hosts
        
    except Exception as e:
        raise Exception(f"Failed to retrieve hosts for cluster '{cluster_name}': {str(e)}")
