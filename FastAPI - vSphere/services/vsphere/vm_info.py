from pyVmomi import vim
from .connection import get_vsphere_connection

def get_vms_info():
    """
    Get comprehensive information about all virtual machines in vSphere
    
    Returns:
        list: List of dictionaries containing VM information
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        si = get_vsphere_connection()
        content = si.RetrieveContent()
        vms = []

        # Get all VMs from the content
        container = content.viewManager.CreateContainerView(
            content.rootFolder, [vim.VirtualMachine], True
        )
        
        for vm in container.view:
            summary = vm.summary
            config = vm.config
            runtime = vm.runtime
            guest = vm.guest
            
            # Calculate resource usage - handle missing attributes safely
            cpu_usage_mhz = 0
            memory_usage_mb = 0
            memory_usage_gb = 0
            
            # Get CPU usage from quickStats if available
            if hasattr(summary, 'quickStats') and summary.quickStats:
                quick_stats = summary.quickStats
                if hasattr(quick_stats, 'overallCpuUsage'):
                    cpu_usage_mhz = quick_stats.overallCpuUsage or 0
                if hasattr(quick_stats, 'overallMemoryUsage'):
                    memory_usage_mb = quick_stats.overallMemoryUsage or 0
                    memory_usage_gb = memory_usage_mb / 1024
            
            # Get VM hardware info
            num_cpu = 0
            memory_gb = 0
            if config and hasattr(config, 'hardware') and config.hardware:
                num_cpu = config.hardware.numCPU if hasattr(config.hardware, 'numCPU') else 0
                memory_mb = config.hardware.memoryMB if hasattr(config.hardware, 'memoryMB') else 0
                memory_gb = memory_mb / 1024
            
            # Get datastore info
            datastores = []
            if hasattr(vm, 'datastore') and vm.datastore:
                for ds in vm.datastore:
                    datastores.append({
                        'name': ds.name,
                        'url': ds.summary.url if hasattr(ds.summary, 'url') else None
                    })
            
            # Get network info
            networks = []
            if hasattr(vm, 'network') and vm.network:
                for network in vm.network:
                    networks.append({
                        'name': network.name,
                        'type': type(network).__name__
                    })
            
            # Get guest tools status
            tools_status = "unknown"
            tools_running = False
            if guest:
                tools_status = guest.toolsRunningStatus if hasattr(guest, 'toolsRunningStatus') else "unknown"
                tools_running = guest.toolsRunningStatus == "guestToolsRunning" if hasattr(guest, 'toolsRunningStatus') else False
            
            # Get IP addresses safely
            ip_addresses = []
            if guest and hasattr(guest, 'ipAddress') and guest.ipAddress:
                ip_addresses = guest.ipAddress
            
            # Get hostname safely
            hostname = None
            if guest and hasattr(guest, 'hostName'):
                hostname = guest.hostName
            
            vm_info = {
                'name': vm.name,
                'uuid': vm.config.uuid if config and hasattr(config, 'uuid') else None,
                'power_state': runtime.powerState if hasattr(runtime, 'powerState') else "unknown",
                'connection_state': runtime.connectionState if hasattr(runtime, 'connectionState') else "unknown",
                'overall_status': str(summary.overallStatus) if hasattr(summary, 'overallStatus') else "unknown",
                'guest_id': config.guestId if config and hasattr(config, 'guestId') else None,
                'guest_full_name': config.guestFullName if config and hasattr(config, 'guestFullName') else None,
                'num_cpu': num_cpu,
                'memory_gb': memory_gb,
                'cpu_usage_mhz': cpu_usage_mhz,
                'memory_usage_gb': memory_usage_gb,
                'tools_status': tools_status,
                'tools_running': tools_running,
                'ip_addresses': ip_addresses,
                'hostname': hostname,
                'datastores': datastores,
                'networks': networks,
                'folder_path': vm.parent.name if vm.parent else None,
                'resource_pool': vm.resourcePool.name if vm.resourcePool else None,
                'template': config.template if config and hasattr(config, 'template') else False,
                'version': config.version if config and hasattr(config, 'version') else None,
                'annotation': config.annotation if config and hasattr(config, 'annotation') else None,
            }
            
            vms.append(vm_info)
        
        return vms
        
    except Exception as e:
        raise Exception(f"Failed to retrieve VM information: {str(e)}")

def get_vm_by_name(vm_name: str):
    """
    Get information about a specific VM by name
    
    Args:
        vm_name (str): Name of the VM to retrieve
        
    Returns:
        dict: VM information or None if not found
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        vms = get_vms_info()
        for vm in vms:
            if vm['name'] == vm_name:
                return vm
        return None
        
    except Exception as e:
        raise Exception(f"Failed to retrieve VM '{vm_name}': {str(e)}")

def get_vms_by_power_state(power_state: str):
    """
    Get all VMs with a specific power state
    
    Args:
        power_state (str): Power state to filter by (e.g., 'poweredOn', 'poweredOff', 'suspended')
        
    Returns:
        list: List of VMs with the specified power state
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        vms = get_vms_info()
        filtered_vms = [vm for vm in vms if vm['power_state'] == power_state]
        return filtered_vms
        
    except Exception as e:
        raise Exception(f"Failed to retrieve VMs with power state '{power_state}': {str(e)}")

def get_vms_by_tools_status(tools_status: str):
    """
    Get all VMs with a specific VMware Tools status
    
    Args:
        tools_status (str): Tools status to filter by (e.g., 'guestToolsRunning', 'guestToolsNotRunning')
        
    Returns:
        list: List of VMs with the specified tools status
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        vms = get_vms_info()
        filtered_vms = [vm for vm in vms if vm['tools_status'] == tools_status]
        return filtered_vms
        
    except Exception as e:
        raise Exception(f"Failed to retrieve VMs with tools status '{tools_status}': {str(e)}")

def get_templates():
    """
    Get all VM templates
    
    Returns:
        list: List of VM templates
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    try:
        vms = get_vms_info()
        templates = [vm for vm in vms if vm['template']]
        return templates
        
    except Exception as e:
        raise Exception(f"Failed to retrieve VM templates: {str(e)}")

def get_running_vms():
    """
    Get all running VMs
    
    Returns:
        list: List of running VMs
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    return get_vms_by_power_state('poweredOn')

def get_stopped_vms():
    """
    Get all stopped VMs
    
    Returns:
        list: List of stopped VMs
        
    Raises:
        Exception: If connection or data retrieval fails
    """
    return get_vms_by_power_state('poweredOff') 