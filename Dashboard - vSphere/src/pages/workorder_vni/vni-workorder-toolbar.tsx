import type { IVNIWorkOrder } from 'src/types/vni-workorder';
import type { SelectChangeEvent } from '@mui/material/Select';

import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import { toast } from 'src/components/snackbar';
import { exportVNIWorkOrderExcel } from 'src/lib/api';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  vniWorkOrder?: IVNIWorkOrder;
  currentStatus?: string;
  statusOptions?: { value: string; label: string }[];
  onChangeStatus?: (event: SelectChangeEvent<string>) => void;
};

export function VNIWorkOrderToolbar({ 
  vniWorkOrder, 
  currentStatus, 
  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'draft', label: 'Draft' },
    { value: 'executing', label: 'Executing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ],
  onChangeStatus 
}: Props) {
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const handleExportExcel = async () => {
    if (!vniWorkOrder?.id) {
      toast.error('VNI Work Order ID not found');
      return;
    }

    try {
      const blob = await exportVNIWorkOrderExcel(parseInt(vniWorkOrder.id));
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VNI_Configuration_${vniWorkOrder.vni_name}_${vniWorkOrder.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const renderDetailsDialog = () => (
    <Dialog fullScreen open={open}>
      <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
        <DialogActions sx={{ p: 1.5 }}>
          <Button color="inherit" variant="contained" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
        <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden', p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <h2>VNI Work Order Details</h2>
            <p><strong>VNI Name:</strong> {vniWorkOrder?.vni_name}</p>
            <p><strong>Owner:</strong> {vniWorkOrder?.owner}</p>
            <p><strong>Status:</strong> {vniWorkOrder?.status}</p>
            <p><strong>Priority:</strong> {vniWorkOrder?.priority}</p>
            <p><strong>Description:</strong> {vniWorkOrder?.description}</p>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'flex',
          mb: { xs: 3, md: 5 },
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-end', sm: 'center' },
        }}
      >
        <Box
          sx={{
            gap: 1,
            width: 1,
            flexGrow: 1,
            display: 'flex',
          }}
        >
          <Tooltip title="Edit">
            <IconButton
              component={RouterLink}
              href={paths.dashboard.workorder_vni.edit(`${vniWorkOrder?.id}`)}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View">
            <IconButton onClick={onOpen}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Excel">
            <IconButton onClick={handleExportExcel}>
              <Iconify icon="solar:printer-minimalistic-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Execute">
            <IconButton>
              <Iconify icon="solar:play-circle-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton>
              <Iconify icon="solar:share-bold" />
            </IconButton>
          </Tooltip>
        </Box>

        {currentStatus && onChangeStatus && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={currentStatus}
              label="Status"
              onChange={onChangeStatus}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {renderDetailsDialog()}
    </>
  );
} 