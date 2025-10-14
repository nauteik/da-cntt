"use client";

import React from "react";
import { LeftOutlined, DownOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { PatientHeaderDTO } from "@/types/patient";
import { PatientStatus } from "@/types/patient";

interface PatientHeaderProps {
  patient: PatientHeaderDTO;
}

export default function PatientHeader({ patient }: PatientHeaderProps) {
  const router = useRouter();

  // Status color mapping
  const getStatusColor = (status: PatientStatus): string => {
    switch (status) {
      case PatientStatus.ACTIVE:
        return "#1f701f"; // green
      case PatientStatus.INACTIVE:
        return "#9e0303"; // red
      case PatientStatus.PENDING:
        return "#de6000"; // orange
      default:
        return "var(--text-primary)";
    }
  };

  const handleBack = () => {
    router.push("/clients");
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-none pt-2.5 px-4 mb-0">
      {/* Row 1: Back button, Name/Status, Program dropdown */}
      <div className="flex items-center gap-4 mb-3">
        <div
          onClick={handleBack}
          className="flex items-center gap-1 font-semibold text-base cursor-pointer text-[var(--primary)] hover:opacity-80 transition-opacity"
        >
          <LeftOutlined /> BACK
        </div>

        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-bold text-theme-primary m-0">
            {patient.clientName}
          </h1>

          <div className="flex items-center gap-1 py-1.5 px-3 border border-theme rounded bg-[var(--bg-surface)] text-[13px] min-w-[200px]">
            <span className="text-theme-primary font-normal">
              {patient.programName || "—"}
            </span>
            <span className="text-black font-bold"> | </span>
            <span
              className="font-bold"
              style={{ color: getStatusColor(patient.status) }}
            >
              {patient.status}
            </span>
            <DownOutlined className="ml-auto text-theme-secondary text-[10px]" />
          </div>
        </div>
      </div>

      {/* Row 2: Client info - all in one line */}
      <div className="flex items-center gap-3 flex-wrap text-xs leading-[1.5] max-xl:text-[11px] max-md:flex-col max-md:items-start max-md:gap-2">
        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Client ID:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {patient.clientId || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Medicaid ID:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {patient.medicaidId || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">
            Main Address:
          </span>{" "}
          <span className="text-theme-primary font-semibold">
            {patient.mainAddress || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Phone No:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {patient.phoneNo || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">
            Main Emergency Contact:
          </span>{" "}
          <span className="text-theme-primary font-semibold">
            {patient.mainEmergencyContact || "—"}
          </span>
        </span>
      </div>
    </div>
  );
}
