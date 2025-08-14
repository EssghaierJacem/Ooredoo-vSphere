import type { TableHeadCellProps } from 'src/components/table';

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

import { fetchWorkOrders } from 'src/lib/api';

// ----------------------------------------------------------------------

// Dynamic table headers based on available data
const getTableHeaders = (data: any[]): TableHeadCellProps[] => {
  if (!data || data.length === 0) {
    return [
      { id: 'name', label: 'Name', width: 180 },
      { id: 'status', label: 'Status', width: 110, align: 'center' },
      { id: 'actions', label: 'Actions', width: 120, align: 'center' },
    ];
  }

  const headers: TableHeadCellProps[] = [
    { id: 'name', label: 'Name', width: 180 },
  ];

  // Check if any row has owner data
  if (data.some(row => row.owner)) {
    headers.push({ id: 'owner', label: 'Owner', width: 140 });
  }

  // Check if any row has description data
  if (data.some(row => row.description)) {
    headers.push({ id: 'description', label: 'Description', width: 250 });
  }

  // Check if any row has CPU data
  if (data.some(row => row.cpu)) {
    headers.push({ id: 'cpu', label: 'CPU', width: 80, align: 'center' });
  }

  // Check if any row has RAM data
  if (data.some(row => row.ram)) {
    headers.push({ id: 'ram', label: 'RAM (GB)', width: 100, align: 'center' });
  }

  // Check if any row has disk data
  if (data.some(row => row.disk)) {
    headers.push({ id: 'disk', label: 'Disk (GB)', width: 100, align: 'center' });
  }

  // Check if any row has host_id data
  if (data.some(row => row.host_id)) {
    headers.push({ id: 'host_id', label: 'Host', width: 140 });
  }

  // Check if any row has datastore_id data
  if (data.some(row => row.datastore_id)) {
    headers.push({ id: 'datastore_id', label: 'Datastore', width: 140 });
  }

  // Always include status and priority if they exist
  if (data.some(row => row.status)) {
    headers.push({ id: 'status', label: 'Status', width: 110, align: 'center' });
  }

  if (data.some(row => row.priority)) {
    headers.push({ id: 'priority', label: 'Priority', width: 110, align: 'center' });
  }

  // Check if any row has created_at data
  if (data.some(row => row.created_at)) {
    headers.push({ id: 'created_at', label: 'Created Date', width: 140 });
  }

  // Check if any row has deadline data
  if (data.some(row => row.deadline)) {
    headers.push({ id: 'deadline', label: 'Deadline', width: 140 });
  }

  // Always include actions
  headers.push({ id: 'actions', label: 'Actions', width: 120, align: 'center' });

  return headers;
};

// ----------------------------------------------------------------------

function WorkOrderDetailedView() {
  const theme = useTheme();
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Get dynamic table headers based on available data
  const tableHeaders = getTableHeaders(tableData);

  // Fetch workorders
  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchWorkOrders(1000); // Fetch up to 1000 workorders for detailed view
        setTableData(data);
      } catch (error) {
        console.error('Error fetching workorders:', error);
        toast.error('Failed to load workorders');
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, []);

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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
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
    window.location.href = paths.dashboard.workorder.detail(id);
  };

  const handleEdit = (id: string) => {
    window.location.href = paths.dashboard.workorder.edit(id);
  };

  const paginatedData = tableData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Work Orders - Detailed View"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Work Orders', href: paths.dashboard.workorder.list },
          { name: 'Detailed View' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.workorder.list}
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
            Work Orders - Comprehensive Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing all work order details including VM specifications, resource allocation, and status information
          </Typography>
        </Box>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
                         <Table size="small" sx={{ minWidth: tableHeaders.length * 150 }}>
               <TableHeadCustom
                 headCells={tableHeaders}
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
                     <TableCell colSpan={tableHeaders.length} align="center">
                       <Typography variant="body2" color="text.secondary">
                         Loading...
                       </Typography>
                     </TableCell>
                   </TableRow>
                 ) : paginatedData.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={tableHeaders.length} align="center">
                       <Typography variant="body2" color="text.secondary">
                         No work orders found
                       </Typography>
                     </TableCell>
                   </TableRow>
                 ) : (
                   paginatedData.map((row) => (
                     <TableRow key={row.id} hover>
                                               {tableHeaders.map((header) => {
                          switch (header.id) {
                            case 'name':
                              return (
                                <TableCell key={header.id}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {row.name || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'owner':
                              return (
                                <TableCell key={header.id}>
                                  <Typography variant="body2">
                                    {row.owner || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'description':
                              return (
                                <TableCell key={header.id}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      maxWidth: 250, 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={row.description || 'N/A'}
                                  >
                                    {row.description || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'cpu':
                              return (
                                <TableCell key={header.id} align="center">
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {row.cpu || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'ram':
                              return (
                                <TableCell key={header.id} align="center">
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {row.ram || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'disk':
                              return (
                                <TableCell key={header.id} align="center">
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {row.disk || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'host_id':
                              return (
                                <TableCell key={header.id}>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {row.host_id || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'datastore_id':
                              return (
                                <TableCell key={header.id}>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {row.datastore_id || 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'status':
                              return (
                                <TableCell key={header.id} align="center">
                                  <Label variant="soft" color={getStatusColor(row.status)}>
                                    {row.status || 'N/A'}
                                  </Label>
                                </TableCell>
                              );
                            case 'priority':
                              return (
                                <TableCell key={header.id} align="center">
                                  <Label variant="soft" color={getPriorityColor(row.priority)}>
                                    {row.priority || 'N/A'}
                                  </Label>
                                </TableCell>
                              );
                            case 'created_at':
                              return (
                                <TableCell key={header.id}>
                                  <Typography variant="body2">
                                    {row.created_at ? fDate(row.created_at) : 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'deadline':
                              return (
                                <TableCell key={header.id}>
                                  <Typography variant="body2">
                                    {row.deadline ? fDate(row.deadline) : 'N/A'}
                                  </Typography>
                                </TableCell>
                              );
                            case 'actions':
                              return (
                                <TableCell key={header.id} align="center">
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
                              );
                            default:
                              return null;
                          }
                        })}
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

export default WorkOrderDetailedView;
