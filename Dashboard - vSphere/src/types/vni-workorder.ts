import type { IDateValue, IDatePickerControl } from './common';

// ----------------------------------------------------------------------

export type IVNIWorkOrderTableFilters = {
  owner: string;
  status: string;
  project: string[];
  endDate: IDatePickerControl;
  startDate: IDatePickerControl;
};

export type IVNIWorkOrder = {
  id: string;
  owner: string;
  requested_date: string;
  requested_by: string;
  virtual_machines: any[];
  deadline: string;
  project: string;
  t0_gw: string;
  t1_gw: string;
  description: string;
  vni_name: string;
  cidr: string;
  subnet_mask: string;
  gateway: string;
  first_ip: string;
  last_ip: string;
  number_of_ips: number;
  status: string;
  created_at: string;
  updated_at: string;
  last_execution_log?: string;
  notes?: string;
  priority: string;
  assigned_to?: string;
}; 