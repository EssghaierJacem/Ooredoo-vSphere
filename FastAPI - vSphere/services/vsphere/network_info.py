from pyVmomi import vim
from .connection import get_vsphere_connection

def get_networks_info():
    """
    Get all networks (port groups) from vSphere, including Standard and Distributed types.
    Returns:
        list: List of dicts with id, name, vlan, type, description
    """
    try:
        si = get_vsphere_connection()
        content = si.RetrieveContent()
        networks = []
        net_id = 1
        for dc in content.rootFolder.childEntity:
            if hasattr(dc, 'networkFolder'):
                for net in dc.networkFolder.childEntity:
                    # Standard Port Group
                    if isinstance(net, vim.Network):
                        networks.append({
                            'id': net_id,
                            'name': net.name,
                            'vlan': getattr(net, 'vlanId', 0),
                            'type': 'Standard',
                            'description': str(getattr(net, 'summary', '')) if hasattr(net, 'summary') else '',
                        })
                        net_id += 1
                    # Distributed Port Group
                    elif isinstance(net, vim.dvs.DistributedVirtualPortgroup):
                        config = net.config
                        vlan = 0
                        if hasattr(config, 'defaultPortConfig') and hasattr(config.defaultPortConfig, 'vlan'): 
                            vlan_spec = config.defaultPortConfig.vlan
                            if hasattr(vlan_spec, 'vlanId'):
                                vlan = vlan_spec.vlanId
                        networks.append({
                            'id': net_id,
                            'name': net.name,
                            'vlan': vlan,
                            'type': 'Distributed',
                            'description': str(getattr(config, 'description', '')),
                        })
                        net_id += 1
        return networks
    except Exception as e:
        raise Exception(f"Failed to retrieve network information: {str(e)}") 