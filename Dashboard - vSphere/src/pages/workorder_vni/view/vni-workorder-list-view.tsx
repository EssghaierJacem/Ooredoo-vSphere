import type { TableHeadCellProps } from 'src/components/table';
import type { IVNIWorkOrder, IVNIWorkOrderTableFilters } from 'src/types/vni-workorder';

import { sumBy } from 'es-toolkit';
import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { VNIWorkOrderTableRow } from '../vni-workorder-table-row';
import { VNIWorkOrderTableToolbar } from '../vni-workorder-table-toolbar';
import { VNIWorkOrderTableFiltersResult } from '../vni-workorder-table-filters-result';
import { VNIWorkOrderAnalytic } from '../vni-workorder-analytic';
import { fetchVNIWorkOrders, deleteVNIWorkOrder } from 'src/lib/api';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'owner', label: 'Owner' },
  { id: 'requested_date', label: 'Requested' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'priority', label: 'Priority' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: '' },
];

// ----------------------------------------------------------------------

function VNIWorkOrderListView() {
  const theme = useTheme();

  const table = useTable({ defaultOrderBy: 'requested_date' });

  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState<IVNIWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = useSetState<IVNIWorkOrderTableFilters>({
    owner: '',
    project: [],
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  // Fetch VNI workorders
  useEffect(() => {
    const loadVNIWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchVNIWorkOrders(100); // Fetch up to 100 workorders
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

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.owner ||
    currentFilters.project.length > 0 ||
    currentFilters.status !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const denseHeight = table.dense ? 52 : 72;

  const isFiltered = canReset;

  const isNotFound = (!dataFiltered.length && !!canReset) || (!loading && !dataFiltered.length);

  const handleFilters = useCallback(
    (name: string, value: string | string[] | null) => {
      table.onResetPage();
      updateFilters({
        ...currentFilters,
        [name]: value,
      });
    },
    [table, updateFilters, currentFilters]
  );

  const handleResetFilters = useCallback(() => {
    updateFilters({
      owner: '',
      project: [],
      status: 'all',
      startDate: null,
      endDate: null,
    });
  }, [updateFilters]);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteVNIWorkOrder(parseInt(id));
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);

        table.onUpdatePageDeleteRow(dataInPage.length);

        toast.success('Delete success!');
      } catch (error) {
        console.error('Error deleting VNI workorder:', error);
        toast.error('Failed to delete VNI workorder');
      }
    },
    [tableData, table, dataInPage.length]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows(tableData.length, dataInPage.length);

    toast.success('Delete success!');

    confirmDialog.onFalse();
  }, [tableData, table, dataInPage.length, confirmDialog]);

  const handleEditRow = useCallback(
    (id: number) => {
      // Navigate to edit page
      window.location.href = paths.dashboard.workorder_vni.edit(id);
    },
    []
  );

  const handleViewRow = useCallback(
    (id: number) => {
      // Navigate to detail page
      window.location.href = paths.dashboard.workorder_vni.detail(id);
    },
    []
  );

  const getVNIWorkOrderLength = (status: string) =>
    tableData.filter((item) => item.status === status).length;



  const getPercentByStatus = (status: string) =>
    (getVNIWorkOrderLength(status) / tableData.length) * 100;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    { value: 'pending', label: 'Pending', color: 'warning', count: getVNIWorkOrderLength('pending') },
    { value: 'approved', label: 'Approved', color: 'success', count: getVNIWorkOrderLength('approved') },
    { value: 'rejected', label: 'Rejected', color: 'error', count: getVNIWorkOrderLength('rejected') },
    { value: 'draft', label: 'Draft', color: 'default', count: getVNIWorkOrderLength('draft') },
  ] as const;

  const currentTab = currentFilters.status;

  const filteredData = currentTab === 'all' 
    ? dataFiltered 
    : dataFiltered.filter((item) => item.status === currentTab);

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong>{table.selected.length}</strong> items?
        </>
      }
      action={
        <Button variant="contained" color="error" onClick={handleDeleteRows}>
          Delete
        </Button>
      }
    />
  );

  const renderTabs = (
    <Tabs
      value={currentFilters.status}
      onChange={(event, newValue) => handleFilters('status', newValue)}
      sx={{
        px: 2.5,
        boxShadow: 'inset 0 -2px 0 0 rgba(145, 158, 171, 0.08)',
      }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          iconPosition="end"
          icon={
            <Label
              variant={
                ((tab.value === 'all' || tab.value === currentFilters.status) && 'filled') ||
                'soft'
              }
              color={tab.color}
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </Tabs>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="VNI Work Orders"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'VNI Work Orders' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.workorder_vni.request}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New VNI Work Order
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
              />

        <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Scrollbar sx={{ minHeight: 108 }}>
            <Stack
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2, flexDirection: 'row' }}
            >
              <VNIWorkOrderAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                icon="solar:bill-list-bold-duotone"
                color={theme.vars.palette.info.main}
              />

              <VNIWorkOrderAnalytic
                title="Pending"
                total={getVNIWorkOrderLength('pending')}
                percent={getPercentByStatus('pending')}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.vars.palette.warning.main}
              />

              <VNIWorkOrderAnalytic
                title="Approved"
                total={getVNIWorkOrderLength('approved')}
                percent={getPercentByStatus('approved')}
                icon="solar:file-check-bold-duotone"
                color={theme.vars.palette.success.main}
              />

              <VNIWorkOrderAnalytic
                title="Rejected"
                total={getVNIWorkOrderLength('rejected')}
                percent={getPercentByStatus('rejected')}
                icon="solar:bell-bing-bold-duotone"
                color={theme.vars.palette.error.main}
              />

              <VNIWorkOrderAnalytic
                title="Draft"
                total={getVNIWorkOrderLength('draft')}
                percent={getPercentByStatus('draft')}
                icon="solar:file-corrupted-bold-duotone"
                color={theme.vars.palette.text.secondary}
              />
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          {renderTabs}

        <VNIWorkOrderTableToolbar
          filters={filters}
          dateError={dateError}
          onResetPage={table.onResetPage}
          options={{ projects: Array.from(new Set(tableData.map((item) => item.project))) }}
        />

        <VNIWorkOrderTableFiltersResult
          filters={currentFilters}
          onFilters={handleFilters}
          onResetFilters={handleResetFilters}
          results={dataFiltered.length}
          canReset={canReset}
          sx={{ p: 2.5, pt: 0 }}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                      <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                );
              }}
              action={
                <Box sx={{ display: 'flex' }}>
                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Export">
                    <IconButton color="primary">
                      <Iconify icon="solar:export-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Import">
                    <IconButton color="primary">
                      <Iconify icon="solar:import-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirmDialog.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <VNIWorkOrderTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      editHref={paths.dashboard.workorder_vni.edit(row.id)}
                      detailsHref={paths.dashboard.workorder_vni.detail(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={isNotFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      {renderConfirmDialog()}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  dateError: boolean;
  inputData: IVNIWorkOrder[];
  filters: IVNIWorkOrderTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
  const { owner, status, project, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (owner) {
    inputData = inputData.filter(
      (workorder) => workorder.owner.toLowerCase().indexOf(owner.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((workorder) => workorder.status === status);
  }

  if (project.length) {
    inputData = inputData.filter((workorder) => project.includes(workorder.project));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (workorder) =>
          fIsBetween(workorder.requested_date, startDate, endDate) ||
          fIsBetween(workorder.deadline, startDate, endDate)
      );
    }
  }

  return inputData;
}

export default VNIWorkOrderListView; 