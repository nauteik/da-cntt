"use client";

import React from "react";
import { Card, Skeleton } from "antd";

/**
 * Generic loading skeleton for tab content
 * Used across all tabs (Personal, Program, Schedule, etc.)
 */
export default function TabLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 min-h-[600px]">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        {/* Card 1 */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <Skeleton.Input active style={{ width: 150, height: 20 }} />
              <Skeleton.Button active size="small" shape="circle" />
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[100px_1fr] gap-4 items-center"
              >
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 90, height: 14 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: "100%", height: 16 }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Card 2 */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <Skeleton.Input active style={{ width: 180, height: 20 }} />
              <Skeleton.Button active size="small" shape="circle" />
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[100px_1fr] gap-4 items-center"
              >
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 90, height: 14 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: "100%", height: 16 }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Card 3 - List style */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <Skeleton.Input active style={{ width: 200, height: 20 }} />
              <Skeleton.Button active style={{ width: 130, height: 28 }} />
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 px-4 border border-theme rounded-md"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton.Avatar active size="small" shape="circle" />
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 250, height: 16 }}
                  />
                </div>
                <Skeleton.Button active size="small" shape="circle" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        {/* Card 1 */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <Skeleton.Input active style={{ width: 120, height: 20 }} />
              <Skeleton.Button active style={{ width: 130, height: 28 }} />
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-4 border border-theme rounded-md"
              >
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 150, height: 18 }}
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 250, height: 14 }}
                  />
                </div>
                <Skeleton.Button active size="small" shape="circle" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Apply custom styles to Ant Design Card */}
      <style jsx global>{`
        .ant-card {
          border-radius: 0 !important;
        }
        .ant-card-head {
          border-bottom: none !important;
          border-radius: 0 !important;
        }
        .ant-card-body {
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
}

