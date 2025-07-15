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
import { fNumber, fData } from 'src/utils/format-number';
import { FileStorageOverview } from 'src/sections/file/file-storage-overview';

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
      : [{ name: 'N/A', used_space_gb: 0, total_space_gb: 0, accessible: false, type: 'N/A' }];
  const safeVMs =
    Array.isArray(vms) && vms.length > 0
      ? vms
      : [{ name: 'N/A', cpu_usage_mhz: 0, memory_gb: 0, storage_gb: 0, uuid: 'N/A' }];

  // vCenter info for carousel (prefer connection_status if present)
  const vcenterInfo = overview.connection_status || overview.vcenter_info || overview.info || {};
  const vcenterSlide = {
    id: 'vcenter-info',
    title: vcenterInfo.product_name || 'vCenter Server',
    coverUrl: '/assets/images/about/about_2.webp',
    description: `Version: ${vcenterInfo.product_version || '-'} | API: ${vcenterInfo.api_version || '-'} | URL: ${vcenterInfo.vcenter_url || '-'}`,
  };

  // Cluster slides (show all clusters, not just first two)
  const featuredList = [
    vcenterSlide,
    ...safeClusters.map((c) => ({
      id: c.name,
      title: c.name,
      coverUrl: '/assets/images/about/about_1.webp',
      description: `Hosts: ${c.num_hosts}, VMs: ${c.num_vms}, Status: ${c.overall_status}`,
    })),
  ];

  // Top VMs by CPU, now with RAM, CPU, Storage, and a VM image
  const topRelatedList = safeVMs
    .sort((a, b) => (b.cpu_usage_mhz || 0) - (a.cpu_usage_mhz || 0))
    .slice(0, 5)
    .map((vm) => {
      const storageRaw = vm.storage_committed_gb || vm.storage_gb || vm.disk_gb || vm.allocated_storage_gb || vm.storage || 0;
      return {
        id: vm.uuid || vm.name,
        name: vm.name,
        ram: vm.memory_gb || 0,
        cpu: vm.cpu_usage_mhz || 0,
        storage: typeof storageRaw === 'number' ? Number(storageRaw.toFixed(2)) : storageRaw,
        picture: '/assets/icons/platforms/ic_vmware.png',
        shortcut: '/assets/icons/platforms/ic_vmware.png',
        // for type compatibility
        size: 0,
        price: 0,
        downloaded: 0,
        ratingNumber: 0,
        totalReviews: 0,
      };
    });

  // Top Datastores table, now with Total Space and no dollar sign
  const invoiceList = safeDatastores.slice(0, 5).map((ds) => ({
    id: ds.name,
    used: Math.round(ds.used_space_gb || 0),
    total: Math.round(ds.capacity_gb || (ds.used_space_gb || 0) + (ds.free_space_gb || 0)),
    status: ds.accessible ? 'active' : 'inactive',
    category: ds.type || 'N/A',
    invoiceNumber: ds.name,
    price: Math.round(ds.used_space_gb || 0), // for backward compatibility
  }));

  // Resource usage: show Free Storage and Used Storage, and display total below chart
  const ru = overview.resource_usage || {};
  const resourceSeries = [
    { label: 'Free Storage (GB)', value: Math.round(ru.free_storage_gb || 0) },
    { label: 'Used Storage (GB)', value: Math.round(ru.used_storage_gb || 0) },
  ];
  const totalStorage = Math.round((ru.free_storage_gb || 0) + (ru.used_storage_gb || 0));
  const resourceChartColors = [theme.palette.success.main, theme.palette.info.main];

  // If overview or any critical data is missing, show a user-friendly error
  if (!overview || !overview.summary || !overview.resource_usage) {
    return (
      <DashboardContent maxWidth="xl">
        Backend data unavailable. Please check your vCenter/hosts and try again.
      </DashboardContent>
    );
  }

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
        <Grid size={{ xs: 12, md: 3 }}>
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
        <Grid size={{ xs: 12, md: 3 }}>
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
        <Grid size={{ xs: 12, md: 3 }}>
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
        <Grid size={{ xs: 12, md: 3 }}>
          <AppWidgetSummary
            title="Total VMs"
            percent={0}
            total={overview.summary?.total_vms || safeVMs.length}
            chart={{
              colors: [theme.palette.success.main],
              categories: safeVMs.slice(0, 8).map((vm) => vm.name || ''),
              series: safeVMs.slice(0, 8).map((vm) => vm.cpu_usage_mhz || 0),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppCurrentDownload
            title="Storage Breakdown"
            subheader="Free vs Used Storage"
            chart={{
              series: resourceSeries.map((item) => ({ label: item.label, value: item.value })),
              // colors: resourceChartColors, // REMOVE this line to use theme defaults
            }}
          />
          <Box sx={{ textAlign: 'center', mt: 1, color: 'text.secondary', fontWeight: 500 }}>
            Total Storage: {totalStorage} GB
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <AppNewInvoice
            title="Top Datastores"
            tableData={invoiceList}
            headCells={[
              { id: 'invoiceNumber', label: 'Datastore Name' },
              { id: 'category', label: 'Type' },
              { id: 'used', label: 'Used (GB)' },
              { id: 'total', label: 'Total (GB)' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12, lg: 8 }}>
          <AppTopRelated title="Top VMs by CPU Usage" list={topRelatedList} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{ height: 420, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {(() => {
            // Use resource_usage for RAM values
            const ru = overview.resource_usage || {};
            const totalRamAvailable = typeof ru.total_memory_gb === 'number' && ru.total_memory_gb > 0
              ? ru.total_memory_gb
              : 0;
            const totalRamUsed = typeof ru.used_memory_gb === 'number' && ru.used_memory_gb > 0
              ? ru.used_memory_gb
              : 0;
            let percentUsed = totalRamAvailable > 0 ? (totalRamUsed / totalRamAvailable) * 100 : 0;
            if (!isFinite(percentUsed) || percentUsed < 0) percentUsed = 0;
            if (percentUsed > 100) percentUsed = 100;
            percentUsed = Math.round(percentUsed);
            // Sort VMs by RAM usage, descending, and take top 4 (no padding)
            const topVMs = safeVMs
              .slice()
              .sort((a, b) => (b.memory_gb || 0) - (a.memory_gb || 0))
              .slice(0, 4);
            return (
              <FileStorageOverview
                total={Number(totalRamAvailable.toFixed(2))}
                used={Number(totalRamUsed.toFixed(2))}
                chart={{ series: percentUsed }}
                data={topVMs.map((vm) => {
                  const ramGB = typeof vm.memory_gb === 'number' && vm.memory_gb > 0 ? Number(vm.memory_gb.toFixed(2)) : 0;
                  let ip = '-';
                  if (typeof vm.ip_addresses === 'string') ip = vm.ip_addresses;
                  else if (Array.isArray(vm.ip_addresses) && vm.ip_addresses.length > 0) ip = vm.ip_addresses[0];
                  return {
                    name: vm.name || '-',
                    usedStorage: ramGB,
                    filesCount: '', // not used
                    icon: (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box component="img" src="/assets/icons/platforms/datacenter.png" sx={{ width: 32, height: 32, mb: 0.5 }} />
                      </Box>
                    ),
                    ip,
                  };
                })}
              />
            );
          })()}
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
