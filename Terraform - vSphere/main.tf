terraform {
  required_providers {
    vsphere = {
      source  = "hashicorp/vsphere"
      version = ">= 2.0.0"
    }
  }
}

provider "vsphere" {
  user                 = "X"
  password             = "X"
  vsphere_server       = "X"
  allow_unverified_ssl = true
}

# ---
# Add VM, network, and other resources here
# --- 

resource "vsphere_virtual_machine" "vm" {
  name             = var.vm_name
  resource_pool_id = var.resource_pool_id
  host_system_id   = var.host_system_id # This should be the vSphere managed object ID (e.g., host-123)
  datastore_id     = var.datastore_id
  num_cpus         = var.cpu
  memory           = var.ram * 1024 # RAM in MB
  guest_id         = var.os # Should match vSphere guest IDs (e.g., "ubuntu64Guest")

  # Optional: folder, cluster, etc. can be added as variables

  dynamic "disk" {
    for_each = var.disks != null ? var.disks : []
    content {
      label            = lookup(disk.value, "label", null)
      size             = lookup(disk.value, "size", null)
      eagerly_scrub    = lookup(disk.value, "eagerly_scrub", false)
      thin_provisioned = lookup(disk.value, "provisioning", "thin") == "thin"
      # Add more disk options as needed
    }
  }

  dynamic "network_interface" {
    for_each = var.nics != null ? var.nics : []
    content {
      network_id   = lookup(network_interface.value, "network_id", null)
      adapter_type = lookup(network_interface.value, "adapter_type", null)
      # To set static IPs, use the clone/customize block as shown below
    }
  }

  # Example: Guest customization for static IP (requires a template VM)
  # clone {
  #   template_uuid = "your-template-uuid"
  #   customize {
  #     linux_options {
  #       host_name = var.vm_name
  #       domain    = "local"
  #     }
  #     network_interface {
  #       ipv4_address = lookup(var.nics[0], "ip", null)
  #       ipv4_netmask = lookup(var.nics[0], "mask", null)
  #     }
  #   }
  # }

  # Optionally add customization, domain, dns, etc.

  lifecycle {
    ignore_changes = [disk, network_interface]
  }
}

output "vm_id" {
  value = vsphere_virtual_machine.vm.id
}
output "vm_name" {
  value = vsphere_virtual_machine.vm.name
}
output "vm_power_state" {
  value = vsphere_virtual_machine.vm.power_state
} 