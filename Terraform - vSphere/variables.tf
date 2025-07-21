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

variable "disk" {
  description = "Primary disk size (in GB) for the VM"
  type        = number
}

variable "host_system_id" {
  description = "The vSphere managed object ID of the host to place the VM on."
  type        = string
}

variable "datastore_id" {
  description = "Datastore ID for VM storage"
  type        = string
  default     = ""
}

variable "disks" {
  description = "List of additional disks for the VM"
  type        = any
  default     = null
}

variable "nics" {
  description = "List of network interfaces for the VM"
  type        = any
  default     = null
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