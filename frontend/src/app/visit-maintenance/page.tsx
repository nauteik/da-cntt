import { Metadata } from 'next';
import { Suspense } from 'react';
import VisitMaintenanceClient from './VisitMaintenanceClient';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingFallback from '@/components/common/LoadingFallback';

export const metadata: Metadata = {
  title: 'Visit Maintenance | Blue Angels Care',
  description: 'Monitor and verify employee visit records',
};

export default function VisitMaintenancePage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading visits..." />}>
          <VisitMaintenanceClient />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
