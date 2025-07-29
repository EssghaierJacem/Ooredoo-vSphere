import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Button from '@mui/material/Button';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { useState, useEffect } from 'react';
import { DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useFormContext } from 'react-hook-form';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import type { IDatePickerControl } from 'src/types/common';

// Priority options
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

// Common T0/T1 Gateway options (you can fetch these from API later)
const T0_GATEWAY_OPTIONS = [
  { value: 'itaas-t0-gw', label: 'ITAAS T0 Gateway' },
  { value: 'prod-t0-gw', label: 'Production T0 Gateway' },
  { value: 'dev-t0-gw', label: 'Development T0 Gateway' },
];

const T1_GATEWAY_OPTIONS = [
  { value: 'itaas-t1-gw', label: 'ITAAS T1 Gateway' },
  { value: 'prod-t1-gw', label: 'Production T1 Gateway' },
  { value: 'dev-t1-gw', label: 'Development T1 Gateway' },
];

// ----------------------------------------------------------------------

type StepperProps = {
  steps: string[];
  activeStep: number;
};

export function Stepper({ steps, activeStep }: StepperProps) {
  return (
    <MuiStepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            slots={{
              stepIcon: ({ active, completed }) => (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    borderRadius: '50%',
                    alignItems: 'center',
                    color: 'text.disabled',
                    typography: 'subtitle2',
                    justifyContent: 'center',
                    bgcolor: 'action.disabledBackground',
                    ...(active && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                    ...(completed && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                  }}
                >
                  {completed ? (
                    <Iconify width={16} icon="eva:checkmark-fill" />
                  ) : (
                    <Box sx={{ typography: 'subtitle2' }}>{index + 1}</Box>
                  )}
                </Box>
              ),
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}

// ----------------------------------------------------------------------

export function StepOne() {
  const { setValue } = useFormContext();
  const [deadline, setDeadline] = useState<IDatePickerControl>(dayjs(new Date()));

  const handleDeadlineChange = (newValue: IDatePickerControl) => {
    setDeadline(newValue);
    setValue('general.deadline', newValue?.toISOString() || new Date().toISOString());
  };

  return (
    <>
      <Field.Text
        name="general.owner"
        label="Owner"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      
      <Field.Text
        name="general.requested_by"
        label="Requested By"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="general.project"
        label="Project"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="general.description"
        label="Description"
        variant="filled"
        multiline
        rows={3}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="general.priority"
        label="Priority"
        select
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {PRIORITY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Field.Text>

      <DesktopDatePicker
        label="Deadline"
        value={deadline}
        minDate={dayjs('2020-01-01')}
        onChange={handleDeadlineChange}
        slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
      />
    </>
  );
}

export function StepTwo() {
  const { setValue, watch } = useFormContext();
  const firstIp = watch('vni_config.first_ip');
  const lastIp = watch('vni_config.last_ip');
  const gateway = watch('vni_config.gateway');
  const cidr = watch('vni_config.cidr');

  // Network validation state
  const [networkValidation, setNetworkValidation] = useState<{
    isValid: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error';
  } | null>(null);

  // Function to check if IPs are in the same network
  const checkNetworkCompatibility = (gatewayIp: string, firstIpAddr: string, lastIpAddr: string, cidrBlock: string) => {
    if (!gatewayIp || !firstIpAddr || !lastIpAddr || !cidrBlock) {
      return null;
    }

    try {
      // Parse CIDR to get network address and mask
      const [networkAddr, prefixLength] = cidrBlock.split('/');
      const mask = parseInt(prefixLength);
      
      if (isNaN(mask) || mask < 0 || mask > 32) {
        return {
          isValid: false,
          message: 'Invalid CIDR format. Please use format like 192.168.1.0/24',
          severity: 'error' as const
        };
      }

      // Convert IPs to numbers
      const ipToNumber = (ip: string) => {
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
          throw new Error('Invalid IP address');
        }
        return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
      };

      const gatewayNum = ipToNumber(gatewayIp);
      const firstNum = ipToNumber(firstIpAddr);
      const lastNum = ipToNumber(lastIpAddr);
      const networkNum = ipToNumber(networkAddr);

      // Calculate network mask
      const networkMask = mask === 32 ? 0xFFFFFFFF : (0xFFFFFFFF << (32 - mask));

      // Check if all IPs are in the same network
      const gatewayNetwork = gatewayNum & networkMask;
      const firstNetwork = firstNum & networkMask;
      const lastNetwork = lastNum & networkMask;
      const expectedNetwork = networkNum & networkMask;

      if (gatewayNetwork !== expectedNetwork) {
        return {
          isValid: false,
          message: `Gateway ${gatewayIp} is not in the network ${cidrBlock}. Gateway must be in the same network as the IP range.`,
          severity: 'error' as const
        };
      }

      if (firstNetwork !== expectedNetwork || lastNetwork !== expectedNetwork) {
        return {
          isValid: false,
          message: `IP range ${firstIpAddr} - ${lastIpAddr} is not in the network ${cidrBlock}. All IPs must be in the same network.`,
          severity: 'error' as const
        };
      }

      // Check if first IP is less than last IP
      if (firstNum > lastNum) {
        return {
          isValid: false,
          message: 'First IP must be less than or equal to Last IP.',
          severity: 'error' as const
        };
      }

      // Check if gateway is within the IP range
      if (gatewayNum >= firstNum && gatewayNum <= lastNum) {
        return {
          isValid: false,
          message: `Gateway ${gatewayIp} is within the IP range ${firstIpAddr} - ${lastIpAddr}. Gateway should be outside the IP range.`,
          severity: 'warning' as const
        };
      }

      return {
        isValid: true,
        message: `Network configuration is valid. All IPs are in the network ${cidrBlock}.`,
        severity: 'success' as const
      };

    } catch (error) {
      return {
        isValid: false,
        message: 'Invalid IP address format. Please check your IP addresses.',
        severity: 'error' as const
      };
    }
  };

  // Update number of IPs when first or last IP changes
  useEffect(() => {
    if (!firstIp || !lastIp) {
      setValue('vni_config.number_of_ips', 0);
      return;
    }
    
    try {
      const firstParts = firstIp.split('.').map(Number);
      const lastParts = lastIp.split('.').map(Number);
      
      if (firstParts.length !== 4 || lastParts.length !== 4) {
        setValue('vni_config.number_of_ips', 0);
        return;
      }
      
      const firstNum = (firstParts[0] << 24) + (firstParts[1] << 16) + (firstParts[2] << 8) + firstParts[3];
      const lastNum = (lastParts[0] << 24) + (lastParts[1] << 16) + (lastParts[2] << 8) + lastParts[3];
      
      const numberOfIPs = Math.max(0, lastNum - firstNum + 1);
      setValue('vni_config.number_of_ips', numberOfIPs);
    } catch {
      setValue('vni_config.number_of_ips', 0);
    }
  }, [firstIp, lastIp, setValue]);

  // Check network compatibility when relevant fields change
  useEffect(() => {
    const validation = checkNetworkCompatibility(gateway, firstIp, lastIp, cidr);
    setNetworkValidation(validation);
  }, [gateway, firstIp, lastIp, cidr]);

  return (
    <>
      <Field.Text
        name="vni_config.t0_gw"
        label="T0 Gateway"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.t1_gw"
        label="T1 Gateway"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.vni_name"
        label="VNI Name"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.cidr"
        label="CIDR (e.g., 10.184.36.160/28)"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.subnet_mask"
        label="Subnet Mask (e.g., 255.255.255.240)"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.gateway"
        label="Gateway IP"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.first_ip"
        label="First IP"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.last_ip"
        label="Last IP"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="vni_config.number_of_ips"
        label="Number of IPs (Auto-calculated)"
        type="number"
        variant="filled"
        disabled
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {/* Network Validation Alert */}
      {networkValidation && (
        <Alert severity={networkValidation.severity} sx={{ mt: 3 }}>
          {networkValidation.message}
        </Alert>
      )}
    </>
  );
}

export function StepReview({ values }: { values: any }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>Review your VNI Work Order</Typography>
      
      <Box>
        <Typography variant="subtitle2">General Information</Typography>
        {Object.entries(values.general || {}).map(([key, value]) => (
          <Typography key={key} variant="body2"><b>{key}:</b> {String(value)}</Typography>
        ))}
        <Typography variant="body2"><b>status:</b> pending (default)</Typography>
      </Box>
      
      <Box>
        <Typography variant="subtitle2">VNI Configuration</Typography>
        {Object.entries(values.vni_config || {}).map(([key, value]) => (
          <Typography key={key} variant="body2"><b>{key}:</b> {String(value)}</Typography>
        ))}
      </Box>
    </Box>
  );
}

export function StepCompleted({ onReset }: { onReset: () => void }) {
  return (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 'inherit',
        bgcolor: 'background.neutral',
      }}
    >
      <Typography variant="subtitle1">All steps completed - your VNI Work Order is submitted!</Typography>
      <Button
        variant="outlined"
        onClick={onReset}
        startIcon={<Iconify icon="solar:restart-bold" />}
      >
        Reset
      </Button>
    </Box>
  );
} 