"use client";

import React from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Select, App } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApi";
import type { PatientHeaderDTO } from "@/types/patient";
import { PatientStatus } from "@/types/patient";
import formStyles from "@/styles/form.module.css";

interface PatientHeaderProps {
  patient: PatientHeaderDTO;
}

export default function PatientHeader({ patient }: PatientHeaderProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = React.useState<PatientStatus>(patient.status);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Sync state with prop when patient prop changes, but only if not currently updating
  React.useEffect(() => {
    if (!isUpdating) {
      setSelectedStatus(patient.status);
    }
  }, [patient.status, isUpdating]);

  // Update patient status mutation
  const updateStatusMutation = useApiMutation<unknown, { status: string }>(
    `/patients/${patient.id}/status`,
    "PATCH"
  );

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

  // Status options for dropdown
  const statusOptions = [
    { label: PatientStatus.ACTIVE, value: PatientStatus.ACTIVE },
    { label: PatientStatus.INACTIVE, value: PatientStatus.INACTIVE },
    { label: PatientStatus.PENDING, value: PatientStatus.PENDING },
  ];

  const handleBack = () => {
    router.push("/clients");
  };

  const handleStatusChange = async (status: PatientStatus) => {
    if (status === selectedStatus) return;

    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        status: status,
      });

      setSelectedStatus(status);
      message.success(`Status updated to ${status}`);
      
      // Invalidate and refetch React Query cache to get updated data
      // This ensures the parent component gets fresh data with the new status
      await queryClient.refetchQueries({
        queryKey: ["patient-header", patient.id],
      });
      
      setIsUpdating(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error("Failed to update status. Please try again.");
      setIsUpdating(false);
    }
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
            <span className="text-black"> | </span>
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              className={formStyles.formSelect}
              style={{ 
                minWidth: 100,
                border: "none",
                fontSize: "13px",
              }}
              loading={updateStatusMutation.isPending}
              disabled={updateStatusMutation.isPending}
              options={statusOptions.map((option) => ({
                label: (
                  <span style={{ color: getStatusColor(option.value as PatientStatus) }}>
                    {option.label}
                  </span>
                ),
                value: option.value,
              }))}
              styles={{
                popup: {
                  root: { minWidth: 150 }
                }
              }}
              variant="borderless"
            />
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
