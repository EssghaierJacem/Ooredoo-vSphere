variable "vsphere_user" {
  description = "vSphere username"
  type        = string
}

variable "vsphere_password" {
  description = "vSphere password"
  type        = string
  sensitive   = true
}

variable "vsphere_server" {
  description = "vCenter server address"
  type        = string
}

variable "vm_name" {
  description = "Name of the VM to create"
  type        = string
}

variable "os" {
  description = "Operating system for the VM"
  type        = string
}

variable "cpu" {
  description = "Number of CPUs for the VM"
  type        = number
}

variable "ram" {
  description = "RAM (in GB) for the VM"
  type        = number
}

variable "host_system_id" {
  description = "The vSphere managed object ID of the host to place the VM on."
  type        = string
}

variable "datastore_id" {
  description = "Datastore ID or name for VM storage (can be a vSphere MOID or a human-readable name)"
  type        = string
  default     = ""
}

variable "nics" {
  description = "List of network interfaces for the VM. Each NIC must have network_name (e.g., 'VM Network')."
  type = list(object({
    ip           = string
    network_name = string
  }))
  default = [
    {
      ip           = ""
      network_name = "VM Network"
    }
  ]
}

variable "resource_pool_id" {
  description = "The vSphere resource pool ID to place the VM in."
  type        = string
}

variable "ip_pool_id" {
  description = "The IP pool ID to use for networking (optional, for future use)."
  type        = string
  default     = ""
}

variable "template_id" {
  description = "The vSphere VM template UUID to clone from."
  type        = string
  default     = ""
}

variable "hostname" {
  description = "Hostname for the VM."
  type        = string
  default     = ""
}
variable "ip" {
  description = "IPv4 address for the VM."
  type        = string
  default     = ""
}
variable "netmask" {
  description = "IPv4 netmask for the VM."
  type        = string
  default     = ""
}
variable "gateway" {
  description = "IPv4 gateway for the VM."
  type        = string
  default     = ""
}
variable "domain" {
  description = "Domain for the VM."
  type        = string
  default     = "local"
}
variable "folder" {
  description = "The vSphere folder to place the VM in."
  type        = string
  default     = ""
}
variable "hardware_version" {
  description = "The VM hardware version."
  type        = string
  default     = ""
}
variable "scsi_controller_type" {
  description = "The SCSI controller type."
  type        = string
  default     = ""
}
variable "network_id" {
  description = "The vSphere network name for the primary NIC (e.g., 'VM Network', 'Management Network')."
  type        = string
  default     = ""
}
variable "datacenter_name" {
  description = "The name of the vSphere datacenter to use for resource lookups."
  type        = string
} 