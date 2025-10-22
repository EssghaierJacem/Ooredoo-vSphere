import * as XLSX from 'xlsx';

// ----------------------------------------------------------------------

export interface VMWorkOrderExportData {
  id: string;
  name: string;
  os: string;
  ip?: string;
  gateway?: string;
  netmask?: string;
  uls?: string;
  site?: string;
  cluster?: string;
  datastore_id?: string;
  cpu: number;
  ram: number;
  disk: number;
  users?: string[];
  status: string;
  created_at: string;
}

export interface VNIWorkOrderExportData {
  id: string;
  owner: string;
  requested_by: string;
  vni_type: string;
  project: string;
  description: string;
  priority: string;
  deadline: string;
  t0_gw: string;
  t1_gw: string;
  vni_name: string;
  cidr: string;
  subnet_mask: string;
  gateway: string;
  first_ip: string;
  last_ip: string;
  number_of_ips: number;
  status: string;
  created_at: string;
}

// ----------------------------------------------------------------------

export function exportVMWorkOrdersToExcel(data: VMWorkOrderExportData[], filename: string = 'vm-workorders') {
  // Prepare data for Excel
  const excelData = data.map((order) => ({
    'ID': order.id,
    'VM Name': order.name,
    'OS Type': order.os,
    'IP Address': order.ip || 'N/A',
    'Gateway': order.gateway || 'N/A',
    'NetMask': order.netmask || 'N/A',
    'ULS': order.uls || 'N/A',
    'Site': order.site || 'N/A',
    'Cluster': order.cluster || 'N/A',
    'DataStore': order.datastore_id || 'N/A',
    'CPU': order.cpu,
    'RAM (GB)': order.ram,
    'Disk (GB)': order.disk,
    'Users': Array.isArray(order.users) ? order.users.join(', ') : 'N/A',
    'Status': order.status,
    'Created At': new Date(order.created_at).toLocaleString(),
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 20 }, // VM Name
    { wch: 15 }, // OS Type
    { wch: 15 }, // IP Address
    { wch: 15 }, // Gateway
    { wch: 15 }, // NetMask
    { wch: 10 }, // ULS
    { wch: 15 }, // Site
    { wch: 20 }, // Cluster
    { wch: 15 }, // DataStore
    { wch: 8 },  // CPU
    { wch: 10 }, // RAM
    { wch: 10 }, // Disk
    { wch: 25 }, // Users
    { wch: 12 }, // Status
    { wch: 20 }, // Created At
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'VM Work Orders');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fullFilename = `${filename}-${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fullFilename);
}

export function exportVNIWorkOrdersToExcel(data: VNIWorkOrderExportData[], filename: string = 'vni-workorders') {
  // Prepare data for Excel
  const excelData = data.map((order) => ({
    'ID': order.id,
    'Owner': order.owner,
    'Requested By': order.requested_by,
    'VNI Type': order.vni_type,
    'Project': order.project,
    'Description': order.description,
    'Priority': order.priority,
    'Deadline': new Date(order.deadline).toLocaleString(),
    'T0 Gateway': order.t0_gw,
    'T1 Gateway': order.t1_gw,
    'VNI Name': order.vni_name,
    'CIDR': order.cidr,
    'Subnet Mask': order.subnet_mask,
    'Gateway IP': order.gateway,
    'First IP': order.first_ip,
    'Last IP': order.last_ip,
    'Number of IPs': order.number_of_ips,
    'Status': order.status,
    'Created At': new Date(order.created_at).toLocaleString(),
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 15 }, // Owner
    { wch: 15 }, // Requested By
    { wch: 12 }, // VNI Type
    { wch: 15 }, // Project
    { wch: 25 }, // Description
    { wch: 10 }, // Priority
    { wch: 20 }, // Deadline
    { wch: 15 }, // T0 Gateway
    { wch: 15 }, // T1 Gateway
    { wch: 20 }, // VNI Name
    { wch: 20 }, // CIDR
    { wch: 15 }, // Subnet Mask
    { wch: 15 }, // Gateway IP
    { wch: 15 }, // First IP
    { wch: 15 }, // Last IP
    { wch: 15 }, // Number of IPs
    { wch: 12 }, // Status
    { wch: 20 }, // Created At
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'VNI Work Orders');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fullFilename = `${filename}-${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fullFilename);
}

// ----------------------------------------------------------------------

export function exportSummaryToExcel(
  vmData: VMWorkOrderExportData[], 
  vniData: VNIWorkOrderExportData[], 
  filename: string = 'workorders-summary'
) {
  const workbook = XLSX.utils.book_new();

  // VM Work Orders Sheet
  const vmExcelData = vmData.map((order) => ({
    'ID': order.id,
    'VM Name': order.name,
    'OS Type': order.os,
    'Site': order.site || 'N/A',
    'Cluster': order.cluster || 'N/A',
    'CPU': order.cpu,
    'RAM (GB)': order.ram,
    'Disk (GB)': order.disk,
    'Status': order.status,
    'Created At': new Date(order.created_at).toLocaleString(),
  }));

  const vmWorksheet = XLSX.utils.json_to_sheet(vmExcelData);
  vmWorksheet['!cols'] = [
    { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, vmWorksheet, 'VM Work Orders');

  // VNI Work Orders Sheet
  const vniExcelData = vniData.map((order) => ({
    'ID': order.id,
    'VNI Name': order.vni_name,
    'VNI Type': order.vni_type,
    'Project': order.project,
    'Priority': order.priority,
    'Status': order.status,
    'Created At': new Date(order.created_at).toLocaleString(),
  }));

  const vniWorksheet = XLSX.utils.json_to_sheet(vniExcelData);
  vniWorksheet['!cols'] = [
    { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, vniWorksheet, 'VNI Work Orders');

  // Summary Sheet
  const summaryData = [
    { 'Metric': 'Total VM Work Orders', 'Count': vmData.length },
    { 'Metric': 'Total VNI Work Orders', 'Count': vniData.length },
    { 'Metric': 'Total Work Orders', 'Count': vmData.length + vniData.length },
    { 'Metric': 'Pending VMs', 'Count': vmData.filter(vm => vm.status === 'pending').length },
    { 'Metric': 'Approved VMs', 'Count': vmData.filter(vm => vm.status === 'approved').length },
    { 'Metric': 'Pending VNIs', 'Count': vniData.filter(vni => vni.status === 'pending').length },
    { 'Metric': 'Approved VNIs', 'Count': vniData.filter(vni => vni.status === 'approved').length },
  ];

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fullFilename = `${filename}-${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fullFilename);
}
