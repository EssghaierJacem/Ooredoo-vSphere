import { useEffect, useState } from 'react';
import { useParams } from 'src/routes/hooks/use-params';
import { fetchWorkOrderById, updateWorkOrder } from 'src/lib/api';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'executing', 'completed', 'failed'];

// OS Options
const OS_OPTIONS = [
  { value: 'ubuntu64Guest', label: 'Ubuntu 20.04 / 22.04 (64-bit)' },
  { value: 'centos7_64Guest', label: 'CentOS 7 (64-bit)' },
  { value: 'windows9_64Guest', label: 'Windows 10 (64-bit)' },
  { value: 'debian10_64Guest', label: 'Debian 10 (64-bit)' },
  { value: 'rhel7_64Guest', label: 'Red Hat Enterprise Linux 7 (64-bit)' },
  { value: 'otherGuest64', label: 'Other 64-bit Linux' },
];

// Site Options
const SITE_OPTIONS = [
  { value: 'OT-CHARGUIA', label: 'OT-CHARGUIA' },
  { value: 'OT-MGHIRA', label: 'OT-MGHIRA' },
];

// Cluster Options
const CLUSTER_OPTIONS = [
  { value: 'Edge', label: 'Edge' },
  { value: 'ITaaS Workload', label: 'ITaaS Workload' },
  { value: 'ITaaS Workload NSX-T', label: 'ITaaS Workload NSX-T' },
  { value: 'ITaaS Workload2', label: 'ITaaS Workload2' },
  { value: 'ITaaS Workload2_NSX-T', label: 'ITaaS Workload2_NSX-T' },
  { value: 'ITaaS Workload3 NSX-T', label: 'ITaaS Workload3 NSX-T' },
  { value: 'ITaaS Workload4 NSX-T', label: 'ITaaS Workload4 NSX-T' },
];

// User Options
const USER_OPTIONS = [
  { value: 'Userapp', label: 'Userapp' },
  { value: 'Oss', label: 'Oss' },
  { value: 'Optim', label: 'Optim' },
  { value: 'Ingdba', label: 'Ingdba' },
  { value: 'Ingsec', label: 'Ingsec' },
  { value: 'Other', label: 'Other' },
];

