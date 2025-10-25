"use client";

import React from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { StaffHeaderDTO } from "@/types/staff";

interface StaffHeaderProps {
  staff: StaffHeaderDTO;
}

export default function StaffHeader({ staff }: StaffHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/employees");
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-none pt-2.5 px-4 mb-0">
      {/* Row 1: Back button and Name */}
      <div className="flex items-center gap-4 mb-3">
        <div
          onClick={handleBack}
          className="flex items-center gap-1 font-semibold text-base cursor-pointer text-[var(--primary)] hover:opacity-80 transition-opacity"
        >
          <LeftOutlined /> BACK
        </div>

        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-bold text-theme-primary m-0">
            {staff.staffName}
          </h1>
        </div>
      </div>

      {/* Row 2: Staff info - all in one line */}
      <div className="flex items-center gap-3 flex-wrap text-xs leading-[1.5] max-xl:text-[11px] max-md:flex-col max-md:items-start max-md:gap-2">
        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Employee ID:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {staff.employeeId || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Phone No:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {staff.phoneNo || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Email:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {staff.email || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">
            Main Emergency Contact:
          </span>{" "}
          <span className="text-theme-primary font-semibold">
            {staff.mainEmergencyContact || "—"}
          </span>
        </span>
      </div>
    </div>
  );
}
