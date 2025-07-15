import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { fData } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  total: number;
  used: number;
  data: {
    name: string;
    usedStorage: number;
    filesCount: string;
    icon: React.ReactNode;
    ip?: string;
  }[];
  chart: {
    colors?: string[];
    series: number;
    options?: ChartOptions;
  };
};

export function FileStorageOverview({ data, total, used, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.secondary.main, theme.palette.secondary.light];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: chartColors[0], opacity: 1 },
          { offset: 100, color: chartColors[1], opacity: 1 },
        ],
      },
    },
    plotOptions: {
      radialBar: {
        offsetY: 40,
        startAngle: -90,
        endAngle: 90,
        hollow: { margin: -24 },
        track: { margin: -24 },
        dataLabels: {
          name: { offsetY: 8 },
          value: { offsetY: -36 },
          total: {
            label: `Used: ${Number(used).toFixed(2)} GB / ${Number(total).toFixed(2)} GB`,
            color: theme.vars.palette.text.disabled,
            fontSize: theme.typography.caption.fontSize as string,
            fontWeight: theme.typography.caption.fontWeight,
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <Chart
        type="radialBar"
        series={[chart.series]}
        options={chartOptions}
        slotProps={{ loading: { p: 3 } }}
        sx={{ mx: 'auto', width: 240, height: 240 }}
      />

      <Stack
        spacing={3}
        sx={{
          px: 3,
          pb: 5,
          mt: -4,
          zIndex: 1,
          position: 'relative',
          bgcolor: 'background.paper',
        }}
      >
        {data.map((category) => (
          <Box
            key={category.name}
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              typography: 'subtitle2',
            }}
          >
            <Box sx={{ width: 36, height: 36 }}>{category.icon}</Box>

            <Stack flex="1 1 auto">
              <div>{category.name}</div>
              {category.ip && (
                <Box
                  component="span"
                  sx={{ typography: 'caption', color: 'text.disabled' }}
                >{category.ip}</Box>
              )}
            </Stack>

            <Box component="span">
              {Number.isInteger(category.usedStorage)
                ? `${category.usedStorage} GB`
                : `${category.usedStorage.toFixed(2)} GB`}
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
