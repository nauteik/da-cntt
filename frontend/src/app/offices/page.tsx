import { Suspense } from "react";
import LoadingFallback from "@/components/common/LoadingFallback";
import OfficesClient from "./OfficesClient";

export const metadata = {
  title: "Office Management - BAC HMS",
  description: "Manage office locations and view their staff and patients",
};

export default function OfficesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OfficesClient />
    </Suspense>
  );
}
