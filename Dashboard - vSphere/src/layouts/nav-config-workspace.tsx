import { CONFIG } from 'src/global-config';

import type { WorkspacesPopoverProps } from './components/workspaces-popover';

// ----------------------------------------------------------------------

export const _workspaces: WorkspacesPopoverProps['data'] = [
  {
    id: 'cloud-department',
    name: 'Cloud Department',
    plan: 'Pro',
    logo: `${CONFIG.assetsDir}/assets/icons/workspaces/cloud.png`,
  },
];
