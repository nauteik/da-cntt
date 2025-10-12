"use client";

import React, { useState } from "react";
import { Card, Empty } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import type {
  PatientPersonalDTO,
  ContactDTO,
  AddressDTO,
} from "@/types/patient";
import styles from "./PatientPersonal.module.css";
import EditIdentifiersForm from "./EditIdentifiersForm";
import EditPersonalInfoForm from "./EditPersonalInfoForm";

interface PatientPersonalProps {
  patient: PatientPersonalDTO;
}

export default function PatientPersonal({ patient }: PatientPersonalProps) {
  const [showIdentifiersForm, setShowIdentifiersForm] = useState(false);
  const [showPersonalInfoForm, setShowPersonalInfoForm] = useState(false);
  const queryClient = useQueryClient();

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <>
      <div className={styles.mainLayout}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Identifiers Card */}
          <Card
            title={
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Identifiers</span>
                <EditOutlined
                  className={styles.editIcon}
                  onClick={() => setShowIdentifiersForm(true)}
                />
              </div>
            }
            className={styles.card}
          >
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Client ID</span>
                <span className={styles.infoValue}>
                  {patient.clientId || "—"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Medicaid ID</span>
                <span className={styles.infoValue}>
                  {patient.medicaidId || "—"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>SSN</span>
                <span className={styles.infoValue}>{patient.ssn || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Agency ID</span>
                <span className={styles.infoValue}>
                  {patient.agencyId || "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Personal Information Card */}
          <Card
            title={
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Personal Information</span>
                <EditOutlined
                  className={styles.editIcon}
                  onClick={() => setShowPersonalInfoForm(true)}
                />
              </div>
            }
            className={styles.card}
          >
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Client Name</span>
                <span className={styles.infoValue}>
                  {patient.firstName} {patient.lastName}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date of Birth</span>
                <span className={styles.infoValue}>
                  {formatDate(patient.dob)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Gender</span>
                <span className={styles.infoValue}>
                  {patient.gender || "—"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Language</span>
                <span className={styles.infoValue}>
                  {patient.primaryLanguage || "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Addresses | Phone Numbers Card */}
          <Card
            title={
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>
                  Addresses | Phone Numbers
                </span>
                <button className={styles.addButton}>+ ADD ADDRESS</button>
              </div>
            }
            className={styles.card}
          >
            {patient.addresses && patient.addresses.length > 0 ? (
              <div className={styles.listContainer}>
                {patient.addresses.map((address: AddressDTO) => (
                  <div key={address.id} className={styles.addressItem}>
                    <div className={styles.listItemContent}>
                      <PhoneOutlined className={styles.listIcon} />
                      <div className={styles.listItemText}>
                        <span className={styles.listItemPhone}>
                          {address.line1 || "—"} | {address.phone || "—"}
                        </span>
                        {address.isMain && (
                          <span className={styles.mainBadge}>Main Address</span>
                        )}
                      </div>
                    </div>
                    <MoreOutlined className={styles.moreIcon} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No addresses found" />
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Contacts Card */}
          <Card
            title={
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Contacts</span>
                <button className={styles.addButton}>+ ADD CONTACT</button>
              </div>
            }
            className={styles.card}
          >
            {patient.contacts && patient.contacts.length > 0 ? (
              <div className={styles.listContainer}>
                {patient.contacts.map((contact: ContactDTO) => (
                  <div key={contact.id} className={styles.contactItem}>
                    <div className={styles.contactInfo}>
                      <div className={styles.contactNameRow}>
                        <div className={styles.contactName}>{contact.name}</div>
                        {contact.isPrimary && (
                          <span className={styles.mainBadge}>
                            Primary Contact
                          </span>
                        )}
                      </div>
                      <div className={styles.contactDetails}>
                        <span className={styles.contactRelation}>
                          {contact.relation}
                        </span>
                        {contact.phone && (
                          <>
                            <span className={styles.contactSeparator}>•</span>
                            <PhoneOutlined className={styles.contactIcon} />
                            <span>{contact.phone}</span>
                          </>
                        )}
                        {contact.email && (
                          <>
                            <span className={styles.contactSeparator}>•</span>
                            <MailOutlined className={styles.contactIcon} />
                            <span>{contact.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <MoreOutlined className={styles.moreIcon} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No contacts added. Click button to add contacts." />
            )}
          </Card>
        </div>
      </div>

      {/* Edit Forms */}
      <EditIdentifiersForm
        open={showIdentifiersForm}
        onClose={() => setShowIdentifiersForm(false)}
        patientId={patient.id}
        initialData={{
          clientId: patient.clientId || "",
          medicaidId: patient.medicaidId || "",
          ssn: patient.ssn || "",
          agencyId: patient.agencyId || "",
        }}
        onUpdateSuccess={() => {
          // Invalidate both header and personal queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["patient-header", patient.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["patient-personal", patient.id],
          });
        }}
      />

      <EditPersonalInfoForm
        open={showPersonalInfoForm}
        onClose={() => setShowPersonalInfoForm(false)}
        patientId={patient.id}
        initialData={{
          firstName: patient.firstName || "",
          lastName: patient.lastName || "",
          dob: patient.dob || "",
          gender: patient.gender || "",
          primaryLanguage: patient.primaryLanguage || "",
        }}
        onUpdateSuccess={() => {
          // Invalidate both header and personal queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["patient-header", patient.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["patient-personal", patient.id],
          });
        }}
      />
    </>
  );
}
