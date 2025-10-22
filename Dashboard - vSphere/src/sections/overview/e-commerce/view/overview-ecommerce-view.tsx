import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { MotivationIllustration } from 'src/assets/illustrations';
import {
  _ecommerceNewProducts,
  _ecommerceBestSalesman,
  _ecommerceLatestProducts,
} from 'src/_mock';

import { useMockedUser } from 'src/auth/hooks';
import { fetchWorkOrders, fetchVNIWorkOrders } from 'src/lib/api';
import { useEffect, useState } from 'react';
import { exportWorkOrdersToExcel, exportVNIWorkOrdersToExcel } from 'src/utils/simple-excel-export';
import dayjs from 'dayjs';

import { EcommerceWelcome } from '../ecommerce-welcome';
import { EcommerceNewProducts } from '../ecommerce-new-products';
import { EcommerceBestSalesman } from '../ecommerce-best-salesman';
import { EcommerceWidgetSummary } from '../ecommerce-widget-summary';
import { EcommerceLatestProducts } from '../ecommerce-latest-products';
import { TablePaginationCustom } from 'src/components/table/table-pagination-custom';
import { toast } from 'src/components/snackbar';
import { useTable } from 'src/components/table/use-table';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

// Add the type for work orders
export interface WorkOrderTableRow {
  id: string;
  name: string;
  os: string;
  site: string;
  cluster: string;
  cpu: number;
  ram: number;
  disk: number;
  status: string;
  createdAt: string;
}

// Calculate monthly and weekly stats for workorders

export function OverviewEcommerceView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const [workOrders, setWorkOrders] = useState<WorkOrderTableRow[]>([]);
  const [vniWorkOrders, setVNIWorkOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc', defaultRowsPerPage: 5 });

  useEffect(() => {
    // Fetch VM work orders
    fetchWorkOrders(5).then((data) => {
      setWorkOrders(
        (data as any[]).map((order): WorkOrderTableRow => ({
          id: String(order.id),
          name: order.name,
          os: order.os,
          site: order.site || 'OT-CHARGUIA',
          cluster: order.cluster || 'ITaaS Workload',
          cpu: order.cpu,
          ram: order.ram,
          disk: order.disk,
          status: order.status,
          createdAt: order.created_at,
        }))
      );
    });

    // Fetch VNI work orders
    fetchVNIWorkOrders().then((data) => {
      setVNIWorkOrders(data as any[]);
    });
  }, []);

  // Filtering and sorting logic
  const filtered = workOrders.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q) ||
      row.os.toLowerCase().includes(q) ||
      row.site.toLowerCase().includes(q) ||
      row.cluster.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const { order, orderBy } = table;
    let aValue = a[orderBy as keyof WorkOrderTableRow];
    let bValue = b[orderBy as keyof WorkOrderTableRow];
    if (orderBy === 'createdAt') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return order === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const paginated = sorted.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const handleExportSummary = () => {
    try {
      // Export VM work orders
      exportWorkOrdersToExcel(workOrders, 'vm-workorders-summary');
      
      // Export VNI work orders
      exportVNIWorkOrdersToExcel(vniWorkOrders, 'vni-workorders-summary');
      
      toast.success('Excel files exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export Excel files');
    }
  };

  // All chart calculations removed to prevent ApexCharts errors

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <EcommerceWelcome
            title={`Welcome Back  \n ${user?.displayName}`}
            description="Best seller of the month you have done 57.6% more sales today."
            img={<MotivationIllustration hideBackground />}
            action={
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={handleExportSummary}
                >
                  📊 Export Summary
                </Button>
                <Button variant="contained" color="primary">
                  Go now
                </Button>
              </Stack>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceNewProducts list={workOrders.slice(0, 4).map(order => ({
            id: order.id,
            name: order.name,
            coverUrl: 'https://img.freepik.com/premium-vector/sky-pixel-background-gradient-seamless-pattern-retro-8-bit-game-wallpaper-bright-vector-backdrop_926199-3741732.jpg', 
          }))} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Total Workorders Requested"
            percent={0}
            total={workOrders.length}
            chart={{
              colors: [theme.palette.primary.light, theme.palette.primary.main],
              categories: [],
              series: [],
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Pending Workorders"
            percent={0}
            total={workOrders.filter(w => w.status?.toLowerCase() === 'pending').length}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              categories: [],
              series: [],
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Total Approved"
            percent={0}
            total={workOrders.filter(w => w.status?.toLowerCase() === 'approved').length}
            chart={{
              colors: [theme.palette.error.light, theme.palette.error.main],
              categories: [],
              series: [],
            }}
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6, lg: 12 }}>
          <EcommerceBestSalesman
            title="Latest Work Orders"
            tableData={paginated}
            headCells={[
              { id: 'name', label: 'VM Name' },
              { id: 'os', label: 'OS' },
              { id: 'site', label: 'Site' },
              { id: 'cluster', label: 'Cluster' },
              { id: 'cpu', label: 'CPU' },
              { id: 'ram', label: 'RAM' },
              { id: 'disk', label: 'Disk' },
              { id: 'status', label: 'Status' },
              { id: 'createdAt', label: 'Requested At' },
            ]}
            order={table.order}
            orderBy={table.orderBy}
            onSort={table.onSort}
            search={search}
            onSearch={val => { table.setPage(0); setSearch(val); }}
            pagination={
              <TablePaginationCustom
                count={sorted.length}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
              />
            }
          />
        </Grid>

      </Grid>
    </DashboardContent>
  );
}
