"use client";

import React from "react";
import { Tabs } from "antd";
import type { HouseDTO, PatientHouseStayDTO } from "@/types/house";
import { useHouseDetail, useHouseStays } from "@/hooks/useHouseDetail";
import HouseHeader from "@/components/housing/HouseHeader";
import HouseInformation from "@/components/housing/HouseInformation";
import HouseStayHistory from "@/components/housing/HouseStayHistory";
import LoadingFallback from "@/components/common/LoadingFallback";
import InlineError from "@/components/common/InlineError";

interface HouseDetailClientProps {
  houseId: string;
  initialHouse: HouseDTO;
  initialStays?: PatientHouseStayDTO[];
}

export default function HouseDetailClient({
  houseId,
  initialHouse,
  initialStays,
}: HouseDetailClientProps) {
  // Use React Query with server-rendered initial data
  const {
    data: houseData,
    isLoading: houseLoading,
    error: houseError,
  } = useHouseDetail(houseId, {
    initialData: initialHouse,
  });

  const {
    data: staysData,
  } = useHouseStays(houseId, {
    initialData: initialStays,
  });

  // Show error if house data fails to load
  if (houseError) {
    return (
      <InlineError
        title="Error Loading House"
        message={houseError.message || "Failed to load house information"}
      />
    );
  }

  // Show loading state if house is still loading
  if (houseLoading || !houseData) {
    return <LoadingFallback message="Loading house information..." />;
  }

  // Tab items configuration
  const tabItems = [
    {
      key: "information",
      label: "Information",
      children: <HouseInformation house={houseData} />,
    },
    {
      key: "stay-history",
      label: "Stay History",
      children: (
        <HouseStayHistory houseId={houseId} initialStays={staysData} />
      ),
    },
  ];

  return (
    <div className="w-full mx-auto p-0 min-h-[calc(100vh-64px)] flex flex-col">
      {/* House Header - Always visible across all tabs */}
      <HouseHeader house={houseData} />

      {/* Tabs for different sections */}
      <div className="bg-[var(--bg-surface)] p-6 flex-1 flex flex-col">
        <Tabs
          defaultActiveKey="information"
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

