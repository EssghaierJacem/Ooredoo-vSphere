from pyVmomi import vim
from .connection import get_vsphere_connection

def get_hosts_info():
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

                    hosts.append({
                        'name': h.name,
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
                    })
    return hosts
