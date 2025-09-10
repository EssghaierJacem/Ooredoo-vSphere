import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { MotivationIllustration } from 'src/assets/illustrations';
import {
  _ecommerceNewProducts,
  _ecommerceBestSalesman,
  _ecommerceSalesOverview,
  _ecommerceLatestProducts,
} from 'src/_mock';

import { useMockedUser } from 'src/auth/hooks';
import { fetchWorkOrders } from 'src/lib/api';
import { useEffect, useState } from 'react';

import { EcommerceWelcome } from '../ecommerce-welcome';
import { EcommerceNewProducts } from '../ecommerce-new-products';
import { EcommerceYearlySales } from '../ecommerce-yearly-sales';
import { EcommerceBestSalesman } from '../ecommerce-best-salesman';
import { EcommerceSaleByGender } from '../ecommerce-sale-by-gender';
import { EcommerceSalesOverview } from '../ecommerce-sales-overview';
import { EcommerceWidgetSummary } from '../ecommerce-widget-summary';
import { EcommerceLatestProducts } from '../ecommerce-latest-products';
import { EcommerceCurrentBalance } from '../ecommerce-current-balance';
import { TablePaginationCustom } from 'src/components/table/table-pagination-custom';
import { useTable } from 'src/components/table/use-table';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

// Add the type for work orders
export interface WorkOrderTableRow {
  id: string;
  name: string;
  os: string;
  hostVersion: string;
  cpu: number;
  ram: number;
  disk: number;
  status: string;
  createdAt: string;
}

// Calculate monthly and weekly stats for workorders
import dayjs from 'dayjs';

export function OverviewEcommerceView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const [workOrders, setWorkOrders] = useState<WorkOrderTableRow[]>([]);
  const [search, setSearch] = useState('');
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc', defaultRowsPerPage: 5 });

  useEffect(() => {
    fetchWorkOrders(5).then((data) => {
      setWorkOrders(
        (data as any[]).map((order): WorkOrderTableRow => ({
          id: String(order.id),
          name: order.name,
          os: order.os,
          hostVersion: order.host_version,
          cpu: order.cpu,
          ram: order.ram,
          disk: order.disk,
          status: order.status,
          createdAt: order.created_at,
        }))
      );
    });
  }, []);

  // Filtering and sorting logic
  const filtered = workOrders.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q) ||
      row.os.toLowerCase().includes(q) ||
      row.hostVersion.toLowerCase().includes(q)
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

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = dayjs();
  const thisYear = now.year();

  // Helper: get workorders by month and status
  type MonthStats = { [month: string]: number };
  function getMonthlyCounts(status?: string) {
    const counts: MonthStats = {};
    months.forEach(m => (counts[m] = 0));
    workOrders.forEach(order => {
      const d = dayjs(order.createdAt);
      if (d.year() === thisYear && (!status || order.status?.toLowerCase() === status)) {
        counts[months[d.month()]]++;
      }
    });
    return months.map(m => counts[m]);
  }
  // Helper: get count for last 7 days and previous 7 days
  function getWeeklyChange(status?: string) {
    const last7 = now.subtract(7, 'day');
    const prev7 = now.subtract(14, 'day');
    let thisWeek = 0, lastWeek = 0;
    workOrders.forEach(order => {
      const d = dayjs(order.createdAt);
      if (!status || order.status?.toLowerCase() === status) {
        if (d.isAfter(last7)) thisWeek++;
        else if (d.isAfter(prev7) && d.isBefore(last7)) lastWeek++;
      }
    });
    const percent = lastWeek === 0 ? (thisWeek > 0 ? 1 : 0) : (thisWeek - lastWeek) / lastWeek;
    return { thisWeek, lastWeek, percent: percent * 100 };
  }

  const totalRequested = getMonthlyCounts();
  const totalApproved = getMonthlyCounts('approved');
  const totalPending = getMonthlyCounts('pending');
  const requestedChange = getWeeklyChange();
  const approvedChange = getWeeklyChange('approved');
  const pendingChange = getWeeklyChange('pending');

  const osCounts: Record<string, number> = {};
  workOrders.forEach(order => {
    if (order.os) {
      const os = order.os;
      osCounts[os] = (osCounts[os] || 0) + 1;
    }
  });
  const osNameMap: Record<string, string> = {
    ubuntu64Guest: 'Ubuntu',
    centos7_64Guest: 'CentOS 7',
    windows9_64Guest: 'Windows 10',
    debian10_64Guest: 'Debian 10',
    rhel7_64Guest: 'RHEL 7',
    otherGuest64: 'Other Linux',
  };
  const totalWorkOrders = workOrders.length;
  const topOs = Object.entries(osCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([os, count]) => ({
      label: osNameMap[os] || os,
      value: totalWorkOrders > 0 ? Math.round((count / totalWorkOrders) * 100) : 0,
    }));
  const totalTopOs = topOs.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <EcommerceWelcome
            title={`Welcome Back  \n ${user?.displayName}`}
            description="Best seller of the month you have done 57.6% more sales today."
            img={<MotivationIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary">
                Go now
              </Button>
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
            percent={requestedChange.percent}
            total={workOrders.length}
            chart={{
              colors: [theme.palette.primary.light, theme.palette.primary.main],
              categories: months,
              series: totalRequested,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Pending Workorders"
            percent={pendingChange.percent}
            total={workOrders.filter(w => w.status?.toLowerCase() === 'pending').length}

            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              categories: months,
              series: totalApproved,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <EcommerceWidgetSummary
            title="Total Approved"
            percent={approvedChange.percent}
            total={workOrders.filter(w => w.status?.toLowerCase() === 'approved').length}
            chart={{
              colors: [theme.palette.error.light, theme.palette.error.main],
              categories: months,
              series: totalPending,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <EcommerceSaleByGender
            title="Most Requested OS (%)"
            total={totalTopOs}
            chart={{
              series: topOs,
              colors: [
                [theme.palette.primary.light, theme.palette.primary.main],
                [theme.palette.warning.light, theme.palette.warning.main],
                [theme.palette.error.light, theme.palette.error.main],
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <EcommerceYearlySales
            title="Yearly sales"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  name: '2022',
                  data: [
                    {
                      name: 'Total income',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Total expenses',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  name: '2023',
                  data: [
                    {
                      name: 'Total income',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Total expenses',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <EcommerceSalesOverview title="Sales overview" data={_ecommerceSalesOverview} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <EcommerceCurrentBalance
            title="Current balance"
            earning={25500}
            refunded={1600}
            orderTotal={287650}
            currentBalance={187650}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 12 }}>
          <EcommerceBestSalesman
            title="Latest Work Orders"
            tableData={paginated}
            headCells={[
              { id: 'name', label: 'VM Name' },
              { id: 'os', label: 'OS' },
              { id: 'hostVersion', label: 'Host Version' },
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
