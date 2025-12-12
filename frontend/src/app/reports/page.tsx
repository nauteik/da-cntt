import { Metadata } from 'next';
import { Suspense } from 'react';
import ReportsClient from './ReportsClient';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingFallback from '@/components/common/LoadingFallback';

export const metadata: Metadata = {
  title: 'Reports | Blue Angels Care',
  description: 'View and manage reports',
};

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading reports..." />}>
          <ReportsClient />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}

