import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { Form } from 'src/components/hook-form';

import { Stepper, StepOne, StepTwo, StepReview, StepCompleted } from 'src/pages/workorder_vni/form-steps';
import { postVNIWorkOrder } from 'src/lib/api';

// ----------------------------------------------------------------------

const STEPS = [
  'General Info',
  'VNI Configuration',
  'Review',
];

const GeneralSchema = zod.object({
  owner: zod.string().min(1, { message: 'Owner is required!' }),
  requested_by: zod.string().min(1, { message: 'Requested By is required!' }),
  project: zod.string().min(1, { message: 'Project is required!' }),
  description: zod.string().min(1, { message: 'Description is required!' }),
  priority: zod.string().min(1, { message: 'Priority is required!' }),
  deadline: zod.string().optional(),
});

const VNIConfigSchema = zod.object({
  t0_gw: zod.string().min(1, { message: 'T0 Gateway is required!' }),
  t1_gw: zod.string().min(1, { message: 'T1 Gateway is required!' }),
  vni_name: zod.string().min(1, { message: 'VNI Name is required!' }),
  cidr: zod.string().min(1, { message: 'CIDR is required!' }),
  subnet_mask: zod.string().min(1, { message: 'Subnet Mask is required!' }),
  gateway: zod.string().min(1, { message: 'Gateway is required!' }),
  first_ip: zod.string().min(1, { message: 'First IP is required!' }),
  last_ip: zod.string().min(1, { message: 'Last IP is required!' }),
  number_of_ips: zod.number({ coerce: true }).int().min(1, { message: 'Number of IPs is required!' }),
});

const WizardSchema = zod.object({
  general: GeneralSchema,
  vni_config: VNIConfigSchema,
});

type WizardSchemaType = zod.infer<typeof WizardSchema>;

// ----------------------------------------------------------------------

const defaultValues: WizardSchemaType = {
  general: {
    owner: '',
    requested_by: '',
    project: '',
    description: '',
    priority: 'normal',
    deadline: new Date().toISOString(),
  },
  vni_config: {
    t0_gw: '',
    t1_gw: '',
    vni_name: '',
    cidr: '',
    subnet_mask: '',
    gateway: '',
    first_ip: '',
    last_ip: '',
    number_of_ips: 1,
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
    async (step?: 'general' | 'vni_config') => {
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
      const vniWorkOrderData = {
        owner: data.general.owner,
        requested_date: new Date().toISOString(), 
        requested_by: data.general.requested_by,
        virtual_machines: [],
        deadline: data.general.deadline || new Date().toISOString(),
        project: data.general.project,
        t0_gw: data.vni_config.t0_gw,
        t1_gw: data.vni_config.t1_gw,
        description: data.general.description,
        vni_name: data.vni_config.vni_name,
        cidr: data.vni_config.cidr,
        subnet_mask: data.vni_config.subnet_mask,
        gateway: data.vni_config.gateway,
        first_ip: data.vni_config.first_ip,
        last_ip: data.vni_config.last_ip,
        number_of_ips: data.vni_config.number_of_ips,
        status: 'pending', 
        priority: data.general.priority,
        assigned_to: null,
      };

      console.log("Submitting VNI work order:", vniWorkOrderData);
      await postVNIWorkOrder(vniWorkOrderData);
      handleNext();
    } catch (error) {
      console.error('Error submitting VNI work order:', error);
      let errorMsg = '';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = (error as { message: string }).message;
      } else {
        errorMsg = String(error);
      }
      alert('Failed to submit VNI work order: ' + errorMsg);
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
          {activeStep === 2 && <StepReview values={getValues()} />}
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
              <Button 
                type="button" 
                variant="contained" 
                onClick={() => handleNext('vni_config')}
                disabled={isSubmitting}
              >
                Next
              </Button>
            )}

            {activeStep === STEPS.length - 1 && (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Create VNI Work Order
              </Button>
            )}
          </Box>
        )}
      </Form>
    </Card>
  );
} 