import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const PageTwo = lazy(() => import('src/pages/dashboard/two'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/four'));
const PageFive = lazy(() => import('src/pages/dashboard/five'));
const PageSix = lazy(() => import('src/pages/dashboard/six'));
const WorkorderRequestFormPage = lazy(() => import('src/pages/workorder/request-form'));
const WorkorderDetailPage = lazy(() => import('src/pages/workorder/[id]'));
const WorkorderEditPage = lazy(() => import('src/pages/workorder/[id]/edit'));
const WorkorderDetailedViewPage = lazy(() => import('src/pages/workorder/workorder-detailed-view'));
const VNIWorkorderRequestFormPage = lazy(() => import('src/pages/workorder_vni/request-form'));
const VNIWorkorderListViewPage = lazy(() => import('src/pages/workorder_vni/view/vni-workorder-list-view'));
const VNIWorkorderDetailsViewPage = lazy(() => import('src/pages/workorder_vni/view/vni-workorder-details-view'));
const VNIWorkorderEditViewPage = lazy(() => import('src/pages/workorder_vni/view/vni-workorder-edit-view'));
const VNIWorkorderDetailedViewPage = lazy(() => import('src/pages/workorder_vni/vni-workorder-detailed-view'));
// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: dashboardLayout(),
    children: [
      { element: <IndexPage />, index: true },
      { path: 'workorders_vm', element: <PageTwo /> },
      { path: 'vms', element: <PageThree /> },
      {
        path: 'deployments',
        children: [
          { element: <PageFour />, index: true },
          { path: 'ansible', element: <PageFive /> },
          { path: 'ci_cd', element: <PageSix /> },
        ],
      },
      { path: 'workorder/request', element: <WorkorderRequestFormPage /> },
      { path: 'workorder/:id', element: <WorkorderDetailPage /> },
      { path: 'workorder/:id/edit', element: <WorkorderEditPage /> },
      { path: 'workorder/detailed', element: <WorkorderDetailedViewPage /> },
      { path: 'workorder_vni', element: <VNIWorkorderListViewPage /> },
      { path: 'workorder_vni/request', element: <VNIWorkorderRequestFormPage /> },
      { path: 'workorder_vni/detailed', element: <VNIWorkorderDetailedViewPage /> },
      { path: 'workorder_vni/:id', element: <VNIWorkorderDetailsViewPage /> },
      { path: 'workorder_vni/:id/edit', element: <VNIWorkorderEditViewPage /> },
    ],
  },
];
