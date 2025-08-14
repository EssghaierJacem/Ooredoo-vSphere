import type { IVNIWorkOrderTableFilters } from 'src/types/vni-workorder';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IVNIWorkOrderTableFilters;
  onFilters: (name: string, value: string | string[] | null) => void;
  //
  canReset: boolean;
  onResetFilters: VoidFunction;
  //
  results: number;
};

export function VNIWorkOrderTableFiltersResult({
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
  //
  results,
  ...other
}: Props) {
  const handleRemoveKeyword = () => {
    onFilters('owner', '');
  };

  const handleRemoveStatus = () => {
    onFilters('status', 'all');
  };

  const handleRemoveProject = (inputValue: string) => {
    const newValue = filters.project.filter((item) => item !== inputValue);
    onFilters('project', newValue);
  };

  const hasFilter = !!(
    filters.owner ||
    filters.status !== 'all' ||
    filters.project.length ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      {hasFilter && (
        <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
          {!!filters.owner && (
            <Block label="Owner:">
              <Chip size="small" label={filters.owner} onDelete={handleRemoveKeyword} />
            </Block>
          )}

          {filters.status !== 'all' && (
            <Block label="Status:">
              <Chip size="small" label={filters.status} onDelete={handleRemoveStatus} />
            </Block>
          )}

          {!!filters.project.length && (
            <Block label="Project:">
              {filters.project.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  size="small"
                  onDelete={() => handleRemoveProject(item)}
                />
              ))}
            </Block>
          )}

          {filters.startDate && filters.endDate && (
            <Block label="Date:">
              <Chip
                size="small"
                label={`${fDate(filters.startDate)} - ${fDate(filters.endDate)}`}
              />
            </Block>
          )}

          {canReset && (
            <Button
              color="error"
              onClick={onResetFilters}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              sx={{ typography: 'caption' }}
            >
              Clear
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = {
  label: string;
  children: React.ReactNode;
};

function Block({ label, children }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
      }}
    >
      <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
        {label}
      </Box>

      <Stack spacing={0.5} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
} 