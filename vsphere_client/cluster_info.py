from pyVmomi import vim
from .connection import get_vsphere_connection

def get_clusters_info():
    si = get_vsphere_connection()
    content = si.RetrieveContent()
    clusters = []

    for dc in content.rootFolder.childEntity:
        if hasattr(dc, 'hostFolder'):
            for cluster in dc.hostFolder.childEntity:
                if isinstance(cluster, vim.ClusterComputeResource):
                    summary = cluster.summary

                    # VM counts
                    vms = cluster.resourcePool.vm
                    running = [vm for vm in vms if vm.runtime.powerState == 'poweredOn']
                    stopped = [vm for vm in vms if vm.runtime.powerState == 'poweredOff']

                    # Aggregate host CPU/RAM usage
                    cpu_total_mhz = 0
                    cpu_used_mhz = 0
                    mem_total_gb = 0
                    mem_used_gb = 0

                    for host in cluster.host:
                        hw = host.hardware
                        quick = host.summary.quickStats

                        cores = hw.cpuInfo.numCpuCores
                        hz = hw.cpuInfo.hz / 1_000_000  # Hz to MHz
                        cpu_total_mhz += cores * hz
                        cpu_used_mhz += quick.overallCpuUsage or 0

                        total_mem_gb = hw.memorySize / (1024 ** 3)
                        used_mem_gb = quick.overallMemoryUsage / 1024  # MB to GB
                        mem_total_gb += total_mem_gb
                        mem_used_gb += used_mem_gb

                    # Datastore summary
                    datastores = []
                    total_ds_capacity = 0
                    total_ds_free = 0

                    for ds in cluster.datastore:
                        ds_summary = ds.summary
                        capacity_gb = ds_summary.capacity / (1024 ** 3)
                        free_gb = ds_summary.freeSpace / (1024 ** 3)

                        total_ds_capacity += capacity_gb
                        total_ds_free += free_gb

                        datastores.append({
                            'name': ds_summary.name,
                            'capacity_gb': capacity_gb,
                            'free_space_gb': free_gb,
                            'accessible': ds_summary.accessible
                        })

                    clusters.append({
                        'name': cluster.name,
                        'num_hosts': len(cluster.host),
                        'num_vms': len(vms),
                        'vms_running': len(running),
                        'vms_stopped': len(stopped),
                        'overall_status': str(summary.overallStatus),
                        'total_storage_gb': total_ds_capacity,
                        'free_storage_gb': total_ds_free,
                        'cpu_total_mhz': cpu_total_mhz,
                        'cpu_used_mhz': cpu_used_mhz,
                        'memory_total_gb': mem_total_gb,
                        'memory_used_gb': mem_used_gb,
                        'datastores': datastores,
                    })
    return clusters
