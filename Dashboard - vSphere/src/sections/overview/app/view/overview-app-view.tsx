import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import { useEffect, useState } from 'react';
import {
  fetchDashboardOverview,
  fetchClusters,
  fetchHosts,
  fetchDatastores,
  fetchVMs,
} from 'src/lib/api';

import { svgColorClasses } from 'src/components/svg-color';

import { useMockedUser } from 'src/auth/hooks';

import { AppWidget } from '../app-widget';
import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppNewInvoice } from '../app-new-invoice';
import { AppTopAuthors } from '../app-top-authors';
import { AppTopRelated } from '../app-top-related';
import { AppAreaInstalled } from '../app-area-installed';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
import { AppTopInstalledCountries } from '../app-top-installed-countries';

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const { user } = useMockedUser();
  const theme = useTheme();

  // State for backend data
  const [overview, setOverview] = useState<any>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [hosts, setHosts] = useState<any[]>([]);
  const [datastores, setDatastores] = useState<any[]>([]);
  const [vms, setVMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardOverview(),
      fetchClusters(),
      fetchHosts(),
      fetchDatastores(),
      fetchVMs(),
    ])
      .then(([overviewData, clustersData, hostsData, datastoresData, vmsData]) => {
        setOverview(overviewData);
        setClusters(clustersData);
        setHosts(hostsData);
        setDatastores(datastoresData);
        setVMs(vmsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardContent maxWidth="xl">Loading...</DashboardContent>;
  if (error) return <DashboardContent maxWidth="xl">Error: {error}</DashboardContent>;
  if (!overview) return null;

  // --- Data Mapping for Widgets ---
  // Defensive: always provide arrays for chart props, even if backend fails
  const safeClusters =
    Array.isArray(clusters) && clusters.length > 0
      ? clusters
      : [{ name: 'N/A', num_hosts: 0, total_storage_gb: 0 }];
  const safeHosts =
    Array.isArray(hosts) && hosts.length > 0
      ? hosts
      : [{ name: 'N/A', cpu_used_mhz: 0, memory_used_gb: 0, memory_total_gb: 0 }];
  const safeDatastores =
    Array.isArray(datastores) && datastores.length > 0
      ? datastores
      : [{ name: 'N/A', used_space_gb: 0, accessible: false, type: 'N/A' }];
  const safeVMs =
    Array.isArray(vms) && vms.length > 0
      ? vms
      : [{ name: 'N/A', cpu_usage_mhz: 0, memory_gb: 0, uuid: 'N/A' }];

  // If overview or any critical data is missing, show a user-friendly error
  if (!overview || !overview.summary || !overview.resource_usage) {
    return (
      <DashboardContent maxWidth="xl">
        Backend data unavailable. Please check your vCenter/hosts and try again.
      </DashboardContent>
    );
  }

  const featuredList = safeClusters.slice(0, 3).map((c) => ({
    id: c.name,
    title: c.name,
    coverUrl: '/assets/images/about/about_1.webp',
    description: `Hosts: ${c.num_hosts}, VMs: ${c.num_vms}, Status: ${c.overall_status}`,
  }));

  const topRelatedList = safeVMs
    .sort((a, b) => (b.cpu_usage_mhz || 0) - (a.cpu_usage_mhz || 0))
    .slice(0, 5)
    .map((vm) => ({
      id: vm.uuid || vm.name,
      name: vm.name,
      size: vm.memory_gb || 0,
      price: 0,
      shortcut: '/assets/icons/platforms/ic_vmware.svg',
      downloaded: vm.cpu_usage_mhz || 0,
      ratingNumber: 1,
      totalReviews: 1,
    }));

  const topCountriesList = safeHosts.slice(0, 5).map((h, i) => ({
    id: h.name,
    apple: Math.round(h.memory_used_gb || 0),
    android: Math.round(h.cpu_used_mhz || 0),
    windows: Math.round(h.memory_total_gb || 0),
    countryCode: ['US', 'FR', 'DE', 'IN', 'CN'][i % 5],
    countryName: ['USA', 'France', 'Germany', 'India', 'China'][i % 5],
  }));

  const topAuthorsList = safeClusters
    .sort((a, b) => (b.num_vms || 0) - (a.num_vms || 0))
    .slice(0, 5)
    .map((c) => ({
      id: c.name,
      name: c.name,
      avatarUrl: '/assets/icons/platforms/ic_vmware.svg',
      totalFavorites: c.num_vms || 0,
    }));

  const invoiceList = safeDatastores.slice(0, 5).map((ds) => ({
    id: ds.name,
    price: Math.round(ds.used_space_gb || 0),
    status: ds.accessible ? 'active' : 'inactive',
    category: ds.type || 'N/A',
    invoiceNumber: ds.name,
  }));

  // For AppAreaInstalled, ApexCharts expects: [{ name, data: number[] }]
  const areaInstalledSeries = safeClusters.slice(0, 3).map((c) => ({
    name: c.name,
    data: Array(12).fill(Math.round(c.total_storage_gb || 0) / 12),
  }));

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <AppWelcome
            title={`vSphere Dashboard Overview`}
            description={`Welcome, ${user?.displayName || 'User'}! Here is your real-time vSphere infrastructure status.`}
            img={<SeoIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary">
                Refresh
              </Button>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AppFeatured list={featuredList} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total Clusters"
            percent={0}
            total={overview.summary?.total_clusters || 0}
            chart={{
              categories: safeClusters.slice(0, 8).map((c) => c.name || ''),
              series: safeClusters.slice(0, 8).map((c) => c.num_hosts || 0),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total Hosts"
            percent={0}
            total={overview.summary?.total_hosts || 0}
            chart={{
              colors: [theme.palette.info.main],
              categories: safeHosts.slice(0, 8).map((h) => h.name || ''),
              series: safeHosts.slice(0, 8).map((h) => h.cpu_used_mhz || 0),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total Datastores"
            percent={0}
            total={overview.summary?.total_datastores || 0}
            chart={{
              colors: [theme.palette.error.main],
              categories: safeDatastores.slice(0, 8).map((ds) => ds.name || ''),
              series: safeDatastores.slice(0, 8).map((ds) => ds.used_space_gb || 0),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppCurrentDownload
            title="Resource Usage Breakdown"
            subheader="CPU, Memory, Storage"
            chart={{
              series: [
                {
                  label: 'CPU Used (MHz)',
                  value: Math.round(overview.resource_usage?.used_cpu_mhz || 0),
                },
                {
                  label: 'Memory Used (GB)',
                  value: Math.round(overview.resource_usage?.used_memory_gb || 0),
                },
                {
                  label: 'Storage Used (GB)',
                  value: Math.round(overview.resource_usage?.used_storage_gb || 0),
                },
                {
                  label: 'Storage Free (GB)',
                  value: Math.round(overview.resource_usage?.free_storage_gb || 0),
                },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <AppNewInvoice
            title="Top Datastores"
            tableData={invoiceList}
            headCells={[
              { id: 'invoiceNumber', label: 'Datastore Name' },
              { id: 'category', label: 'Type' },
              { id: 'price', label: 'Used (GB)' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopRelated title="Top VMs by CPU Usage" list={topRelatedList} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopAuthors title="Top Clusters by VM Count" list={topAuthorsList} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <AppWidget
              title="Running VMs"
              total={overview.summary?.running_vms || 0}
              icon="solar:user-rounded-bold"
              chart={{ series: overview.summary?.running_vms || 0 }}
            />
            <AppWidget
              title="Stopped VMs"
              total={overview.summary?.stopped_vms || 0}
              icon="solar:letter-bold"
              chart={{
                series: overview.summary?.stopped_vms || 0,
                colors: [theme.vars.palette.info.light, theme.vars.palette.info.main],
              }}
              sx={{ bgcolor: 'info.dark', [`& .${svgColorClasses.root}`]: { color: 'info.light' } }}
            />
          </Box>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
