from pyVmomi import vim
from .connection import get_vsphere_connection

def get_datastores_info():
    si = get_vsphere_connection()
    content = si.RetrieveContent()
    datastores = []

    for dc in content.rootFolder.childEntity:
        for ds in dc.datastore:
            summary = ds.summary
            datastores.append({
                'name': summary.name,
                'capacity_gb': summary.capacity / (1024 ** 3),
                'free_space_gb': summary.freeSpace / (1024 ** 3),
                'uncommitted_gb': (summary.uncommitted or 0) / (1024 ** 3),
                'accessible': summary.accessible
            })
    return datastores
