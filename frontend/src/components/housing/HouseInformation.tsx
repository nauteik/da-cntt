"use client";

import React from "react";
import { Card, Tag } from "antd";
import type { HouseDTO } from "@/types/house";

interface HouseInformationProps {
  house: HouseDTO;
}

export default function HouseInformation({ house }: HouseInformationProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 min-h-[600px]">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        {/* Basic Information Card */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-bold text-theme-primary">
                Basic Information
              </span>
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                House Code
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {house.code || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                House Name
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {house.name || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Office
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {house.officeName || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Status
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    house.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-[13px] font-normal text-theme-primary">
                  {house.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Address Information Card */}
        {house.fullAddress && (
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Address
                </span>
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            <div className="flex flex-col gap-2 text-[13px]">
              {house.addressLine1 && (
                <span className="text-theme-primary">{house.addressLine1}</span>
              )}
              {house.addressLine2 && (
                <span className="text-theme-primary">{house.addressLine2}</span>
              )}
              <div className="flex gap-2">
                {house.city && (
                  <span className="text-theme-primary">{house.city}</span>
                )}
                {house.state && (
                  <>
                    {house.city && <span className="text-theme-border">,</span>}
                    <span className="text-theme-primary">{house.state}</span>
                  </>
                )}
                {house.zipCode && (
                  <>
                    {house.state && <span className="text-theme-border"> </span>}
                    <span className="text-theme-primary">{house.zipCode}</span>
                  </>
                )}
              </div>
              {house.fullAddress && (
                <span className="text-theme-secondary text-xs mt-2">
                  {house.fullAddress}
                </span>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        {/* Description Card */}
        <Card
          title={
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-bold text-theme-primary">
                Description
              </span>
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="text-[13px] text-theme-primary">
            {house.description || (
              <span className="text-theme-secondary italic">
                No description available
              </span>
            )}
          </div>
        </Card>

        {/* Current Patient Card */}
        {house.currentPatientId && (
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Current Patient
                </span>
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-[13px] font-semibold text-theme-primary cursor-pointer hover:text-[var(--primary)] transition-colors"
                  onClick={() =>
                    (window.location.href = `/clients/${house.currentPatientId}`)
                  }
                >
                  {house.currentPatientName}
                </span>
                <Tag color="green">Active</Tag>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Custom styles for Ant Design Card */}
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