export default function WorkOrderEditPage() {
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customUser, setCustomUser] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (id !== undefined) {
      setLoading(true);
      setError(null);
      fetchWorkOrderById(id)
        .then((wo) => {
          if (!wo) {
            setError('Work order not found');
          } else {
            // Ensure users is always an array
          const normalizedWO = {
            ...wo,
              users: Array.isArray(wo.users) ? wo.users : [],
              site: wo.site || 'OT-CHARGUIA',
              cluster: wo.cluster || 'ITaaS Workload',
          };
          setWorkOrder(normalizedWO);
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
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setWorkOrder({ ...workOrder, [e.target.name]: e.target.value });
  };

  const handleUsersChange = (e: SelectChangeEvent<string[]>) => {
    const selectedUsers = e.target.value as string[];
    setWorkOrder({ ...workOrder, users: selectedUsers });
    
    // If "Other" is selected, ensure we have a custom user input
    if (selectedUsers.includes('Other') && !customUser) {
      setCustomUser('');
    }
  };

  const handleCustomUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUser(e.target.value);
  };

  const handleAddCustomUser = () => {
    if (customUser.trim()) {
      const currentUsers = workOrder.users || [];
      const updatedUsers = [...currentUsers.filter((user: string) => user !== 'Other'), customUser.trim()];
      setWorkOrder({ ...workOrder, users: updatedUsers });
      setCustomUser('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
    const payload = {
        ...workOrder,
        users: workOrder.users || [],
      };
      await updateWorkOrder(Number(id), payload);
    setSaving(false);
    setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Failed to update work order');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (id !== undefined) router.push(paths.dashboard.workorder.detail(id));
  };

  const SECTION_HEADER_SX = { 
    color: 'primary.main', 
    fontWeight: 700, 
    letterSpacing: 1, 
    mb: 2, 
    mt: 3,
    fontSize: '1.2rem'
  };

  const CARD_SX = { 
    background: 'white', 
    borderRadius: 2, 
    p: 3, 
    mb: 3, 
    boxShadow: 1, 
    border: '1px solid #e0e0e0' 
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 8 }}><Alert severity="error">{error}</Alert></Box>;
  if (!workOrder) return <Box sx={{ textAlign: 'center', mt: 8 }}>Work order not found.</Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ borderRadius: 3, p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          Edit Work Order
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={4}>
            
            {/* General Information Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={SECTION_HEADER_SX}>
                📋 General Information
              </Typography>
              <Box sx={CARD_SX}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      label="VM Name" 
                      name="name" 
                      value={workOrder.name || ''} 
                      onChange={handleChange} 
                      fullWidth 
                      required 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>OS Type</InputLabel>
                      <Select
                        label="OS Type"
                        name="os"
                        value={workOrder.os || ''}
                        onChange={handleSelectChange}
                      >
                        {OS_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    name="status"
                        value={workOrder.status || 'pending'}
                    onChange={handleSelectChange}
                  >
                    {STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Network Configuration Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={SECTION_HEADER_SX}>
                🌐 Network Configuration
              </Typography>
              <Box sx={CARD_SX}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      label="IP Address" 
                      name="ip" 
                      value={workOrder.ip || ''} 
                      onChange={handleChange} 
                      fullWidth 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      label="Gateway" 
                      name="gateway" 
                      value={workOrder.gateway || ''} 
                      onChange={handleChange} 
                      fullWidth 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                      label="NetMask" 
                      name="netmask" 
                      value={workOrder.netmask || ''} 
                      onChange={handleChange} 
                      fullWidth 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField 
                      label="ULS" 
                      name="uls" 
                      value={workOrder.uls || ''} 
                      onChange={handleChange} 
                      fullWidth 
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Location Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={SECTION_HEADER_SX}>
                📍 Location
              </Typography>
              <Box sx={CARD_SX}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Site</InputLabel>
                  <Select
                        label="Site"
                        name="site"
                        value={workOrder.site || 'OT-CHARGUIA'}
                    onChange={handleSelectChange}
                  >
                        {SITE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Cluster</InputLabel>
                  <Select
                        label="Cluster"
                        name="cluster"
                        value={workOrder.cluster || 'ITaaS Workload'}
                      onChange={handleSelectChange}
                    >
                        {CLUSTER_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField 
                      label="DataStore" 
                      name="datastore_id" 
                      value={workOrder.datastore_id || ''} 
                      onChange={handleChange} 
                      fullWidth 
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Resources Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={SECTION_HEADER_SX}>
                💻 Resources
              </Typography>
              <Box sx={CARD_SX}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField 
                      label="CPU (vCPU)" 
                      name="cpu" 
                      type="number"
                      value={workOrder.cpu || 1} 
                      onChange={handleChange} 
                      fullWidth 
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField 
                      label="RAM (GB)" 
                      name="ram" 
                      type="number"
                      value={workOrder.ram || 1} 
                      onChange={handleChange} 
                      fullWidth 
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField 
                      label="DISK (GB)" 
                      name="disk" 
                      type="number"
                      value={workOrder.disk || 1} 
                      onChange={handleChange} 
                      fullWidth 
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Users Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={SECTION_HEADER_SX}>
                👥 Users
              </Typography>
              <Box sx={CARD_SX}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Users</InputLabel>
                  <Select
                    label="Users"
                    name="users"
                    multiple
                    value={workOrder.users || []}
                    onChange={handleUsersChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {USER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Custom User Input */}
                {(workOrder.users || []).includes('Other') && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      label="Custom User"
                      value={customUser}
                      onChange={handleCustomUserChange}
                      placeholder="Enter custom user name"
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddCustomUser}
                      disabled={!customUser.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
            </Grid>

          </Grid>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSuccess(false)} severity="success">
            Work order updated successfully!
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
} 