import { Suspense } from "react";
import LoadingFallback from "@/components/common/LoadingFallback";
import OfficeDetailClient from "./OfficeDetailClient";

export const metadata = {
  title: "Office Details - BAC HMS",
  description: "View office details, staff, and patients",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <OfficeDetailClient officeId={id} />
    </Suspense>
  );
}
