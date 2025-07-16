import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Button from '@mui/material/Button';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

// Static Data for now. 
const CLUSTER_OPTIONS = [
  { value: 'cluster-1', label: 'Cluster 1' },
  { value: 'cluster-2', label: 'Cluster 2' },
];
const DATASTORE_OPTIONS = [
  { value: 'datastore-1', label: 'Datastore 1' },
  { value: 'datastore-2', label: 'Datastore 2' },
];
const OS_OPTIONS = [
  { value: 'ubuntu-20.04', label: 'Ubuntu 20.04' },
  { value: 'windows-2019', label: 'Windows Server 2019' },
  { value: 'centos-7', label: 'CentOS 7' },
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
        name="general.description"
        label="Description"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="general.cluster"
        label="Cluster"
        select
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {CLUSTER_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Field.Text>
      <Field.Text
        name="general.datastore"
        label="Datastore"
        select
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {DATASTORE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Field.Text>
    </>
  );
}

export function StepTwo() {
  return (
    <>
      <Field.Text
        name="resources.os"
        label="Operating System"
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
    </>
  );
}

export function StepThree() {
  return (
    <>
      <Field.Text
        name="network.ip"
        label="IP Address"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="network.network"
        label="Network Name"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </>
  );
}

export function StepReview({ values }: { values: any }) {
  // Display a summary of all entered data for review
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>Review your VM configuration</Typography>
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
      <Box>
        <Typography variant="subtitle2">Network</Typography>
        {Object.entries(values.network || {}).map(([key, value]) => (
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
      <Typography variant="subtitle1">All steps completed - your VM request is submitted!</Typography>
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