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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Identifiers Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Identifiers
                </span>
                <EditOutlined
                  className="text-sm cursor-pointer"
                  onClick={() => setShowIdentifiersForm(true)}
                />
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  Client ID
                </span>
                <span className="text-sm text-theme-primary">
                  {patient.clientId || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  Medicaid ID
                </span>
                <span className="text-sm text-theme-primary">
                  {patient.medicaidId || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  SSN
                </span>
                <span className="text-sm text-theme-primary">
                  {patient.ssn || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  Agency ID
                </span>
                <span className="text-sm text-theme-primary">
                  {patient.agencyId || "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Personal Information Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Personal Information
                </span>
                <EditOutlined
                  className="text-sm cursor-pointer"
                  onClick={() => setShowPersonalInfoForm(true)}
                />
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  Client Name
                </span>
                <span className="text-sm text-theme-primary">
                  {patient.firstName} {patient.lastName}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  Date of Birth
                </span>
                <span className="text-sm text-theme-primary">
                  {formatDate(patient.dob)}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  Gender
                </span>
                <span className="text-sm text-theme-primary">
                  {patient.gender || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                  Language
                </span>
                <span className="text-sm text-theme-primary">
                  {patient.primaryLanguage || "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Addresses | Phone Numbers Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Addresses | Phone Numbers
                </span>
                <button className="bg-transparent border-none [color:var(--primary)] text-xs font-bold cursor-pointer px-2 py-1 hover:opacity-90 transition-opacity uppercase">
                  + Add Address
                </button>
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            {patient.addresses && patient.addresses.length > 0 ? (
              <div className="flex flex-col gap-3">
                {patient.addresses.map((address: AddressDTO) => (
                  <div
                    key={address.id}
                    className="flex justify-between items-center p-3 px-4 border border-theme rounded-md bg-theme-primary hover:[border-color:var(--primary)] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <PhoneOutlined className="text-base text-theme-secondary" />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm text-theme-primary">
                          {address.line1 || "—"} | {address.phone || "—"}
                        </span>
                        {address.isMain && (
                          <span className="[background-color:var(--primary)] text-white text-xs font-medium px-2.5 py-0.5 tracking-wide">
                            Main Address
                          </span>
                        )}
                      </div>
                    </div>
                    <MoreOutlined className="text-base text-theme-secondary cursor-pointer hover:[color:var(--primary)] transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No addresses found" />
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Contacts Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Contacts
                </span>
                <button className="bg-transparent border-none [color:var(--primary)] text-xs font-bold cursor-pointer px-2 py-1 hover:opacity-90 transition-opacity uppercase">
                  + Add Contact
                </button>
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            {patient.contacts && patient.contacts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {patient.contacts.map((contact: ContactDTO) => (
                  <div
                    key={contact.id}
                    className="flex justify-between items-start p-4 border border-theme rounded-md bg-theme-primary hover:[border-color:var(--primary)] hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <div className="text-sm font-semibold text-theme-primary">
                          {contact.name}
                        </div>
                        {contact.isPrimary && (
                          <span className="[background-color:var(--primary)] text-white text-xs font-medium px-2.5 py-0.5 tracking-wide">
                            Primary Contact
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-theme-secondary">
                        <span className="font-medium">{contact.relation}</span>
                        {contact.phone && (
                          <>
                            <span className="text-theme-border">•</span>
                            <PhoneOutlined className="text-xs text-theme-secondary" />
                            <span>{contact.phone}</span>
                          </>
                        )}
                        {contact.email && (
                          <>
                            <span className="text-theme-border">•</span>
                            <MailOutlined className="text-xs text-theme-secondary" />
                            <span>{contact.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <MoreOutlined className="text-base text-theme-secondary cursor-pointer hover:[color:var(--primary)] transition-colors" />
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
    </>
  );
}
