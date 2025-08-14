import { useState, useEffect } from 'react';
import { useParams } from 'src/routes/hooks/use-params';

import type { IVNIWorkOrder } from 'src/types/vni-workorder';

import { paths } from 'src/routes/paths';
import { fetchVNIWorkOrderById } from 'src/lib/api';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

import { VNIWorkOrderNewEditForm } from '../vni-workorder-new-edit-form';

// ----------------------------------------------------------------------

function VNIWorkOrderEditView() {
  const { id } = useParams();
  const [vniWorkOrder, setVNIWorkOrder] = useState<IVNIWorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const data = await fetchVNIWorkOrderById(parseInt(id));
          setVNIWorkOrder(data);
        }
      } catch (error) {
        console.error('Error fetching VNI workorder:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!vniWorkOrder) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="VNI Work Order Not Found"
          backHref={paths.dashboard.workorder_vni.list}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'VNI Work Orders', href: paths.dashboard.workorder_vni.list },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <div>VNI Work Order not found</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit VNI Work Order"
        backHref={paths.dashboard.workorder_vni.list}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'VNI Work Orders', href: paths.dashboard.workorder_vni.list },
          { name: vniWorkOrder.vni_name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VNIWorkOrderNewEditForm currentVNIWorkOrder={vniWorkOrder} />
    </DashboardContent>
  );
}

export default VNIWorkOrderEditView; 