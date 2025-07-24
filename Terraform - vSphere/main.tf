terraform {
  required_providers {
    vsphere = {
      source  = "hashicorp/vsphere"
      version = ">= 2.0.0"
    }
  }
}

provider "vsphere" {
  user                 = "administrator@vsphere.local"
  password             = "Jess24793920@"
  vsphere_server       = "192.168.1.50"
  allow_unverified_ssl = true
}

# ---
# Add VM, network, and other resources here
# --- 

data "vsphere_datacenter" "dc" {
  name = var.datacenter_name
}

data "vsphere_datastore" "selected" {
  name          = var.datastore_id
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_network" "network" {
  name          = var.nics[0].network_name
  datacenter_id = data.vsphere_datacenter.dc.id
}

locals {
  resolved_datastore_id = startswith(var.datastore_id, "datastore-") ? var.datastore_id : data.vsphere_datastore.selected.id
}

resource "vsphere_virtual_machine" "vm" {
  name             = var.vm_name
  folder           = var.folder != "" ? var.folder : null
  resource_pool_id = var.resource_pool_id
  host_system_id   = var.host_system_id
  datastore_id     = local.resolved_datastore_id
  num_cpus         = var.cpu
  memory           = var.ram * 1024
  guest_id         = var.template_id != "" ? null : var.os
  hardware_version = var.hardware_version != "" ? var.hardware_version : null
  scsi_type        = var.scsi_controller_type != "" ? var.scsi_controller_type : null

  disk {
    label            = "disk0"
    size             = 20
    thin_provisioned = true
  }

  dynamic "clone" {
    for_each = var.template_id != "" ? [1] : []
    content {
      template_uuid = var.template_id
      customize {
        linux_options {
          host_name = var.hostname
          domain    = var.domain
        }
        network_interface {
          ipv4_address = var.ip
          ipv4_netmask = var.netmask
        }
        ipv4_gateway = var.gateway
      }
    }
  }

  network_interface {
    network_id   = data.vsphere_network.network.id
    adapter_type = "vmxnet3"
  }

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