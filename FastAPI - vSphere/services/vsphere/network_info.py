from pyVmomi import vim
from .connection import get_vsphere_connection

def get_networks_info():
    """
    Get all networks (port groups) from vSphere, including Standard and Distributed types.
    Returns:
        list: List of dicts with id (network name), moid (vSphere ID), name, vlan, type, description, datacenter_name
    """
    try:
        si = get_vsphere_connection()
        content = si.RetrieveContent()
        networks = []
        
        for dc in content.rootFolder.childEntity:
            if hasattr(dc, 'name'):
                datacenter_name = dc.name
                if hasattr(dc, 'networkFolder'):
                    for net in dc.networkFolder.childEntity:

                        if isinstance(net, vim.Network):
                            networks.append({
                                'id': net.name,  
                                'moid': getattr(net, '_moId', None),  
                                'name': net.name,
                                'vlan': getattr(net, 'vlanId', 0),
                                'type': 'Standard',
                                'description': str(getattr(net, 'summary', '')) if hasattr(net, 'summary') else '',
                                'datacenter_name': datacenter_name,
                            })
                        elif isinstance(net, vim.dvs.DistributedVirtualPortgroup):
                            config = net.config
                            vlan = 0
                            if hasattr(config, 'defaultPortConfig') and hasattr(config.defaultPortConfig, 'vlan'): 
                                vlan_spec = config.defaultPortConfig.vlan
                                if hasattr(vlan_spec, 'vlanId'):
                                    vlan = vlan_spec.vlanId
                            networks.append({
                                'id': net.name,  
                                'moid': getattr(net, '_moId', None),  
                                'name': net.name,
                                'vlan': vlan,
                                'type': 'Distributed',
                                'description': str(getattr(config, 'description', '')),
                                'datacenter_name': datacenter_name,
                            })
        return networks
    except Exception as e:
        raise Exception(f"Failed to retrieve network information: {str(e)}") 