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
const VNIWorkorderRequestFormPage = lazy(() => import('src/pages/workorder_vni/request-form'));
const VNIWorkorderListViewPage = lazy(() => import('src/pages/workorder_vni/view/vni-workorder-list-view'));
const VNIWorkorderDetailsViewPage = lazy(() => import('src/pages/workorder_vni/view/vni-workorder-details-view'));
const VNIWorkorderEditViewPage = lazy(() => import('src/pages/workorder_vni/view/vni-workorder-edit-view'));
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
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      { path: 'two', element: <PageTwo /> },
      { path: 'three', element: <PageThree /> },
      {
        path: 'group',
        children: [
          { element: <PageFour />, index: true },
          { path: 'five', element: <PageFive /> },
          { path: 'six', element: <PageSix /> },
        ],
      },
      { path: 'workorder/request', element: <WorkorderRequestFormPage /> },
      { path: 'workorder/:id', element: <WorkorderDetailPage /> },
      { path: 'workorder/:id/edit', element: <WorkorderEditPage /> },
      { path: 'workorder_vni', element: <VNIWorkorderListViewPage /> },
      { path: 'workorder_vni/request', element: <VNIWorkorderRequestFormPage /> },
      { path: 'workorder_vni/:id', element: <VNIWorkorderDetailsViewPage /> },
      { path: 'workorder_vni/:id/edit', element: <VNIWorkorderEditViewPage /> },
    ],
  },
];
