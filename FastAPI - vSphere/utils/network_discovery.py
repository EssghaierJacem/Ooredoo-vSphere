#!/usr/bin/env python3
"""
Utility script to list all networks in vCenter.
This is a development/debugging tool, not part of the main application.
"""

import sys
import os

# Add the parent directory to the path so we can import from services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.vsphere.connection import get_vsphere_connection
from pyVmomi import vim

def list_networks():
    """List all networks in vCenter with their names and MOIDs."""
    try:
        si = get_vsphere_connection()
        content = si.RetrieveContent()
        
        print("=== vCenter Networks ===\n")
        
        for dc in content.rootFolder.childEntity:
            if hasattr(dc, 'name'):
                print(f"Datacenter: {dc.name}")
                print("-" * 50)
                
                if hasattr(dc, 'networkFolder'):
                    for net in dc.networkFolder.childEntity:
                        # Standard Port Group
                        if isinstance(net, vim.Network):
                            print(f"  Network: {net.name}")
                            print(f"    Type: Standard Port Group")
                            print(f"    MOID: {getattr(net, '_moId', 'N/A')}")
                            print(f"    VLAN: {getattr(net, 'vlanId', 'N/A')}")
                            print()
                        # Distributed Port Group
                        elif isinstance(net, vim.dvs.DistributedVirtualPortgroup):
                            config = net.config
                            vlan = 0
                            if hasattr(config, 'defaultPortConfig') and hasattr(config.defaultPortConfig, 'vlan'): 
                                vlan_spec = config.defaultPortConfig.vlan
                                if hasattr(vlan_spec, 'vlanId'):
                                    vlan = vlan_spec.vlanId
                            print(f"  Network: {net.name}")
                            print(f"    Type: Distributed Port Group")
                            print(f"    MOID: {getattr(net, '_moId', 'N/A')}")
                            print(f"    VLAN: {vlan}")
                            print()
                else:
                    print("  No networks found in this datacenter")
                print()

if __name__ == "__main__":
    list_networks() 