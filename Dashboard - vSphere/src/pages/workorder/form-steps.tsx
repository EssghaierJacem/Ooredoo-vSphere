import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Button from '@mui/material/Button';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from 'react';
import { fetchHosts, fetchTemplates } from 'src/lib/api';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

// Valid vSphere guest_id options
const OS_OPTIONS = [
  { value: 'ubuntu64Guest', label: 'Ubuntu 20.04 / 22.04 (64-bit)' },
  { value: 'centos7_64Guest', label: 'CentOS 7 (64-bit)' },
  { value: 'windows9_64Guest', label: 'Windows 10 (64-bit)' },
  { value: 'debian10_64Guest', label: 'Debian 10 (64-bit)' },
  { value: 'rhel7_64Guest', label: 'Red Hat Enterprise Linux 7 (64-bit)' },
  { value: 'otherGuest64', label: 'Other 64-bit Linux' },
  // Add more as needed
];
const HOST_VERSION_OPTIONS = [
  { value: 'esxi-7.0', label: 'ESXi 7.0' },
  { value: 'esxi-6.7', label: 'ESXi 6.7' },
  { value: 'esxi-8.0', label: 'ESXi 8.0' },
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
  return (
    <>
      <Field.Text
        name="general.name"
        label="VM Name"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="general.os"
        label="OS Type"
        select
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {OS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Field.Text>
      <Field.Text
        name="general.hostVersion"
        label="Host Version"
        select
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {HOST_VERSION_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Field.Text>
    </>
  );
}

export function StepTwo() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  useEffect(() => {
    fetchHosts().then(setHosts);
    fetchTemplates().then(setTemplates);
  }, []);
  return (
    <>
      <Field.Text
        name="resources.cpu"
        label="CPU (vCPU)"
        type="number"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="resources.ram"
        label="RAM (GB)"
        type="number"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="resources.disk"
        label="Disk (GB)"
        type="number"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      {/* Host and VM Template selection removed from creation form. Only available in edit. */}
    </>
  );
}

export function StepReview({ values }: { values: any }) {
  // Display a summary of all entered data for review
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>Review your Work Order</Typography>
      <Box>
        <Typography variant="subtitle2">General Info</Typography>
        {Object.entries(values.general || {}).map(([key, value]) => (
          <Typography key={key} variant="body2"><b>{key}:</b> {String(value)}</Typography>
        ))}
      </Box>
      <Box>
        <Typography variant="subtitle2">Resources</Typography>
        {Object.entries(values.resources || {}).map(([key, value]) => (
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
      <Typography variant="subtitle1">All steps completed - your Work Order is submitted!</Typography>
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