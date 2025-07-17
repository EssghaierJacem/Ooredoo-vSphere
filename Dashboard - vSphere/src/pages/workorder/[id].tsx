import { useEffect, useState } from 'react';
import { useParams } from 'src/routes/hooks/use-params';
import { fetchWorkOrderById } from 'src/lib/api';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 8 }}>{error}</Box>;
  if (!workOrder) return <Box sx={{ textAlign: 'center', mt: 8 }}>Work order not found.</Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>Work Order Details</Typography>
          <Box sx={{ mt: 2, mb: 2, display: 'grid', gap: 2 }}>
            <Typography><b>Name:</b> {workOrder.name}</Typography>
            <Typography><b>OS:</b> {workOrder.os}</Typography>
            <Typography><b>Host Version:</b> {workOrder.host_version}</Typography>
            <Typography><b>CPU:</b> {workOrder.cpu}</Typography>
            <Typography><b>RAM:</b> {workOrder.ram}</Typography>
            <Typography><b>Disk:</b> {workOrder.disk}</Typography>
            <Typography><b>Status:</b> {workOrder.status}</Typography>
            <Typography><b>Created At:</b> {new Date(workOrder.created_at).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 