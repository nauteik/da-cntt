"use client";

import React from "react";
import { Skeleton } from "antd";
import AdminLayout from "@/components/AdminLayout";
import TabLoading from "@/components/common/TabLoading";

export default function PatientDetailLoading() {
  return (
    <AdminLayout>
      <div className="w-full mx-auto p-0 min-h-[calc(100vh-64px)] flex flex-col">
        {/* Patient Header Skeleton */}
        <div className="bg-[var(--bg-surface)] rounded-none pt-2.5 px-4 mb-0">
          {/* Row 1: Back button, Name/Status, Program dropdown */}
          <div className="flex items-center gap-4 mb-3">
            {/* BACK button */}
            <Skeleton.Button
              active
              size="small"
              style={{ width: 80, height: 22 }}
            />

            {/* Name */}
            <Skeleton.Input active style={{ width: 200, height: 28 }} />

            {/* Program | Status dropdown */}
            <Skeleton.Button active style={{ width: 200, height: 32 }} />
          </div>

          {/* Row 2: Client info line */}
          <div className="flex items-center gap-3 pb-3">
            <Skeleton.Input
              active
              size="small"
              style={{ width: "80%", height: 16 }}
            />
          </div>
        </div>

        {/* Tabs and Content Skeleton */}
        <div className="bg-[var(--bg-surface)] p-6 flex-1 flex flex-col">
          {/* Tab buttons */}
          <div className="flex items-center gap-8 mb-6 border-b border-theme pb-0">
            <Skeleton.Button
              active
              size="small"
              style={{ width: 80, height: 38 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 80, height: 38 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 80, height: 38 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 120, height: 38 }}
            />
          </div>

          {/* Tab content */}
          <TabLoading />
        </div>
      </div>
    </AdminLayout>
  );
}
