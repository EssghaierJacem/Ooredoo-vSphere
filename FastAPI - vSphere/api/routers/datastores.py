from fastapi import APIRouter, HTTPException
from services.vsphere.datastore_info import (
    get_datastores_info, 
    get_datastore_by_name, 
    get_datastores_by_type, 
    get_datastores_by_accessible
)

router = APIRouter(
    prefix="/datastores",
    tags=["Datastores"]
)

@router.get("/")
def read_datastores():
    """
    Get all datastores information
    """
    try:
        return get_datastores_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{datastore_name}")
def read_datastore(datastore_name: str):
    """
    Get information about a specific datastore by name
    """
    try:
        datastore = get_datastore_by_name(datastore_name)
        if datastore is None:
            raise HTTPException(status_code=404, detail=f"Datastore '{datastore_name}' not found")
        return datastore
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/type/{datastore_type}")
def read_datastores_by_type(datastore_type: str):
    """
    Get all datastores of a specific type
    """
    try:
        datastores = get_datastores_by_type(datastore_type)
        return datastores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/accessible/{accessible}")
def read_datastores_by_accessible(accessible: bool = True):
    """
    Get all datastores by accessibility status
    """
    try:
        datastores = get_datastores_by_accessible(accessible)
        return datastores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/overview")
def get_datastores_summary():
    """
    Get a summary overview of all datastores
    """
    try:
        datastores = get_datastores_info()
        total_datastores = len(datastores)
        accessible_datastores = len([ds for ds in datastores if ds['accessible']])
        inaccessible_datastores = len([ds for ds in datastores if not ds['accessible']])
        
        total_capacity_gb = sum(ds['capacity_gb'] for ds in datastores)
        total_free_gb = sum(ds['free_space_gb'] for ds in datastores)
        total_used_gb = sum(ds['used_space_gb'] for ds in datastores)
        
        # Group by type
        type_counts = {}
        for ds in datastores:
            ds_type = ds['type']
            type_counts[ds_type] = type_counts.get(ds_type, 0) + 1
        
        return {
            "total_datastores": total_datastores,
            "accessible_datastores": accessible_datastores,
            "inaccessible_datastores": inaccessible_datastores,
            "total_capacity_gb": total_capacity_gb,
            "total_free_gb": total_free_gb,
            "total_used_gb": total_used_gb,
            "usage_percent": (total_used_gb / total_capacity_gb * 100) if total_capacity_gb > 0 else 0,
            "type_distribution": type_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
