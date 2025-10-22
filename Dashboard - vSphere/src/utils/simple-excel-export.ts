import * as XLSX from 'xlsx';

// ----------------------------------------------------------------------

export function exportWorkOrdersToExcel(data: any[], filename: string = 'workorders') {
  // Prepare data for Excel
  const excelData = data.map((order) => ({
    'ID': order.id,
    'Name': order.name || 'N/A',
    'OS': order.os || 'N/A',
    'IP': order.ip || 'N/A',
    'Gateway': order.gateway || 'N/A',
    'NetMask': order.netmask || 'N/A',
    'ULS': order.uls || 'N/A',
    'Site': order.site || 'N/A',
    'Cluster': order.cluster || 'N/A',
    'DataStore': order.datastore_id || 'N/A',
    'CPU': order.cpu || 0,
    'RAM (GB)': order.ram || 0,
    'Disk (GB)': order.disk || 0,
    'Users': Array.isArray(order.users) ? order.users.join(', ') : 'N/A',
    'Status': order.status || 'N/A',
    'Created At': order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A',
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 20 }, // Name
    { wch: 15 }, // OS
    { wch: 15 }, // IP
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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Orders');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fullFilename = `${filename}-${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fullFilename);
}

export function exportVNIWorkOrdersToExcel(data: any[], filename: string = 'vni-workorders') {
  // Prepare data for Excel
  const excelData = data.map((order) => ({
    'ID': order.id,
    'Owner': order.owner || 'N/A',
    'Requested By': order.requested_by || 'N/A',
    'VNI Type': order.vni_type || 'N/A',
    'Project': order.project || 'N/A',
    'Description': order.description || 'N/A',
    'Priority': order.priority || 'N/A',
    'Deadline': order.deadline ? new Date(order.deadline).toLocaleString() : 'N/A',
    'T0 Gateway': order.t0_gw || 'N/A',
    'T1 Gateway': order.t1_gw || 'N/A',
    'VNI Name': order.vni_name || 'N/A',
    'CIDR': order.cidr || 'N/A',
    'Subnet Mask': order.subnet_mask || 'N/A',
    'Gateway IP': order.gateway || 'N/A',
    'First IP': order.first_ip || 'N/A',
    'Last IP': order.last_ip || 'N/A',
    'Number of IPs': order.number_of_ips || 0,
    'Status': order.status || 'N/A',
    'Created At': order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A',
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
