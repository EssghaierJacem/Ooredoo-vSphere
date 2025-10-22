import type { IDateValue, IDatePickerControl } from './common';

// ----------------------------------------------------------------------

export type IWorkOrderTableFilters = {
  name: string;
  os: string;
  site: string;
  cluster: string;
  status: string;
  startDate: IDatePickerControl;
  endDate: IDatePickerControl;
};

export type IWorkOrder = {
  id: string;
  
  // General Information
  name: string;  // VM Name
  os: string;    // OS Type
  
  // Network Configuration
  ip?: string;
  gateway?: string;
  netmask?: string;
  uls?: string;
  
  // Location
  site?: string;     // OT-CHARGUIA or OT-MGHIRA
  cluster?: string;  // Edge, ITaaS Workload, etc.
  datastore_id?: string;  // Manual input
  
  // Resources
  cpu: number;
  ram: number;
  disk: number;
  
  // Users
  users?: string[];  // Array of users: Userapp, Oss, Optim, Ingdba, Ingsec, Other
  
  // Status and metadata
  status: string;
  created_at: string;
  
  // Legacy fields (keeping for compatibility)
  host_id?: string;
  vm_id?: string;
  disks?: any;
  nics?: any;
  last_execution_log?: string;
  resource_pool_id?: string;
  ip_pool_id?: string;
  template_id?: string;
  hostname?: string;
  domain?: string;
  hardware_version?: string;
  scsi_controller_type?: string;
  folder_id?: string;
  network_id?: string;
  datacenter_name?: string;
};
