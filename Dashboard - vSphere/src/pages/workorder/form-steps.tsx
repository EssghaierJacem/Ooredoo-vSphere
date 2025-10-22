import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
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

export function StepQuantity() {
  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        How many VMs would you like to create?
      </Typography>
      <Field.Text
        name="quantity.quantity"
        label="Number of VMs"
        type="number"
        variant="filled"
        slotProps={{ 
          inputLabel: { shrink: true }
        }}
        inputProps={{ min: 1, max: 10 }}
        helperText="You can create between 1 and 10 VMs at once"
      />
    </>
  );
}

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
    </>
  );
}

export function StepTwo() {
  return (
    <>
      <Field.Text
        name="network_config.ip"
        label="IP"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="network_config.gateway"
        label="Gateway"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="network_config.netmask"
        label="NetMask"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Field.Text
        name="network_config.uls"
        label="ULS"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </>
  );
}

export function StepThree() {
  const SITE_OPTIONS = [
    { value: 'OT-CHARGUIA', label: 'OT-CHARGUIA' },
    { value: 'OT-MGHIRA', label: 'OT-MGHIRA' },
  ];

  const CLUSTER_OPTIONS = [
    { value: 'Edge', label: 'Edge' },
    { value: 'ITaaS Workload', label: 'ITaaS Workload' },
    { value: 'ITaaS Workload NSX-T', label: 'ITaaS Workload NSX-T' },
    { value: 'ITaaS Workload2', label: 'ITaaS Workload2' },
    { value: 'ITaaS Workload2_NSX-T', label: 'ITaaS Workload2_NSX-T' },
    { value: 'ITaaS Workload3 NSX-T', label: 'ITaaS Workload3 NSX-T' },
    { value: 'ITaaS Workload4 NSX-T', label: 'ITaaS Workload4 NSX-T' },
  ];

  return (
    <>
      <Field.Text
        name="location.site"
        label="Site"
        select
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {SITE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Field.Text>
      <Field.Text
        name="location.cluster"
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
        name="location.datastore"
        label="DataStore"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </>
  );
}

export function StepFour() {
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
        label="DISK (GB)"
        type="number"
        variant="filled"
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </>
  );
}

export function StepFive() {
  const { control, watch, setValue } = useFormContext();
  const [customUser, setCustomUser] = useState<string>('');
  
  const selectedUsers = watch('users.users') || [];
  
  const USER_OPTIONS = [
    { value: 'Userapp', label: 'Userapp' },
    { value: 'Oss', label: 'Oss' },
    { value: 'Optim', label: 'Optim' },
    { value: 'Ingdba', label: 'Ingdba' },
    { value: 'Ingsec', label: 'Ingsec' },
    { value: 'Other', label: 'Other' },
  ];

  const handleAddCustomUser = () => {
    if (customUser.trim()) {
      const currentUsers = selectedUsers.filter((user: string) => user !== 'Other');
      const updatedUsers = [...currentUsers, customUser.trim()];
      setValue('users.users', updatedUsers);
      setCustomUser('');
    }
  };

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Select Users (you can select multiple):
      </Typography>
      <Controller
        name="users.users"
        control={control}
        defaultValue={[]}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth variant="filled" error={!!error}>
            <InputLabel shrink>Users</InputLabel>
            <Select
              {...field}
              multiple
              value={field.value || []}
              onChange={(e) => field.onChange(e.target.value)}
              renderValue={(selected) => {
                if (Array.isArray(selected) && selected.length > 0) {
                  return selected.join(', ');
                }
                return '';
              }}
            >
              {USER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
      
      {/* Custom User Input */}
      {selectedUsers.includes('Other') && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          <TextField
            label="Custom User"
            value={customUser}
            onChange={(e) => setCustomUser(e.target.value)}
            placeholder="Enter custom user name"
            variant="filled"
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            onClick={handleAddCustomUser}
            disabled={!customUser.trim()}
          >
            Add
          </Button>
        </Box>
      )}
    </>
  );
}

export function StepReview({ values }: { values: any }) {
  // Display a summary of all entered data for review
  const quantity = values.quantity?.quantity || 1;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>Review your Work Order</Typography>
      
      <Box>
        <Typography variant="subtitle2">Quantity</Typography>
        <Typography variant="body2"><b>Number of VMs:</b> {quantity}</Typography>
        {quantity > 1 && (
          <Typography variant="body2" color="info.main">
            VMs will be named: {values.general?.name}-01, {values.general?.name}-02, etc.
          </Typography>
        )}
      </Box>
      
      <Box>
        <Typography variant="subtitle2">General Information</Typography>
        {Object.entries(values.general || {}).map(([key, value]) => (
          <Typography key={key} variant="body2"><b>{key}:</b> {String(value)}</Typography>
        ))}
      </Box>
      
      <Box>
        <Typography variant="subtitle2">Network Configuration</Typography>
        {Object.entries(values.network_config || {}).map(([key, value]) => (
          <Typography key={key} variant="body2"><b>{key}:</b> {String(value)}</Typography>
        ))}
      </Box>
      
      <Box>
        <Typography variant="subtitle2">Location</Typography>
        {Object.entries(values.location || {}).map(([key, value]) => (
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
        <Typography variant="subtitle2">Users</Typography>
        <Typography variant="body2"><b>users:</b> {Array.isArray(values.users?.users) ? values.users.users.join(', ') : 'None selected'}</Typography>
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