"use client";

import React from "react";
import { Tabs } from "antd";
import type { PatientHeaderDTO, PatientPersonalDTO } from "@/types/patient";
import { usePatientHeader, usePatientPersonal } from "@/hooks/usePatientDetail";
import PatientHeader from "@/components/patients/PatientHeader";
import PatientPersonal from "@/components/patients/PatientPersonal";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";
import styles from "./patient-detail.module.css";

interface PatientDetailClientProps {
  patientId: string;
  initialHeader: PatientHeaderDTO;
  initialPersonal: PatientPersonalDTO;
}

export default function PatientDetailClient({
  patientId,
  initialHeader,
  initialPersonal,
}: PatientDetailClientProps) {
  // Use React Query with server-rendered initial data
  const {
    data: headerData,
    isLoading: headerLoading,
    error: headerError,
  } = usePatientHeader(patientId, {
    initialData: initialHeader,
  });

  const {
    data: personalData,
    isLoading: personalLoading,
    error: personalError,
  } = usePatientPersonal(patientId, {
    initialData: initialPersonal,
  });

  // Show error if header data fails to load
  if (headerError) {
    return (
      <ErrorFallback
        title="Error Loading Patient"
        message={headerError.message || "Failed to load patient information"}
      />
    );
  }

  // Show loading state if header is still loading
  if (headerLoading || !headerData) {
    return <LoadingFallback message="Loading patient information..." />;
  }

  // Tab items configuration
  const tabItems = [
    {
      key: "personal",
      label: "Personal",
      children: personalLoading ? (
        <LoadingFallback message="Loading personal information..." />
      ) : personalError ? (
        <ErrorFallback
          title="Error Loading Personal Information"
          message={
            personalError.message || "Failed to load personal information"
          }
        />
      ) : (
        <PatientPersonal patient={personalData!} />
      ),
    },
    {
      key: "program",
      label: "Program",
      children: <div className={styles.tabPlaceholder}>Coming soon...</div>,
    },
    {
      key: "schedule",
      label: "Schedule",
      children: <div className={styles.tabPlaceholder}>Coming soon...</div>,
    },
    {
      key: "notes",
      label: "Notes & History",
      children: <div className={styles.tabPlaceholder}>Coming soon...</div>,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Patient Header - Always visible across all tabs */}
      <PatientHeader patient={headerData} />

      {/* Tabs for different sections */}
      <div className={styles.tabsContainer}>
        <Tabs
          defaultActiveKey="personal"
          items={tabItems}
          className={styles.tabs}
        />
      </div>
    </div>
  );
}
