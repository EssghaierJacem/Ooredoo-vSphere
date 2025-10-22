import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { Form } from 'src/components/hook-form';

import { Stepper, StepOne, StepTwo, StepThree, StepFour, StepFive, StepReview, StepCompleted } from './form-steps';
import { postWorkOrder } from 'src/lib/api';

// ----------------------------------------------------------------------

const STEPS = [
  'General Info',
  'Network Configuration',
  'Location',
  'Resources',
  'Users',
  'Review',
];

const GeneralSchema = zod.object({
  name: zod.string().min(1, { message: 'VM Name is required!' }),
  os: zod.string().min(1, { message: 'OS Type is required!' }),
});

const NetworkConfigSchema = zod.object({
  ip: zod.string().min(1, { message: 'IP is required!' }),
  gateway: zod.string().min(1, { message: 'Gateway is required!' }),
  netmask: zod.string().min(1, { message: 'NetMask is required!' }),
  uls: zod.string().min(1, { message: 'ULS is required!' }),
});

const LocationSchema = zod.object({
  site: zod.string().min(1, { message: 'Site is required!' }),
  cluster: zod.string().min(1, { message: 'Cluster is required!' }),
  datastore: zod.string().min(1, { message: 'DataStore is required!' }),
});

const ResourcesSchema = zod.object({
  cpu: zod.number({ coerce: true }).int().min(1, { message: 'CPU is required!' }),
  ram: zod.number({ coerce: true }).int().min(1, { message: 'RAM is required!' }),
  disk: zod.number({ coerce: true }).min(1, { message: 'Disk is required!' }),
});

const UsersSchema = zod.object({
  users: zod.array(zod.string()).min(1, { message: 'At least one user is required!' }),
});

const WizardSchema = zod.object({
  general: GeneralSchema,
  network_config: NetworkConfigSchema,
  location: LocationSchema,
  resources: ResourcesSchema,
  users: UsersSchema,
});

type WizardSchemaType = zod.infer<typeof WizardSchema>;

// ----------------------------------------------------------------------

const defaultValues: WizardSchemaType = {
  general: {
    name: '',
    os: '',
  },
  network_config: {
    ip: '',
    gateway: '',
    netmask: '',
    uls: '',
  },
  location: {
    site: 'OT-CHARGUIA',
    cluster: 'ITaaS Workload',
    datastore: '',
  },
  resources: {
    cpu: 1,
    ram: 1,
    disk: 1,
  },
  users: {
    users: [],
  },
};

export function FormWizard() {
  const [activeStep, setActiveStep] = useState(0);

  const methods = useForm<WizardSchemaType>({
    mode: 'onChange',
    resolver: zodResolver(WizardSchema),
    defaultValues,
  });

  const {
    reset,
    trigger,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = methods;

  const handleNext = useCallback(
    async (step?: 'general' | 'network_config' | 'location' | 'resources' | 'users') => {
      if (step) {
        const isValid = await trigger(step);
        if (isValid) {
          clearErrors();
          setActiveStep((currentStep) => currentStep + 1);
        }
      } else {
        setActiveStep((currentStep) => currentStep + 1);
      }
    },
    [trigger, clearErrors]
  );

  const handleBack = useCallback(() => {
    setActiveStep((currentStep) => currentStep - 1);
  }, []);

  const handleReset = useCallback(() => {
    reset();
    setActiveStep(0);
  }, [reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const workOrderPayload = {
        general: data.general,
        network_config: data.network_config,
        location: data.location,
        resources: data.resources,
        users: data.users,
        requested_at: new Date().toISOString(),
      };

      console.log("Submitting work order:", workOrderPayload); // Debug log

      await postWorkOrder(workOrderPayload);
      handleNext();
    } catch (error) {
      console.error('Failed to submit work order:', error);
      let errorMsg = '';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = (error as { message: string }).message;
      } else {
        errorMsg = String(error);
      }
      alert('Failed to submit work order: ' + errorMsg); // User feedback
    }
  });

  const completedStep = activeStep === STEPS.length;

  return (
    <Card
      sx={{
        p: 5,
        width: 1,
        mx: 'auto',
        maxWidth: 720,
      }}
    >
      <Stepper steps={STEPS} activeStep={activeStep} />

      <Form methods={methods} onSubmit={onSubmit}>
        <Box
          sx={[
            (theme) => ({
              p: 3,
              mb: 3,
              gap: 3,
              minHeight: 240,
              display: 'flex',
              borderRadius: 1.5,
              flexDirection: 'column',
              border: `dashed 1px ${theme.vars.palette.divider}`,
            }),
          ]}
        >
          {activeStep === 0 && <StepOne />}
          {activeStep === 1 && <StepTwo />}
          {activeStep === 2 && <StepThree />}
          {activeStep === 3 && <StepFour />}
          {activeStep === 4 && <StepFive />}
          {activeStep === 5 && <StepReview values={getValues()} />}
          {completedStep && <StepCompleted onReset={handleReset} />}
        </Box>

        {!completedStep && (
          <Box sx={{ display: 'flex' }}>
            {activeStep !== 0 && <Button onClick={handleBack}>Back</Button>}

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === 0 && (
              <Button type="button" variant="contained" onClick={() => handleNext('general')}>
                Next
              </Button>
            )}

            {activeStep === 1 && (
              <Button type="button" variant="contained" onClick={() => handleNext('network_config')}>
                Next
              </Button>
            )}

            {activeStep === 2 && (
              <Button type="button" variant="contained" onClick={() => handleNext('location')}>
                Next
              </Button>
            )}

            {activeStep === 3 && (
              <Button type="button" variant="contained" onClick={() => handleNext('resources')}>
                Next
              </Button>
            )}

            {activeStep === 4 && (
              <Button type="button" variant="contained" onClick={() => handleNext('users')}>
                Next
              </Button>
            )}


            {activeStep === STEPS.length - 1 && (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Create Work Order
              </Button>
            )}
          </Box>
        )}
      </Form>
    </Card>
  );
} 