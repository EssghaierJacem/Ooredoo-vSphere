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
import { Label } from 'src/components/label';
import { fToNow } from 'src/utils/format-time';

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
      Promise.all([
        fetchWorkOrderById(id),
        fetchHosts(),
        fetchDatastores(),
      ])
        .then(([wo, hosts, datastores]) => {
          setWorkOrder(wo);
          setHosts(hosts);
          setDatastores(datastores);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setError('Invalid work order ID');
      setLoading(false);
    }
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><Typography variant="h6">Loading...</Typography></Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 8 }}>{error}</Box>;
  if (!workOrder) return <Box sx={{ textAlign: 'center', mt: 8 }}>Work order not found.</Box>;

  // Host support logic (use memory_free_gb and cpu_free_mhz)
  const supportingHosts = hosts.filter((host) =>
    (typeof host.memory_free_gb === 'number' ? host.memory_free_gb : 0) >= workOrder.ram &&
    (typeof host.cpu_free_mhz === 'number' ? host.cpu_free_mhz : 0) >= (workOrder.cpu * 1000)
  );
  // Datastore support logic
  const supportingDatastores = datastores.filter((ds) =>
    (ds.free_space_gb ?? ds.capacity_gb) >= workOrder.disk
  );
  // Status color logic (case-insensitive, matches table)
  const statusColor =
    workOrder.status?.toLowerCase() === 'approved'
      ? 'success'
      : workOrder.status?.toLowerCase() === 'rejected'
      ? 'error'
      : workOrder.status?.toLowerCase() === 'pending'
      ? 'warning'
      : 'default';

  const handleEdit = () => {
    router.push(paths.dashboard.workorder.edit(workOrder.id));
  };
  const handleDelete = () => {
    setOpenDelete(true);
  };
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteWorkOrder(Number(workOrder.id));
      setSnackbar({ open: true, message: 'Work order deleted!', color: 'success' });
      setOpenDelete(false);
      setTimeout(() => router.push(paths.dashboard.two), 1000);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to delete work order', color: 'error' });
    } finally {
      setDeleting(false);
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
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 2, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>General Info</Typography>
              <Box component="dl" sx={{ mb: 2, display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 1.5, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 600 }}>Name:</Typography>
                <Typography component="dd">{workOrder.name}</Typography>
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
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3, mb: 1 }}>Resources</Typography>
              <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 1.5, columnGap: 2 }}>
                <Typography component="dt" sx={{ fontWeight: 600 }}>CPU:</Typography>
                <Typography component="dd">{workOrder.cpu}</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>RAM:</Typography>
                <Typography component="dd">{workOrder.ram} GB</Typography>
                <Typography component="dt" sx={{ fontWeight: 600 }}>Disk:</Typography>
                <Typography component="dd">{workOrder.disk} GB</Typography>
              </Box>
              {/* Show placement, host, VM, datastore, disks, nics if present */}
              {(workOrder.host_id || workOrder.vm_id || workOrder.datastore_id || (workOrder.disks && workOrder.disks.length) || (workOrder.nics && workOrder.nics.length)) && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3, mb: 1 }}>Placement & Details</Typography>
                  <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 1.5, columnGap: 2 }}>
                    {workOrder.host_id && <><Typography component="dt" sx={{ fontWeight: 600 }}>Host:</Typography><Typography component="dd">{workOrder.host_id}</Typography></>}
                    {workOrder.vm_id && <><Typography component="dt" sx={{ fontWeight: 600 }}>VM Template:</Typography><Typography component="dd">{workOrder.vm_id}</Typography></>}
                    {workOrder.datastore_id && <><Typography component="dt" sx={{ fontWeight: 600 }}>Datastore:</Typography><Typography component="dd">{workOrder.datastore_id}</Typography></>}
                    {workOrder.disks && workOrder.disks.length > 0 && <>
                      <Typography component="dt" sx={{ fontWeight: 600 }}>Disks:</Typography>
                      <Box component="dd">
                        {workOrder.disks.map((disk: any, idx: number) => (
                          <Box key={idx} sx={{ mb: 0.5 }}>
                            Label: <b>{disk.label || `disk${idx+1}`}</b>, Size: <b>{disk.size}</b> GB, Provisioning: <b>{disk.provisioning}</b>
                          </Box>
                        ))}
                      </Box>
                    </>}
                    {workOrder.nics && workOrder.nics.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'secondary.main', mb: 1 }}>Network Interfaces</Typography>
                        {workOrder.nics.map((nic: any, idx: number) => (
                          <Box key={idx} sx={{ mb: 0.5, pl: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2">Network: <b>{nic.network_id}</b></Typography>
                            {nic.ip_pool_id && <Typography variant="body2">IP Pool: <b>{nic.ip_pool_id}</b></Typography>}
                            {nic.mask && <Typography variant="body2">Mask: <b>{nic.mask}</b></Typography>}
                          </Box>
                        ))}
                      </Box>
                    )}
                    {workOrder.resource_pool_id && <><Typography component="dt" sx={{ fontWeight: 600, color: 'text.secondary' }}>Resource Pool:</Typography><Typography component="dd">{workOrder.resource_pool_id}</Typography></>}
                  </Box>
                </>
              )}
              {/* Show Execute button if approved */}
              {workOrder.status?.toLowerCase() === 'approved' && (
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="contained" color="success" startIcon={<Iconify icon="solar:play-circle-bold" width={24} />} onClick={handleExecute} disabled={executing}>
                    {executing ? 'Executing...' : 'Execute'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 2, mb: 2, background: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>Placement</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography><b>Host Version:</b> {workOrder.host_version}</Typography>
                {workOrder.os && (
                  <Typography><b>OS Version:</b> {workOrder.os}</Typography>
                )}
                {workOrder.os_version && !workOrder.os && (
                  <Typography><b>OS Version:</b> {workOrder.os_version}</Typography>
                )}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3, mb: 1 }}>Datastore</Typography>
              <Box>
                {datastores.length > 0 ? (
                  datastores.map((ds) => {
                    const canSupport = (ds.free_space_gb ?? ds.capacity_gb) >= workOrder.disk;
                    const freeSpace = typeof ds.free_space_gb === 'number' ? ds.free_space_gb.toFixed(2) : undefined;
                    return (
                      <Box key={ds.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography><b>{ds.name}</b>: {ds.capacity_gb} GB</Typography>
                        {freeSpace && (
                          <Typography sx={{ ml: 1, color: 'text.secondary', fontSize: 13 }}>
                            (Free: {freeSpace} GB)
                          </Typography>
                        )}
                        {canSupport && (
                          <Label color="success" variant="soft" sx={{ ml: 1 }}>Supports</Label>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Typography>No datastores found.</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Host Support</Typography>
          {supportingHosts.length > 0 ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {supportingHosts.length} host(s) can support this work order:
              <Box component="ul" sx={{ pl: 3, mt: 1, mb: 0 }}>
                {supportingHosts.map((h) => {
                  const name = h.name || h.management_ip || h.ip || 'Unknown Host';
                  const freeMem = typeof h.memory_free_gb === 'number' ? h.memory_free_gb : 0;
                  const freeCpu = typeof h.cpu_free_mhz === 'number' ? h.cpu_free_mhz : 0;
                  const freeStorage = typeof h.storage_free_gb === 'number' ? h.storage_free_gb : (typeof h.free_storage_gb === 'number' ? h.free_storage_gb : undefined);
                  return (
                    <li key={h.id || name}>
                      <b>{name}</b>
                      {h.management_ip && <span style={{ color: '#888', marginLeft: 6 }}>({h.management_ip})</span>}
                      <span style={{ marginLeft: 10 }}>
                        RAM: <b>{freeMem.toFixed(2)} GB</b>, CPU: <b>{freeCpu.toFixed(2)} MHz</b>
                        {freeStorage !== undefined && (
                          <>, Storage: <b>{freeStorage.toFixed(2)} GB</b></>
                        )}
                      </span>
                    </li>
                  );
                })}
              </Box>
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No host found that can support the requested resources.<br />
              {hosts.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>Closest hosts by available resources:</Typography>
                  {hosts
                    .map((host, idx) => {
                      const freeMem = typeof host.memory_free_gb === 'number' ? host.memory_free_gb : 0;
                      const freeCpu = typeof host.cpu_free_mhz === 'number' ? host.cpu_free_mhz : 0;
                      return {
                        ...host,
                        name: host.name || host.management_ip || host.ip || 'Unknown Host',
                        freeMem,
                        freeCpu,
                        memDiff: freeMem - workOrder.ram,
                        cpuDiff: freeCpu - (workOrder.cpu * 1000),
                      };
                    })
                    .sort((a, b) => (a.memDiff + a.cpuDiff) - (b.memDiff + b.cpuDiff))
                    .slice(0, 2)
                    .map((host, idx) => (
                      <Box key={host.id || host.name || idx} sx={{ ml: 1, mb: 0.5 }}>
                        <Typography variant="body2">
                          <b>{host.name}</b> (Free RAM: {host.freeMem.toFixed(2)} GB, Free CPU: {host.freeCpu.toFixed(2)} MHz)
                        </Typography>
                      </Box>
                    ))}
                </Box>
              )}
            </Alert>
          )}
        </Box>
        <Dialog open={openDelete} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>Are you sure you want to delete this work order?</DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="inherit" disabled={deleting}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          ContentProps={{ sx: { bgcolor: snackbar.color === 'error' ? 'error.main' : 'success.main', color: 'common.white' } }}
        />
      </Paper>
    </Box>
  );
} 