import { useEffect, useState } from 'react';
import { useParams } from 'src/routes/hooks/use-params';
import { fetchWorkOrderById, updateWorkOrder } from 'src/lib/api';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

export default function WorkOrderEditPage() {
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id !== undefined) {
      fetchWorkOrderById(id)
        .then((wo) => setWorkOrder(wo))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setError('Invalid work order ID');
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkOrder({ ...workOrder, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateWorkOrder(Number(id), workOrder);
    setSaving(false);
    setSuccess(true);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 8 }}>{error}</Box>;
  if (!workOrder) return <Box sx={{ textAlign: 'center', mt: 8 }}>Work order not found.</Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>Edit Work Order</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField label="Name" name="name" value={workOrder.name} onChange={handleChange} fullWidth required />
            <TextField label="OS" name="os" value={workOrder.os} onChange={handleChange} fullWidth required />
            <TextField label="Host Version" name="host_version" value={workOrder.host_version} onChange={handleChange} fullWidth required />
            <TextField label="CPU" name="cpu" value={workOrder.cpu} onChange={handleChange} type="number" fullWidth required />
            <TextField label="RAM" name="ram" value={workOrder.ram} onChange={handleChange} type="number" fullWidth required />
            <TextField label="Disk" name="disk" value={workOrder.disk} onChange={handleChange} type="number" fullWidth required />
            <TextField label="Status" name="status" value={workOrder.status} onChange={handleChange} fullWidth required />
            <Button type="submit" variant="contained" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} message="Work order updated!" />
    </Box>
  );
} 