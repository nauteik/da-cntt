"use client";

import React from "react";
import { LeftOutlined, DownOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { PatientHeaderDTO } from "@/types/patient";
import { PatientStatus } from "@/types/patient";
import styles from "./PatientHeader.module.css";
import utilStyles from "@/styles/utilities.module.css";

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
    <div className={styles.header}>
      {/* Row 1: Back button, Name/Status, Program dropdown */}
      <div className={styles.row1}>
        <div
          onClick={handleBack}
          className={`${styles.backButton} ${utilStyles.clickableText}`}
        >
          <LeftOutlined /> BACK
        </div>

        <div className={styles.nameStatusGroup}>
          <h1 className={styles.patientName}>{patient.clientName}</h1>

          <div className={styles.programStatusDisplay}>
            <span className={styles.programText}>
              {patient.programName || "—"}
            </span>
            <span className={styles.separator}> | </span>
            <span
              className={styles.statusText}
              style={{ color: getStatusColor(patient.status) }}
            >
              {patient.status}
            </span>
            <DownOutlined className={styles.dropdownIcon} />
          </div>
        </div>
      </div>

      {/* Row 2: Client info - all in one line */}
      <div className={styles.row2}>
        <span className={styles.infoText}>
          <span className={styles.label}>Client ID:</span>{" "}
          <span className={styles.value}>{patient.clientId || "—"}</span>
        </span>

        <span className={styles.separator}>|</span>

        <span className={styles.infoText}>
          <span className={styles.label}>Medicaid ID:</span>{" "}
          <span className={styles.value}>{patient.medicaidId || "—"}</span>
        </span>

        <span className={styles.separator}>|</span>

        <span className={styles.infoText}>
          <span className={styles.label}>Main Address:</span>{" "}
          <span className={styles.value}>{patient.mainAddress || "—"}</span>
        </span>

        <span className={styles.separator}>|</span>

        <span className={styles.infoText}>
          <span className={styles.label}>Phone No:</span>{" "}
          <span className={styles.value}>{patient.phoneNo || "—"}</span>
        </span>

        <span className={styles.separator}>|</span>

        <span className={styles.infoText}>
          <span className={styles.label}>Main Emergency Contact:</span>{" "}
          <span className={styles.value}>
            {patient.mainEmergencyContact || "—"}
          </span>
        </span>
      </div>
    </div>
  );
}
