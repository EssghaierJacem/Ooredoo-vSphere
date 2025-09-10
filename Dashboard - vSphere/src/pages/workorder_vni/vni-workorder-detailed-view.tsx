import type { TableHeadCellProps } from 'src/components/table';
import type { IVNIWorkOrder } from 'src/types/vni-workorder';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fTime } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { fetchVNIWorkOrders } from 'src/lib/api';

// ----------------------------------------------------------------------

const DETAILED_TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'project', label: 'Project', width: 180 },
  { id: 'owner', label: 'Owner', width: 140 },
  { id: 'description', label: 'Description', width: 250 },
  { id: 'vni_name', label: 'VNI Name', width: 140 },
  { id: 'cidr', label: 'CIDR', width: 120 },
  { id: 'subnet_mask', label: 'Subnet Mask', width: 140 },
  { id: 'gateway', label: 'Gateway', width: 140 },
  { id: 'number_of_ips', label: 'Number of IPs', width: 130, align: 'center' },
  { id: 'first_ip', label: 'First IP', width: 140 },
  { id: 'last_ip', label: 'Last IP', width: 140 },
  { id: 'status', label: 'Status', width: 110, align: 'center' },
  { id: 'priority', label: 'Priority', width: 110, align: 'center' },
  { id: 'requested_date', label: 'Requested Date', width: 140 },
  { id: 'deadline', label: 'Deadline', width: 140 },
  { id: 'actions', label: 'Actions', width: 120, align: 'center' },
];

// ----------------------------------------------------------------------

function VNIWorkOrderDetailedView() {
  const theme = useTheme();
  const [tableData, setTableData] = useState<IVNIWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch VNI workorders
  useEffect(() => {
    const loadVNIWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchVNIWorkOrders(1000); // Fetch up to 1000 workorders for detailed view
        setTableData(data);
      } catch (error) {
        console.error('Error fetching VNI workorders:', error);
        toast.error('Failed to load VNI workorders');
      } finally {
        setLoading(false);
      }
    };

    loadVNIWorkOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'normal':
        return 'default';
      case 'high':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (id: string) => {
    window.location.href = paths.dashboard.workorder_vni.detail(id);
  };

  const handleEdit = (id: string) => {
    window.location.href = paths.dashboard.workorder_vni.edit(id);
  };

  const paginatedData = tableData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="VNI Work Orders - Detailed View"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'VNI Work Orders', href: paths.dashboard.workorder_vni.list },
          { name: 'Detailed View' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.workorder_vni.list}
            variant="outlined"
            startIcon={<Iconify icon="solar:list-bold" />}
          >
            Back to List
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            VNI Work Orders - Comprehensive Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing all VNI work order details including project information, network configuration, and IP ranges
          </Typography>
        </Box>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="small" sx={{ minWidth: 2000 }}>
              <TableHeadCustom
                headCells={DETAILED_TABLE_HEAD}
                sx={{
                  '& .MuiTableCell-root': {
                    backgroundColor: theme.palette.background.neutral,
                    fontWeight: 600,
                  },
                }}
              />

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={DETAILED_TABLE_HEAD.length} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Loading...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={DETAILED_TABLE_HEAD.length} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No VNI work orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.project || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {row.owner || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 250, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={row.description}
                        >
                          {row.description || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {row.vni_name || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {row.cidr || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {row.subnet_mask || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {row.gateway || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.number_of_ips || 0}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {row.first_ip || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {row.last_ip || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Label variant="soft" color={getStatusColor(row.status)}>
                          {row.status}
                        </Label>
                      </TableCell>

                      <TableCell align="center">
                        <Label variant="soft" color={getPriorityColor(row.priority)}>
                          {row.priority}
                        </Label>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {row.requested_date ? fDate(row.requested_date) : 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {row.deadline ? fDate(row.deadline) : 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewDetails(row.id)}
                            >
                              <Iconify icon="solar:eye-bold" width={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleEdit(row.id)}
                            >
                              <Iconify icon="solar:pen-bold" width={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={tableData.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </DashboardContent>
  );
}

export default VNIWorkOrderDetailedView; 