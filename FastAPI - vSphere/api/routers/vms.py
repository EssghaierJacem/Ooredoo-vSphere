from fastapi import APIRouter, HTTPException
from services.vsphere.vm_info import (
    get_vms_info, 
    get_vm_by_name, 
    get_vms_by_power_state, 
    get_vms_by_tools_status,
    get_templates,
    get_running_vms,
    get_stopped_vms
)

router = APIRouter(
    prefix="/vms",
    tags=["VMs"]
)

@router.get("/")
def read_vms():
    """
    Get all virtual machines information
    """
    try:
        return get_vms_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{vm_name}")
def read_vm(vm_name: str):
    """
    Get information about a specific VM by name
    """
    try:
        vm = get_vm_by_name(vm_name)
        if vm is None:
            raise HTTPException(status_code=404, detail=f"VM '{vm_name}' not found")
        return vm
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/power-state/{power_state}")
def read_vms_by_power_state(power_state: str):
    """
    Get all VMs with a specific power state
    """
    try:
        vms = get_vms_by_power_state(power_state)
        return vms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tools-status/{tools_status}")
def read_vms_by_tools_status(tools_status: str):
    """
    Get all VMs with a specific VMware Tools status
    """
    try:
        vms = get_vms_by_tools_status(tools_status)
        return vms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates/all")
def read_templates():
    """
    Get all VM templates
    """
    try:
        templates = get_templates()
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/running/all")
def read_running_vms():
    """
    Get all running VMs
    """
    try:
        vms = get_running_vms()
        return vms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stopped/all")
def read_stopped_vms():
    """
    Get all stopped VMs
    """
    try:
        vms = get_stopped_vms()
        return vms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/overview")
def get_vms_summary():
    """
    Get a summary overview of all VMs
    """
    try:
        vms = get_vms_info()
        total_vms = len(vms)
        running_vms = len([vm for vm in vms if vm['power_state'] == 'poweredOn'])
        stopped_vms = len([vm for vm in vms if vm['power_state'] == 'poweredOff'])
        suspended_vms = len([vm for vm in vms if vm['power_state'] == 'suspended'])
        templates = len([vm for vm in vms if vm['template']])
        
        vms_with_tools = len([vm for vm in vms if vm['tools_running']])
        vms_without_tools = len([vm for vm in vms if not vm['tools_running']])
        
        total_cpu = sum(vm['num_cpu'] for vm in vms)
        total_memory_gb = sum(vm['memory_gb'] for vm in vms)
        total_cpu_usage_mhz = sum(vm['cpu_usage_mhz'] for vm in vms)
        total_memory_usage_gb = sum(vm['memory_usage_gb'] for vm in vms)
        
        return {
            "total_vms": total_vms,
            "running_vms": running_vms,
            "stopped_vms": stopped_vms,
            "suspended_vms": suspended_vms,
            "templates": templates,
            "vms_with_tools": vms_with_tools,
            "vms_without_tools": vms_without_tools,
            "total_cpu_cores": total_cpu,
            "total_memory_gb": total_memory_gb,
            "total_cpu_usage_mhz": total_cpu_usage_mhz,
            "total_memory_usage_gb": total_memory_usage_gb,
            "cpu_usage_percent": safe_div(total_cpu_usage_mhz, (total_cpu * 2000)) * 100,  # Assuming 2GHz per core
            "memory_usage_percent": safe_div(total_memory_usage_gb, total_memory_gb) * 100
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
