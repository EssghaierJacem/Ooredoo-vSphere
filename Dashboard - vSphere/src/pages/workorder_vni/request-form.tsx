import Container from '@mui/material/Container';

import { CONFIG } from 'src/global-config';
import { FormWizard } from 'src/pages/workorder_vni/form-wizard';

// ----------------------------------------------------------------------

const metadata = { title: `VNI Work Order Request - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <FormWizard />
      </Container>
    </>
  );
} 