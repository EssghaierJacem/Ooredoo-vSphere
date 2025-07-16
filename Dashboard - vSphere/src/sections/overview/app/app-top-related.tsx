import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import { useTabs } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { svgIconClasses } from '@mui/material/SvgIcon';

import { fData, fCurrency, fShortenNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

// ----------------------------------------------------------------------

const TABS = [
  { value: '7days', label: 'Top 7 days' },
  { value: '30days', label: 'Top 30 days' },
  { value: 'all', label: 'All times' },
];

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    name: string;
    ram: number;
    cpu: number;
    storage: number;
    shortcut: string;
    picture?: string; // Add this line to fix TS2339
  }[];
};

export function AppTopRelated({ title, subheader, list, sx, ...other }: Props) {
  const tabs = useTabs('7days');

  const renderTabs = () => (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      slotProps={{ tab: { sx: { px: 0 } } }}
    >
      {TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      {renderTabs()}

      <Scrollbar sx={{ minHeight: 384 }}>
        <Box
          sx={{
            p: 3,
            gap: 3,
            minWidth: 360,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {list.map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </Box>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ItemProps = BoxProps & {
  item: Props['list'][number];
};

function Item({ item, sx, ...other }: ItemProps) {
  return (
    <Box
      sx={[{ gap: 2, display: 'flex', alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Avatar
        variant="rounded"
        src={item.picture || item.shortcut}
        sx={{
          p: 1,
          width: 48,
          height: 48,
          bgcolor: 'background.neutral',
        }}
      />
      <div>
        <Box
          sx={{
            mb: 1,
            gap: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {item.name}
          </Typography>
        </Box>
        <Stack
          divider={
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'text.disabled',
              }}
            />
          }
          sx={{
            gap: 1,
            flexDirection: 'row',
            alignItems: 'center',
            typography: 'caption',
          }}
        >
          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify width={16} icon="solar:copy-bold" sx={{ color: 'text.disabled' }} />
            CPU: {item.cpu} MHz
          </Box>
          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify width={16} icon="solar:flag-bold" sx={{ color: 'text.disabled' }} />
            RAM: {item.ram} GB
          </Box>
          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify width={16} icon="solar:ssd-round-bold" sx={{ color: 'text.disabled' }} />
            Storage: {item.storage} GB
          </Box>
        </Stack>
      </div>
    </Box>
  );
}
