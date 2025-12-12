import { Suspense } from 'react';
import { headers } from 'next/headers';
import ReportPreviewClient from './ReportPreviewClient';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingFallback from '@/components/common/LoadingFallback';

export default async function ReportPreviewPage() {
  // Force dynamic rendering to access request headers (cookies)
  await headers();

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading report..." />}>
          <ReportPreviewClient />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}

