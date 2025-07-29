import { useEffect, useState } from 'react';
import { useParams } from 'src/routes/hooks/use-params';
import { fetchWorkOrderById, updateWorkOrder, fetchHosts, fetchVMs, fetchDatastores, fetchNetworks, fetchResourcePools, fetchIPPools, fetchTemplates, fetchFolders, fetchDatacenters } from 'src/lib/api';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];
const DISK_PROVISION_OPTIONS = [
  { value: 'thin', label: 'Thin Provision', help: 'Uses only as much space as needed, grows as data is written. Fastest to create, lowest performance for first writes.' },
  { value: 'thick-lazy', label: 'Thick Provision Lazy Zeroed', help: 'Allocates all space up front, zeroes blocks on first write. Fast to create, better performance than thin.' },
  { value: 'thick-eager', label: 'Thick Provision Eager Zeroed', help: 'Allocates and zeroes all space up front. Slowest to create, best performance, required for some features.' },
];

export default function WorkOrderEditPage() {
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hosts, setHosts] = useState<any[]>([]);
  const [vms, setVMs] = useState<any[]>([]);
  const [datastores, setDatastores] = useState<any[]>([]);
  const [hostSupport, setHostSupport] = useState<string | null>(null);
  const [networks, setNetworks] = useState<any[]>([]);
  const [resourcePools, setResourcePools] = useState<any[]>([]);
  const [ipPools, setIPPools] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (id !== undefined) {
      setLoading(true);
      Promise.all([
        fetchWorkOrderById(id),
        fetchHosts(),
        fetchVMs(),
        fetchDatastores(),
        fetchNetworks(),
        fetchResourcePools(),
        fetchIPPools(),
        fetchTemplates(),
        fetchFolders(),
        fetchDatacenters(),
      ])
        .then(([wo, hosts, vms, datastores, networks, resourcePools, ipPools, templates, folders, datacenters]) => {
          // Ensure IDs are always strings for select fields
          let status = STATUS_OPTIONS.includes(wo.status) ? wo.status : STATUS_OPTIONS[0];
          let host_id = wo.host_id !== undefined && wo.host_id !== null ? String(wo.host_id) : '';
          let vm_id = wo.vm_id !== undefined && wo.vm_id !== null ? String(wo.vm_id) : '';
          // Always use the id for datastore_id
          let datastore_id = '';
          if (wo.datastore_id && datastores.some(ds => String(ds.id) === String(wo.datastore_id))) {
            datastore_id = String(wo.datastore_id);
          } else if (wo.datastore_id && datastores.some(ds => ds.name === wo.datastore_id)) {
            // If old workorder used name, map to id
            const found = datastores.find(ds => ds.name === wo.datastore_id);
            datastore_id = found ? String(found.id) : '';
          } else if (datastores.length > 0) {
            datastore_id = String(datastores[0].id);
          }
          if (hosts.length > 0 && !hosts.some(h => String(h.id) === host_id)) {
            host_id = String(hosts[0].id);
          }
          if (vms.length > 0 && !vms.some(vm => String(vm.name) === vm_id)) {
            vm_id = String(vms[0].name);
          }
          const normalizedWO = {
            ...wo,
            status,
            host_id,
            vm_id,
            datastore_id,
          };
          setWorkOrder(normalizedWO);
          setHosts(hosts);
          setVMs(vms);
          setDatastores(datastores);
          setNetworks(networks);
          setResourcePools(resourcePools);
          setIPPools(ipPools);
          setTemplates(templates);
          setFolders(folders);
          setDatacenters(datacenters);
          setInitialized(false); 
          // Host support logic
          const host = hosts.find((h) => String(h.id) === String(host_id));
          if (host) {
            const enoughRam = host.memory_free_gb >= normalizedWO.ram;
            const enoughCpu = host.cpu_free_mhz >= (normalizedWO.cpu * 1000);
            if (enoughRam && enoughCpu) {
              setHostSupport(`Host ${host.name} supports this work order.`);
            } else {
              setHostSupport('Selected host may not support the requested resources.');
            }
          } else {
            setHostSupport(null);
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setError('Invalid work order ID');
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    setWorkOrder({ ...workOrder, [e.target.name as string]: e.target.value });
    if (e.target.name === 'host_id') {
      const host = hosts.find((h) => String(h.id) === String(e.target.value));
      if (host) {
        const enoughRam = host.memory_free_gb >= workOrder.ram;
        const enoughCpu = host.cpu_free_mhz >= (workOrder.cpu * 1000);
        if (enoughRam && enoughCpu) {
          setHostSupport(`Host ${host.name} supports this work order.`);
        } else {
          setHostSupport('Selected host may not support the requested resources.');
        }
      } else {
        setHostSupport(null);
      }
    }
  };

  // Disk management
  const handleDiskChange = (idx: number, field: string, value: any) => {
    const disks = [...(workOrder.disks || [])];
    disks[idx] = { ...disks[idx], [field]: value };
    setWorkOrder({ ...workOrder, disks });
  };
  const handleAddDisk = () => {
    setWorkOrder({ ...workOrder, disks: [...(workOrder.disks || []), { size: '', provisioning: 'thin' }] });
  };
  const handleRemoveDisk = (idx: number) => {
    const disks = [...(workOrder.disks || [])];
    disks.splice(idx, 1);
    setWorkOrder({ ...workOrder, disks });
  };

  // NIC management
  const handleNicChange = (idx: number, field: string, value: any) => {
    const nics = [...(workOrder.nics || [])];
    nics[idx] = { ...nics[idx], [field]: field === 'network_name' ? String(value) : value };
    setWorkOrder({ ...workOrder, nics });
  };
  const handleAddNic = () => {
    setWorkOrder({ ...workOrder, nics: [...(workOrder.nics || []), { network_name: '', ip: '' }] });
  };
  const handleRemoveNic = (idx: number) => {
    const nics = [...(workOrder.nics || [])];
    nics.splice(idx, 1);
    setWorkOrder({ ...workOrder, nics });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    const newWorkOrder = { ...workOrder, [name]: String(value) };
    setWorkOrder(newWorkOrder);
    // If host is changed, update host support message immediately
    if (name === 'host_id') {
      const host = hosts.find((h) => String(h.id) === String(value));
      if (host) {
        const enoughRam = host.memory_free_gb >= newWorkOrder.ram;
        const enoughCpu = host.cpu_free_mhz >= (newWorkOrder.cpu * 1000);
        if (enoughRam && enoughCpu) {
          setHostSupport(`Host ${host.name} supports this work order.`);
        } else {
          setHostSupport('Selected host may not support the requested resources.');
        }
      } else {
        setHostSupport(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Ensure resource_pool_id is always set
    let updatedWorkOrder = { ...workOrder };
    if (!updatedWorkOrder.resource_pool_id && resourcePools.length > 0) {
      updatedWorkOrder.resource_pool_id = resourcePools[0].id;
      setWorkOrder(updatedWorkOrder);
    }
    // Ensure all fields are included in the update payload
    const payload = {
      ...updatedWorkOrder,
      disks: updatedWorkOrder.disks || [],
      nics: updatedWorkOrder.nics || [],
      template_id: updatedWorkOrder.template_id || '',
      hardware_version: updatedWorkOrder.hardware_version || '',
      scsi_controller_type: updatedWorkOrder.scsi_controller_type || '',
      folder_id: updatedWorkOrder.folder_id || '',
      network_id: updatedWorkOrder.network_id || '',
      hostname: updatedWorkOrder.hostname || '',
      ip: updatedWorkOrder.ip || '',
      netmask: updatedWorkOrder.netmask || '',
      gateway: updatedWorkOrder.gateway || '',
      domain: updatedWorkOrder.domain || '',
      os: updatedWorkOrder.os || '',
      datacenter_name: updatedWorkOrder.datacenter_name || 'Datacenter',
    };
    const saved = await updateWorkOrder(Number(id), payload);
    setWorkOrder(saved);
    setSaving(false);
    setSuccess(true);
  };

  const handleCancel = () => {
    if (id !== undefined) router.push(paths.dashboard.workorder.detail(id));
  };

  // Helper to get free space for selected datastore
  const getSelectedDatastoreFreeSpace = () => {
    const ds = datastores.find((d) => d.id === workOrder.datastore_id);
    return ds ? ds.free_space_gb : null;
  };

  const SECTION_HEADER_SX = { color: 'primary.main', fontWeight: 700, letterSpacing: 1, mb: 2, mt: 2 };
  const CARD_SX = { background: 'white', borderRadius: 3, p: 3, mb: 3, boxShadow: 3, border: '1px solid #e3e8ee' };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 8 }}>{error}</Box>;
  if (!workOrder) return <Box sx={{ textAlign: 'center', mt: 8 }}>Work order not found.</Box>;

  // Determine if a template is selected
  const isTemplateSelected = !!workOrder.template_id;

  // Robust validation for manual VM creation (no template)
  const missingFields: string[] = [];
  if (!isTemplateSelected) {
    if (!workOrder.os) missingFields.push('OS');
    if (!workOrder.hardware_version) missingFields.push('Hardware Version');
    if (!workOrder.scsi_controller_type) missingFields.push('SCSI Controller Type');
    if (!workOrder.hostname) missingFields.push('Hostname');
    if (!workOrder.ip) missingFields.push('IPv4 Address');
    if (!workOrder.netmask) missingFields.push('IPv4 Netmask');
    if (!workOrder.gateway) missingFields.push('IPv4 Gateway');
    if (!workOrder.domain) missingFields.push('Domain');
    if (!workOrder.disks || workOrder.disks.length === 0) missingFields.push('At least one Disk');
    if (!workOrder.nics || workOrder.nics.length === 0) missingFields.push('At least one NIC');
  }
  const isManualValid = missingFields.length === 0;

  // Placement options arrays for robust select logic
  const HOST_OPTIONS = hosts.map(h => String(h.id));
  const VM_OPTIONS = vms.map(vm => String(vm.name));
  const selectedHost = hosts.find(h => String(h.id) === String(workOrder.host_id));
  const filteredDatastores = selectedHost ? datastores.filter(ds => selectedHost.accessible_datastores.some((ads: any) => ads.id === ds.id)) : datastores;
  const filteredNetworks = selectedHost ? networks.filter(net => selectedHost.accessible_networks.some((an: any) => an.name === net.name)) : networks;
  const DATASTORE_OPTIONS = filteredDatastores.map(ds => String(ds.id));

  // Validation: Prevent saving if selected datastore/network is not accessible from selected host
  const isDatastoreValid = !workOrder.datastore_id || (selectedHost && selectedHost.accessible_datastores.some((ads: any) => ads.id === workOrder.datastore_id));
  const isNetworkValid = true; // Allow any network for now

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 6, mb: 6 }}>
      <Paper elevation={4} sx={{ borderRadius: 4, p: 4 }}>
        <Typography variant="h3" gutterBottom>Edit Work Order</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={SECTION_HEADER_SX}>General Info</Typography>
              <Box sx={CARD_SX}>
                <TextField label="Name" name="name" value={workOrder.name} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    name="status"
                    value={STATUS_OPTIONS.includes(workOrder.status) ? workOrder.status : STATUS_OPTIONS[0]}
                    onChange={handleSelectChange}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Created At" name="created_at" value={new Date(workOrder.created_at).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })} fullWidth disabled sx={{ mb: 2 }} />
                {/* Only show guest customization fields if template is selected, otherwise require all technical fields */}
                {isTemplateSelected ? (
                  <>
                    <TextField label="Hostname" name="hostname" value={workOrder.hostname || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The hostname for the VM (e.g., myvm01)." />
                    <TextField label="IPv4 Address" name="ip" value={workOrder.ip || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The static IPv4 address to assign to the VM." />
                    <TextField label="IPv4 Netmask" name="netmask" value={workOrder.netmask || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The subnet mask for the VM's network (e.g., 255.255.255.0)." />
                    <TextField label="IPv4 Gateway" name="gateway" value={workOrder.gateway || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The default gateway for the VM's network." />
                    <TextField label="Domain" name="domain" value={workOrder.domain || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The DNS domain for the VM (e.g., example.com)." />
                  </>
                ) : (
                  <>
                    <TextField label="Hostname" name="hostname" value={workOrder.hostname || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The hostname for the VM (e.g., myvm01)." required />
                    <TextField label="OS" name="os" value={workOrder.os || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The guest OS type (e.g., ubuntu-20.04, windows-2019)." required />
                    <TextField label="Hardware Version" name="hardware_version" value={workOrder.hardware_version || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The VM hardware version (e.g., 17)." required />
                    <TextField label="SCSI Controller Type" name="scsi_controller_type" value={workOrder.scsi_controller_type || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The SCSI controller type (e.g., pvscsi, lsilogic)." required />
                    <TextField label="IPv4 Address" name="ip" value={workOrder.ip || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The static IPv4 address to assign to the VM." required />
                    <TextField label="IPv4 Netmask" name="netmask" value={workOrder.netmask || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The subnet mask for the VM's network (e.g., 255.255.255.0)." required />
                    <TextField label="IPv4 Gateway" name="gateway" value={workOrder.gateway || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The default gateway for the VM's network." required />
                    <TextField label="Domain" name="domain" value={workOrder.domain || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} helperText="The DNS domain for the VM (e.g., example.com)." required />
                    {/* Disk and NIC layout fields would go here if you want to expose them */}
                  </>
                )}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Datacenter</InputLabel>
                  <Tooltip title="Select the vSphere datacenter for resource lookups" placement="top" arrow>
                    <Select
                      label="Datacenter"
                      name="datacenter_name"
                      value={workOrder.datacenter_name || (datacenters[0]?.name || 'Datacenter')}
                      onChange={handleSelectChange}
                      required
                    >
                      {datacenters.map((dc) => (
                        <MenuItem key={dc.id} value={dc.name}>{dc.name}</MenuItem>
                      ))}
                    </Select>
                  </Tooltip>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={SECTION_HEADER_SX}>Resources</Typography>
              <Box sx={CARD_SX}>
                <TextField label="CPU" name="cpu" value={workOrder.cpu} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2 }} />
                <TextField label="RAM (GB)" name="ram" value={workOrder.ram} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2 }} />
                {/* Disks Section */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: 'secondary.main', mb: 1 }}>Disks</Typography>
                  {getSelectedDatastoreFreeSpace() !== null && (
                    <Typography variant="caption" sx={{ color: 'info.main', mb: 1, display: 'block' }}>
                      Free space on selected datastore: {getSelectedDatastoreFreeSpace().toFixed(2)} GB
                    </Typography>
                  )}
                  {(workOrder.disks || []).map((disk: any, idx: number) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1, background: '#f8fafc', borderRadius: 2, p: 1 }}>
                      <TextField
                        label="Size (GB)"
                        type="number"
                        value={disk.size}
                        onChange={e => handleDiskChange(idx, 'size', e.target.value)}
                        sx={{ width: 120 }}
                      />
                      <FormControl component="fieldset" sx={{ minWidth: 220 }}>
                        <RadioGroup
                          row
                          value={disk.provisioning}
                          onChange={e => handleDiskChange(idx, 'provisioning', e.target.value)}
                        >
                          {DISK_PROVISION_OPTIONS.map((option) => (
                            <Tooltip key={option.value} title={option.help} arrow>
                              <FormControlLabel
                                value={option.value}
                                control={<Radio color="primary" />}
                                label={option.label}
                              />
                            </Tooltip>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <Button variant="outlined" color="error" onClick={() => handleRemoveDisk(idx)} sx={{ minWidth: 36, px: 0 }}>-</Button>
                    </Box>
                  ))}
                  <Button variant="contained" color="primary" onClick={handleAddDisk} sx={{ mt: 1 }}>Add Disk</Button>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={SECTION_HEADER_SX}>Placement</Typography>
              <Box sx={CARD_SX}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Host</InputLabel>
                  <Tooltip title="Select the ESXi host to place the VM on. Only hosts in the selected cluster are shown." placement="top" arrow>
                  <Select
                    label="Host"
                    name="host_id"
                    value={HOST_OPTIONS.includes(String(workOrder.host_id)) ? String(workOrder.host_id) : (HOST_OPTIONS[0] || '')}
                    onChange={handleSelectChange}
                  >
                    {hosts.map((host) => (
                        <MenuItem key={host.id} value={String(host.id)}>
                        {host.name} — RAM: {host.memory_free_gb?.toFixed(1) || '?'}GB free, CPU: {host.cpu_free_mhz?.toFixed(0) || '?'} MHz free, v{host.product_version || '?'}
                      </MenuItem>
                    ))}
                  </Select>
                  </Tooltip>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>VM Template</InputLabel>
                  <Tooltip title="Select the VM template to clone from. Only templates available in vCenter are shown. Leave blank to not use a template." placement="top" arrow>
                  <Select
                    label="VM Template"
                      name="template_id"
                      value={workOrder.template_id || ''}
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="">(No template)</MenuItem>
                      {templates.map((template) => (
                        <MenuItem key={template.uuid} value={template.uuid}>
                          {template.name} ({template.guest_full_name || template.guest_id})
                        </MenuItem>
                      ))}
                    </Select>
                  </Tooltip>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Folder</InputLabel>
                  <Tooltip title="Select the vSphere folder to place the VM in. Folders help organize VMs in vCenter." placement="top" arrow>
                    <Select
                      label="Folder"
                      name="folder_id"
                      value={workOrder.folder_id || (folders[0]?.id || '')}
                    onChange={handleSelectChange}
                  >
                      {folders.map((folder) => (
                        <MenuItem key={folder.id} value={folder.id}>{folder.name}</MenuItem>
                    ))}
                  </Select>
                  </Tooltip>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Datastore</InputLabel>
                  <Tooltip title="Select the datastore for VM storage. Only datastores accessible from the selected host are shown." placement="top" arrow>
                  <Select
                    label="Datastore"
                    name="datastore_id"
                    value={DATASTORE_OPTIONS.includes(String(workOrder.datastore_id)) ? String(workOrder.datastore_id) : (DATASTORE_OPTIONS[0] || '')}
                    onChange={handleSelectChange}
                  >
                      {filteredDatastores.map((ds) => (
                        <MenuItem key={ds.id} value={String(ds.id)}>{ds.name} ({ds.capacity_gb}GB)</MenuItem>
                    ))}
                  </Select>
                  </Tooltip>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Resource Pool</InputLabel>
                  <Tooltip title="Select the resource pool for the VM. Resource pools allow resource management within clusters." placement="top" arrow>
                  <Select
                    label="Resource Pool"
                    name="resource_pool_id"
                    value={workOrder.resource_pool_id || (resourcePools[0]?.id || '')}
                    onChange={handleSelectChange}
                    required
                  >
                    {resourcePools.map((pool) => (
                      <MenuItem key={pool.id} value={pool.id}>
                        {pool.name} {pool.parent ? `(${pool.parent}, ${pool.type})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  </Tooltip>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={SECTION_HEADER_SX}>Networking</Typography>
              <Box sx={CARD_SX}>
                <Typography variant="subtitle1" sx={{ color: 'secondary.main', mb: 1 }}>Network Interfaces</Typography>
                {(workOrder.nics || []).map((nic: any, idx: number) => (
                  <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2, background: '#f8fafc', borderRadius: 2, p: 2 }}>
                    <FormControl sx={{ minWidth: 200, flex: '1 1 200px' }}>
                      <InputLabel>Network</InputLabel>
                      <Select
                        label="Network"
                        value={String(nic.network_name ?? '')}
                        onChange={e => handleNicChange(idx, 'network_name', e.target.value)}
                      >
                        {filteredNetworks.map((net) => (
                          <MenuItem key={net.id} value={net.name}>{net.name} (VLAN: {net.vlan}, {net.type})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 180, flex: '1 1 180px' }}>
                      <InputLabel>IP Pool</InputLabel>
                      <Select
                        label="IP Pool"
                        value={nic.ip_pool_id || (ipPools[0]?.id || '')}
                        onChange={e => handleNicChange(idx, 'ip_pool_id', e.target.value)}
                      >
                        {ipPools.map((pool) => (
                          <MenuItem key={pool.id} value={pool.id}>{pool.name} ({pool.description})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Subnet Mask (optional)"
                      value={nic.mask || ''}
                      onChange={e => handleNicChange(idx, 'mask', e.target.value)}
                      sx={{ width: 220, flex: '1 1 220px' }}
                      inputProps={{ style: { fontFamily: 'monospace' } }}
                    />
                    <Button variant="outlined" color="error" onClick={() => handleRemoveNic(idx)} sx={{ minWidth: 36, px: 0, height: 40 }}>-</Button>
                  </Box>
                ))}
                <Button variant="contained" color="primary" onClick={handleAddNic} sx={{ mt: 1 }}>Add NIC</Button>
              </Box>
            </Grid>
          </Grid>
          {hostSupport && (
            <Alert severity={hostSupport.includes('supports') ? 'success' : 'warning'} sx={{ mt: 3 }}>
              {hostSupport}
            </Alert>
          )}
          {!isDatastoreValid && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Selected datastore is not accessible from the selected host.
            </Alert>
          )}
          {!isTemplateSelected && !isManualValid && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please fill in all required fields for manual VM creation: {missingFields.join(', ')}
            </Alert>
          )}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="inherit" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving || !!(hostSupport && hostSupport.includes('not support')) || !isDatastoreValid || (!isTemplateSelected && !isManualValid)}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} message="Work order updated!" />
      </Paper>
    </Box>
  );
} 