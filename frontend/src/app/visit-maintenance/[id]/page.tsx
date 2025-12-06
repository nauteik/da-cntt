"use client";

import { Suspense, use } from "react";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingFallback from "@/components/common/LoadingFallback";
import VisitDetailClient from "./VisitDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VisitDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading visit details..." />}>
          <VisitDetailClient visitId={id} />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
