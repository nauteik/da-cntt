"use client";

import React from "react";
import { Tabs } from "antd";
import type { PatientHeaderDTO, PatientPersonalDTO, PatientProgramDTO } from "@/types/patient";
import { usePatientHeader, usePatientPersonal, usePatientProgram } from "@/hooks/usePatientDetail";
import PatientHeader from "@/components/patients/PatientHeader";
import PatientPersonal from "@/components/patients/PatientPersonal";
import PatientProgram from "@/components/patients/PatientProgram";
import PatientMedication from "@/components/patients/PatientMedication";
import PatientSchedule from "@/components/patients/PatientSchedule";
import PatientNotesHistory from "@/components/patients/PatientNotesHistory";
import TabLoading from "@/components/common/TabLoading";
import LoadingFallback from "@/components/common/LoadingFallback";
import InlineError from "@/components/common/InlineError";

interface PatientDetailClientProps {
  patientId: string;
  initialHeader: PatientHeaderDTO;
  initialPersonal: PatientPersonalDTO;
  initialProgram?: PatientProgramDTO; // Optional - may not be available yet
}

export default function PatientDetailClient({
  patientId,
  initialHeader,
  initialPersonal,
  initialProgram,
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

  const {
    data: programData,
    isLoading: programLoading,
    error: programError,
  } = usePatientProgram(patientId, {
    initialData: initialProgram,
  });

  // Show error if header data fails to load
  if (headerError) {
    return (
      <InlineError
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
        <TabLoading />
      ) : personalError ? (
        <div className="p-6 min-h-[600px] flex items-center justify-center">
          <InlineError
            title="Error Loading Personal Information"
            message={
              personalError.message || "Failed to load personal information"
            }
          />
        </div>
      ) : (
        <PatientPersonal patient={personalData!} />
      ),
    },
    {
      key: "program",
      label: "Program",
      children: programLoading ? (
        <TabLoading />
      ) : programError ? (
        <div className="p-6 min-h-[600px] flex items-center justify-center">
          <InlineError
            title="Error Loading Program Information"
            message={
              programError.message || "Failed to load program information"
            }
          />
        </div>
      ) : (
        <PatientProgram patient={programData!} patientId={patientId} />
      ),
    },
    {
      key: "medication",
      label: "Medication",
      children: (
        <PatientMedication patientId={patientId} patient={headerData} />
      ),
    },
    {
      key: "schedule",
      label: "Schedule",
      children: <PatientSchedule patientId={patientId} />,
    },
    {
      key: "notes",
      label: "Notes & History",
      children: <PatientNotesHistory patientId={patientId} />,
    },
  ];

  return (
    <div className="w-full mx-auto p-0 min-h-[calc(100vh-64px)] flex flex-col">
      {/* Patient Header - Always visible across all tabs */}
      <PatientHeader patient={headerData} />

      {/* Tabs for different sections */}
      <div className="bg-[var(--bg-surface)] p-6 flex-1 flex flex-col">
        <Tabs
          defaultActiveKey="personal"
          items={tabItems}
          className="w-full flex-1 flex flex-col"
        />
      </div>

      {/* Custom Ant Design Tabs Styling */}
      <style jsx global>{`
        .ant-tabs {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .ant-tabs-nav {
          margin-bottom: 24px;
        }

        .ant-tabs-content-holder {
          flex: 1;
          overflow-y: visible;
        }

        .ant-tabs-content {
          height: 100%;
        }

        .ant-tabs-tabpane {
          height: auto;
          min-height: auto;
        }

        .ant-tabs-tab {
          font-weight: 500;
          padding: 12px 16px;
        }

        .ant-tabs-tab-active {
          color: var(--accent);
        }

        .ant-tabs-ink-bar {
          background: var(--accent);
        }
      `}</style>
    </div>
  );
}
