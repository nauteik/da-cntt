"use client";

import React from "react";
import { Tabs } from "antd";
import type { StaffHeaderDTO, StaffPersonalDTO } from "@/types/staff";
import { useStaffHeader, useStaffPersonal } from "@/hooks/useStaffDetail";
import StaffHeader from "@/components/employees/StaffHeader";
import StaffPersonal from "@/components/employees/StaffPersonal";
import StaffSchedule from "@/components/employees/StaffSchedule";
import StaffServiceDeliveries from "@/components/employees/StaffServiceDeliveries";
import TabLoading from "@/components/common/TabLoading";
import LoadingFallback from "@/components/common/LoadingFallback";
import InlineError from "@/components/common/InlineError";

interface StaffDetailClientProps {
  staffId: string;
  initialHeader: StaffHeaderDTO;
  initialPersonal?: StaffPersonalDTO;
}

export default function StaffDetailClient({
  staffId,
  initialHeader,
  initialPersonal,
}: StaffDetailClientProps) {
  // Use React Query with server-rendered initial data
  const {
    data: headerData,
    isLoading: headerLoading,
    error: headerError,
  } = useStaffHeader(staffId, {
    initialData: initialHeader,
  });

  const {
    data: personalData,
    isLoading: personalLoading,
    error: personalError,
  } = useStaffPersonal(staffId, {
    initialData: initialPersonal,
  });

  // Show error if header data fails to load
  if (headerError) {
    return (
      <InlineError
        title="Error Loading Staff"
        message={headerError.message || "Failed to load staff information"}
      />
    );
  }

  // Show loading state if header is still loading
  if (headerLoading || !headerData) {
    return <LoadingFallback message="Loading staff information..." />;
  }

  // Tab items configuration
  const tabItems = [
    {
      key: "personal",
      label: "Personal",
      children: personalData ? (
        <StaffPersonal staff={personalData} />
      ) : personalLoading ? (
        <TabLoading />
      ) : personalError ? (
        <InlineError
          title="Error Loading Personal Information"
          message={personalError.message || "Failed to load personal information"}
        />
      ) : (
        <div className="min-h-[600px] flex items-center justify-center p-12 text-center text-theme-secondary text-base">
          No personal information available
        </div>
      ),
    },
    {
      key: "schedules",
      label: "Schedules",
      children: <StaffSchedule staffId={staffId} />,
    },
    {
      key: "service-deliveries",
      label: "Service Deliveries",
      children: <StaffServiceDeliveries staffId={staffId} />,
    },
  ];

  return (
    <div className="w-full mx-auto p-0 min-h-[calc(100vh-64px)] flex flex-col">
      {/* Staff Header - Always visible across all tabs */}
      <StaffHeader staff={headerData} />

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
