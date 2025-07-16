import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { Form } from 'src/components/hook-form';

import { Stepper, StepOne, StepTwo, StepThree, StepReview, StepCompleted } from './form-steps';

// ----------------------------------------------------------------------

const STEPS = [
  'General Info',
  'Resources',
  'Network',
  'Review',
];

const GeneralSchema = zod.object({
  name: zod.string().min(1, { message: 'VM Name is required!' }),
  description: zod.string().optional(),
  cluster: zod.string().min(1, { message: 'Cluster is required!' }),
  datastore: zod.string().min(1, { message: 'Datastore is required!' }),
});

const ResourcesSchema = zod.object({
  os: zod.string().min(1, { message: 'OS is required!' }),
  cpu: zod.number({ coerce: true }).int().min(1, { message: 'CPU is required!' }),
  ram: zod.number({ coerce: true }).int().min(1, { message: 'RAM is required!' }),
  disk: zod.number({ coerce: true }).int().min(1, { message: 'Disk is required!' }),
});

const NetworkSchema = zod.object({
  ip: zod.string().min(1, { message: 'IP Address is required!' }),
  network: zod.string().min(1, { message: 'Network Name is required!' }),
});

const WizardSchema = zod.object({
  general: GeneralSchema,
  resources: ResourcesSchema,
  network: NetworkSchema,
});

type WizardSchemaType = zod.infer<typeof WizardSchema>;

// ----------------------------------------------------------------------

const defaultValues: WizardSchemaType = {
  general: {
    name: '',
    description: '',
    cluster: '',
    datastore: '',
  },
  resources: {
    os: '',
    cpu: 1,
    ram: 1,
    disk: 1,
  },
  network: {
    ip: '',
    network: '',
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
    async (step?: 'general' | 'resources' | 'network') => {
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // TODO: send data to backend
      console.info('DATA', data);
      handleNext();
    } catch (error) {
      console.error(error);
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
          {activeStep === 3 && <StepReview values={getValues()} />}
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
              <Button type="button" variant="contained" onClick={() => handleNext('resources')}>
                Next
              </Button>
            )}

            {activeStep === 2 && (
              <Button type="button" variant="contained" onClick={() => handleNext('network')}>
                Next
              </Button>
            )}

            {activeStep === STEPS.length - 1 && (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Create VM
              </Button>
            )}
          </Box>
        )}
      </Form>
    </Card>
  );
} 