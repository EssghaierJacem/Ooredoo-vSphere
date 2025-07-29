import type { IVNIWorkOrder } from 'src/types/vni-workorder';

import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { toast } from 'src/components/snackbar';
import { updateVNIWorkOrder } from 'src/lib/api';

// ----------------------------------------------------------------------

const VNIWorkOrderSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  requested_by: z.string().min(1, 'Requested by is required'),
  project: z.string().min(1, 'Project is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.string().min(1, 'Priority is required'),
  status: z.string().min(1, 'Status is required'),
  vni_name: z.string().min(1, 'VNI Name is required'),
  description: z.string().min(1, 'Description is required'),
  t0_gw: z.string().min(1, 'T0 Gateway is required'),
  t1_gw: z.string().min(1, 'T1 Gateway is required'),
  gateway: z.string().min(1, 'Gateway is required'),
  cidr: z.string().min(1, 'CIDR is required'),
  subnet_mask: z.string().min(1, 'Subnet Mask is required'),
  first_ip: z.string().min(1, 'First IP is required'),
  last_ip: z.string().min(1, 'Last IP is required'),
  number_of_ips: z.number().min(0, 'Number of IPs must be 0 or greater'),
});

type FormData = z.infer<typeof VNIWorkOrderSchema>;

type Props = {
  currentVNIWorkOrder?: IVNIWorkOrder | null;
};

export function VNIWorkOrderNewEditForm({ currentVNIWorkOrder }: Props) {
  const isEdit = !!currentVNIWorkOrder;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(VNIWorkOrderSchema),
    defaultValues: {
      owner: currentVNIWorkOrder?.owner || '',
      requested_by: currentVNIWorkOrder?.requested_by || '',
      project: currentVNIWorkOrder?.project || '',
      deadline: currentVNIWorkOrder?.deadline || '',
      priority: currentVNIWorkOrder?.priority || 'medium',
      status: currentVNIWorkOrder?.status || 'pending',
      vni_name: currentVNIWorkOrder?.vni_name || '',
      description: currentVNIWorkOrder?.description || '',
      t0_gw: currentVNIWorkOrder?.t0_gw || '',
      t1_gw: currentVNIWorkOrder?.t1_gw || '',
      gateway: currentVNIWorkOrder?.gateway || '',
      cidr: currentVNIWorkOrder?.cidr || '',
      subnet_mask: currentVNIWorkOrder?.subnet_mask || '',
      first_ip: currentVNIWorkOrder?.first_ip || '',
      last_ip: currentVNIWorkOrder?.last_ip || '',
      number_of_ips: currentVNIWorkOrder?.number_of_ips || 0,
    },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (isEdit && currentVNIWorkOrder) {
          await updateVNIWorkOrder(parseInt(currentVNIWorkOrder.id), data);
          toast.success('VNI Work Order updated successfully!');
        }
      } catch (error) {
        console.error('Error updating VNI work order:', error);
        toast.error('Failed to update VNI work order');
      }
    },
    [isEdit, currentVNIWorkOrder]
  );

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {isEdit ? 'Update VNI Work Order' : 'Create New VNI Work Order'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* General Information */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            General Information
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="owner"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Owner"
                  error={!!errors.owner}
                  helperText={errors.owner?.message}
                />
              )}
            />

            <Controller
              name="requested_by"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Requested By"
                  error={!!errors.requested_by}
                  helperText={errors.requested_by?.message}
                />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="project"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Project"
                  error={!!errors.project}
                  helperText={errors.project?.message}
                />
              )}
            />

            <Controller
              name="vni_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="VNI Name"
                  error={!!errors.vni_name}
                  helperText={errors.vni_name?.message}
                />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.priority}>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label="Priority">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="executing">Executing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Stack>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={3}
                label="Description"
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          {/* VNI Configuration */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            VNI Configuration
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="t0_gw"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="T0 Gateway"
                  error={!!errors.t0_gw}
                  helperText={errors.t0_gw?.message}
                />
              )}
            />

            <Controller
              name="t1_gw"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="T1 Gateway"
                  error={!!errors.t1_gw}
                  helperText={errors.t1_gw?.message}
                />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="gateway"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Gateway"
                  error={!!errors.gateway}
                  helperText={errors.gateway?.message}
                />
              )}
            />

            <Controller
              name="cidr"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="CIDR"
                  error={!!errors.cidr}
                  helperText={errors.cidr?.message}
                />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="subnet_mask"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Subnet Mask"
                  error={!!errors.subnet_mask}
                  helperText={errors.subnet_mask?.message}
                />
              )}
            />

            <Controller
              name="number_of_ips"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Number of IPs"
                  error={!!errors.number_of_ips}
                  helperText={errors.number_of_ips?.message}
                />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="first_ip"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="First IP"
                  error={!!errors.first_ip}
                  helperText={errors.first_ip?.message}
                />
              )}
            />

            <Controller
              name="last_ip"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Last IP"
                  error={!!errors.last_ip}
                  helperText={errors.last_ip?.message}
                />
              )}
            />
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update VNI Work Order' : 'Create VNI Work Order'}
            </Button>

            <Button
              component={RouterLink}
              href={paths.dashboard.workorder_vni.list}
              variant="outlined"
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
} 