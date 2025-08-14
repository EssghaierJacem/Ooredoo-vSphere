import type { IVNIWorkOrder } from 'src/types/vni-workorder';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { VNIWorkOrderToolbar } from './vni-workorder-toolbar';

// ----------------------------------------------------------------------

type Props = {
  vniWorkOrder?: IVNIWorkOrder;
};

export function VNIWorkOrderDetails({ vniWorkOrder }: Props) {


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

  const renderGeneralInfo = () => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        General Information
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              VNI Name
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.vni_name}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Owner
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.owner}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Requested By
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.requested_by}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Project
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.project}</Typography>
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Status
            </Typography>
            <Label variant="soft" color={getStatusColor(vniWorkOrder?.status || '')}>
              {vniWorkOrder?.status}
            </Label>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Priority
            </Typography>
            <Label variant="soft" color={getPriorityColor(vniWorkOrder?.priority || '')}>
              {vniWorkOrder?.priority}
            </Label>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Requested Date
            </Typography>
            <Typography variant="body1">{fDate(vniWorkOrder?.requested_date)}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Deadline
            </Typography>
            <Typography variant="body1">{fDate(vniWorkOrder?.deadline)}</Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );

  const renderVNIConfiguration = () => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        VNI Configuration
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              T0 Gateway
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.t0_gw}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              T1 Gateway
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.t1_gw}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Gateway
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.gateway}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              CIDR
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.cidr}</Typography>
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Subnet Mask
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.subnet_mask}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              First IP
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.first_ip}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Last IP
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.last_ip}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Number of IPs
            </Typography>
            <Typography variant="body1">{vniWorkOrder?.number_of_ips}</Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );

  const renderDescription = () => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Description
      </Typography>
      <Typography variant="body1">{vniWorkOrder?.description}</Typography>
    </Card>
  );

  const renderVirtualMachines = () => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Virtual Machines
      </Typography>

      {vniWorkOrder?.virtual_machines && vniWorkOrder.virtual_machines.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vniWorkOrder.virtual_machines.map((vm, index) => (
                <TableRow key={index}>
                  <TableCell>{vm.name || 'N/A'}</TableCell>
                  <TableCell>{vm.ip || 'N/A'}</TableCell>
                  <TableCell>
                    <Label variant="soft" color="success">
                      {vm.status || 'Active'}
                    </Label>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No virtual machines assigned to this VNI workorder.
        </Typography>
      )}
    </Card>
  );

  return (
    <>
      <VNIWorkOrderToolbar
        vniWorkOrder={vniWorkOrder}
      />

      <Scrollbar>
        {renderGeneralInfo()}
        {renderVNIConfiguration()}
        {renderDescription()}
        {renderVirtualMachines()}
      </Scrollbar>
    </>
  );
} 