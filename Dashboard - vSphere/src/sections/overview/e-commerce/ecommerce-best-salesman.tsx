import type { CardProps } from '@mui/material/Card';
import type { TableHeadCellProps } from 'src/components/table';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { useRouter } from 'src/routes/hooks';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { deleteWorkOrder } from 'src/lib/api';
import Snackbar from '@mui/material/Snackbar';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  headCells: TableHeadCellProps[];
  tableData: {
    id: string;
    name: string;
    os: string;
    hostVersion: string;
    cpu: number;
    ram: number;
    disk: number;
    status: string;
    createdAt: string;
  }[];
};

export function EcommerceBestSalesman({
  title,
  subheader,
  tableData,
  headCells,
  sx,
  ...other
}: Props) {
  // Add Actions column if not present
  const enhancedHeadCells = headCells.some((cell) => cell.id === 'actions')
    ? headCells
    : [
        ...headCells,
        { id: 'actions', label: 'Actions', align: 'center' as const, width: 120 },
      ];

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 422 }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHeadCustom headCells={enhancedHeadCells} />

          <TableBody>
            {tableData.map((row) => (
              <RowItem key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type RowItemProps = {
  row: Props['tableData'][number];
};

function RowItem({ row }: RowItemProps) {
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; color?: 'success' | 'error' }>({ open: false, message: '' });
  const [deleting, setDeleting] = useState(false);

  const handleView = () => {
    router.push(paths.dashboard.workorder.detail(row.id));
  };
  const handleEdit = () => {
    router.push(paths.dashboard.workorder.edit(row.id));
  };
  const handleDelete = () => {
    setOpenDelete(true);
  };
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteWorkOrder(Number(row.id));
      setSnackbar({ open: true, message: 'Work order deleted!', color: 'success' });
      setOpenDelete(false);
      window.location.reload(); 
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to delete work order', color: 'error' });
    } finally {
      setDeleting(false);
    }
  };
  const handleDeleteCancel = () => {
    setOpenDelete(false);
  };

  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.os}</TableCell>
      <TableCell>{row.hostVersion}</TableCell>
      <TableCell>{row.cpu}</TableCell>
      <TableCell>{row.ram}</TableCell>
      <TableCell>{row.disk}</TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            row.status === 'pending'
              ? 'warning'
              : row.status === 'approved'
              ? 'success'
              : row.status === 'rejected'
              ? 'error'
              : 'default'
          }
        >
          {row.status}
        </Label>
      </TableCell>
      <TableCell>{new Date(row.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Tooltip title="View">
            <IconButton color="success" size="small" onClick={handleView}>
              <Iconify icon="solar:eye-bold" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton color="warning" size="small" onClick={handleEdit}>
              <Iconify icon="solar:pen-bold" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" size="small" onClick={handleDelete}>
              <Iconify icon="solar:danger-bold" width={20} />
            </IconButton>
          </Tooltip>
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
      </TableCell>
    </TableRow>
  );
}
