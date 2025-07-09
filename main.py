from vsphere_client.cluster_info import get_clusters_info
from vsphere_client.host_info import get_hosts_info
from vsphere_client.datastore_info import get_datastores_info

if __name__ == "__main__":
    print("\n📦 Clusters :")
    for c in get_clusters_info():
        print(f" - {c['name']} | Hosts: {c['num_hosts']} | VMs: {c['num_vms']} ({c['vms_running']} running)")
        print(f"   CPU: {c['cpu_used_mhz']:.0f}/{c['cpu_total_mhz']:.0f} MHz used")
        print(f"   RAM: {c['memory_used_gb']:.1f}/{c['memory_total_gb']:.1f} GB used")
        print(f"   Storage: {c['free_storage_gb']:.1f}/{c['total_storage_gb']:.1f} GB free")
        print(f"   Status: {c['overall_status']}")


    print("\n🖥️ Hosts :")
    for h in get_hosts_info():
        print(f" - {h['name']} | {h['cpu_model']}")
        print(f"   CPU: {h['cpu_used_mhz']:.0f}/{h['cpu_total_mhz']:.0f} MHz used ({h['cpu_free_mhz']:.0f} MHz free)")
        print(f"   RAM: {h['memory_used_gb']:.1f}/{h['memory_total_gb']:.1f} GB used ({h['memory_free_gb']:.1f} GB free)")
        print(f"   State: {h['power_state']} | Connection: {h['connection_state']}")


    print("\n💽 Datastores :")
    for d in get_datastores_info():
        print(f" - {d['name']} | {d['capacity_gb']:.1f} GB total | {d['free_space_gb']:.1f} GB free")
