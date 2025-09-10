from pyVmomi import vim
from .connection import get_vsphere_connection
from utils.safe_math import safe_div

def get_datastores_info():
    """
    Get comprehensive information about all datastores in vSphere
    
    Returns:
        list: List of dictionaries containing datastore information
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        si = get_vsphere_connection()
        content = si.RetrieveContent()
        datastores = []

        for dc in content.rootFolder.childEntity:
            for ds in dc.datastore:
                summary = ds.summary
                capacity_gb = safe_div(summary.capacity, 1024 ** 3)
                free_gb = safe_div(summary.freeSpace, 1024 ** 3)
                used_gb = capacity_gb - free_gb
                
                datastores.append({
                    'id': getattr(ds, '_moId', None),
                    'name': summary.name,
                    'capacity_gb': capacity_gb,
                    'free_space_gb': free_gb,
                    'used_space_gb': used_gb,
                    'uncommitted_gb': safe_div(summary.uncommitted or 0, 1024 ** 3),
                    'accessible': summary.accessible,
                    'type': summary.type,
                    'url': summary.url,
                    'maintenance_mode': summary.maintenanceMode,
                    'multiple_host_access': summary.multipleHostAccess,
                })
        
        return datastores
        
    except Exception as e:
        raise Exception(f"Failed to retrieve datastore information: {str(e)}")

def get_datastore_by_name(datastore_name: str):
    """
    Get information about a specific datastore by name
    
    Args:
        datastore_name (str): Name of the datastore to retrieve
        
    Returns:
        dict: Datastore information or None if not found
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        datastores = get_datastores_info()
        for datastore in datastores:
            if datastore['name'] == datastore_name:
                return datastore
        return None
        
    except Exception as e:
        raise Exception(f"Failed to retrieve datastore '{datastore_name}': {str(e)}")

def get_datastores_by_type(datastore_type: str):
    """
    Get all datastores of a specific type
    
    Args:
        datastore_type (str): Type of datastore (e.g., 'VMFS', 'NFS', 'vSAN')
        
    Returns:
        list: List of datastores of the specified type
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        datastores = get_datastores_info()
        filtered_datastores = [ds for ds in datastores if ds['type'] == datastore_type]
        return filtered_datastores
        
    except Exception as e:
        raise Exception(f"Failed to retrieve datastores of type '{datastore_type}': {str(e)}")

def get_datastores_by_accessible(accessible: bool = True):
    """
    Get all datastores by accessibility status
    
    Args:
        accessible (bool): Whether to return accessible (True) or inaccessible (False) datastores
        
    Returns:
        list: List of datastores with the specified accessibility
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        datastores = get_datastores_info()
        filtered_datastores = [ds for ds in datastores if ds['accessible'] == accessible]
        return filtered_datastores
        
    except Exception as e:
        raise Exception(f"Failed to retrieve datastores with accessibility {accessible}: {str(e)}")
