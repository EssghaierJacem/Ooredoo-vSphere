import type { CardProps } from '@mui/material/Card';
import type { TableHeadCellProps } from 'src/components/table';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

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
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 422 }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHeadCustom headCells={headCells} />

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
      <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
    </TableRow>
  );
}
