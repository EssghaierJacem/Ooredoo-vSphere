import { useEffect, useState } from 'react';
import { useParams } from 'src/routes/hooks/use-params';
import { fetchWorkOrderById, fetchHosts, fetchDatastores, deleteWorkOrder } from 'src/lib/api';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { Label } from 'src/components/label';
import { fToNow } from 'src/utils/format-time';
import { exportWorkOrdersToExcel } from 'src/utils/simple-excel-export';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hosts, setHosts] = useState<any[]>([]);
  const [datastores, setDatastores] = useState<any[]>([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; color?: 'success' | 'error' }>({ open: false, message: '' });
  const [deleting, setDeleting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id !== undefined) {
      setLoading(true);
      setError(null);
      Promise.all([
        fetchWorkOrderById(id),
        fetchHosts(),
        fetchDatastores(),
      ])
        .then(([wo, hosts, datastores]) => {
          if (!wo) {
            setError('Work order not found');
          } else {
            setWorkOrder(wo);
            setHosts(hosts);
            setDatastores(datastores);
          }
        })
        .catch((e) => {
          console.error('Error fetching work order:', e);
          setError(e.message || 'Failed to load work order');
        })
        .finally(() => setLoading(false));
    } else {
      setError('Invalid work order ID');
      setLoading(false);
    }
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><Typography variant="h6">Loading...</Typography></Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 8 }}>{error}</Box>;
  if (!workOrder) return <Box sx={{ textAlign: 'center', mt: 8 }}>Work order not found.</Box>;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'draft':
        return 'default';
      case 'executing':
        return 'info';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const statusColor = getStatusColor(workOrder.status);

  const handleEdit = () => {
    if (id !== undefined) router.push(paths.dashboard.workorder.edit(id));
  };

  const handleDelete = () => {
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setSnackbar({ open: false, message: '' });
    try {
      await deleteWorkOrder(Number(workOrder.id));
      setSnackbar({ open: true, message: 'Work order deleted successfully!', color: 'success' });
      setTimeout(() => {
        router.push(paths.dashboard.workorder.list);
      }, 1500);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.detail || 'Failed to delete work order', color: 'error' });
    } finally {
      setDeleting(false);
      setOpenDelete(false);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDelete(false);
  };

  const handleExecute = async () => {
    setExecuting(true);
    setSnackbar({ open: false, message: '' });
    try {
      const res = await import('src/lib/api').then(m => m.executeWorkOrder(Number(workOrder.id)));
      setSnackbar({ open: true, message: 'VM provisioning started! ' + (res.message || ''), color: 'success' });
      setWorkOrder((wo: any) => ({ ...wo, status: 'executed' }));
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.detail || 'Failed to execute work order', color: 'error' });
    } finally {
      setExecuting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      exportWorkOrdersToExcel([workOrder], `vm-workorder-${workOrder.name}-${workOrder.id}`);
      setSnackbar({ open: true, message: 'Excel file exported successfully!', color: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbar({ open: true, message: 'Failed to export Excel file', color: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 6, mb: 6 }}>
      <Paper elevation={4} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, background: (theme) => theme.palette.background.default }}>
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h3" gutterBottom>Work Order Details</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
                <Tooltip title="Export to Excel">
                  <IconButton color="success" onClick={handleExportExcel}>
                    <Iconify icon="solar:file-text-bold" width={24} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton color="warning" onClick={handleEdit}>
                    <Iconify icon="solar:pen-bold" width={24} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={handleDelete}>
                    <Iconify icon="solar:danger-bold" width={24} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* General Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                 General Information
              </Typography>
              <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 1.5, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 600 }}>VM Name:</Typography>
                <Typography component="dd">{workOrder.name}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>OS Type:</Typography>
                <Typography component="dd">{workOrder.os || 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>Status:</Typography>
                <Box component="dd" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Label
                    variant="soft"
                    color={statusColor}
                    sx={{ textTransform: 'capitalize', px: 1.5, py: 0.25, fontSize: 13 }}
                  >
                    {workOrder.status?.charAt(0).toUpperCase() + workOrder.status?.slice(1).toLowerCase()}
                  </Label>
                </Box>
                <Typography component="dt" sx={{ fontWeight: 600 }}>Created At:</Typography>
                <Typography component="dd">{fToNow(workOrder.created_at)}</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Network Configuration */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                 Network Configuration
              </Typography>
              <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 1.5, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 600 }}>IP Address:</Typography>
                <Typography component="dd" sx={{ fontFamily: 'monospace' }}>{workOrder.ip || 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>Gateway:</Typography>
                <Typography component="dd" sx={{ fontFamily: 'monospace' }}>{workOrder.gateway || 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>NetMask:</Typography>
                <Typography component="dd" sx={{ fontFamily: 'monospace' }}>{workOrder.netmask || 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>ULS:</Typography>
                <Typography component="dd">{workOrder.uls || 'N/A'}</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Location */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                 Location
              </Typography>
              <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 1.5, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 600 }}>Site:</Typography>
                <Typography component="dd">{workOrder.site || 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>Cluster:</Typography>
                <Typography component="dd">{workOrder.cluster || 'N/A'}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>DataStore:</Typography>
                <Typography component="dd">{workOrder.datastore_id || 'N/A'}</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Resources */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                 Resources
              </Typography>
              <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 1.5, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 600 }}>CPU:</Typography>
                <Typography component="dd">{workOrder.cpu} vCPU</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>RAM:</Typography>
                <Typography component="dd">{workOrder.ram} GB</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>DISK:</Typography>
                <Typography component="dd">{workOrder.disk} GB</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Users */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                 Users
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.isArray(workOrder.users) && workOrder.users.length > 0 ? (
                  workOrder.users.map((user: string, index: number) => (
                    <Chip key={index} label={user} variant="outlined" color="primary" />
                  ))
                ) : (
                  <Typography color="text.secondary">No users assigned</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Execute Button */}
          {workOrder.status?.toLowerCase() === 'approved' && (
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 3, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<Iconify icon="solar:play-circle-bold" width={24} />} 
                    onClick={handleExecute} 
                    disabled={executing}
                    size="large"
                  >
                    {executing ? 'Executing...' : 'Execute Work Order'}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    This will provision the VM according to the specifications above.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDelete} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Work Order</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this work order? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ open: false, message: '' })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ open: false, message: '' })} 
            severity={snackbar.color || 'info'}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}