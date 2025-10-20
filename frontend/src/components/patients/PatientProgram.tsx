"use client";

import React, { useState } from "react";
import { Card, Empty } from "antd";
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import type { PatientProgramDTO, ServiceDetailDTO, AuthorizationDTO, PayerDetailDTO, ProgramDetailDTO } from "@/types/patient";
import { formatDate } from "@/lib/dateUtils";
import EditPatientProgramForm from "./EditPatientProgramForm";
import EditPatientServiceForm from "./EditPatientServiceForm";
import EditPatientPayerForm from "./EditPatientPayerForm";
import EditAuthorizationForm from "./EditAuthorizationForm";
import { useQueryClient } from "@tanstack/react-query";

interface PatientProgramProps {
  patient: PatientProgramDTO;
  patientId: string;
}

export default function PatientProgram({ patient, patientId }: PatientProgramProps) {
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetailDTO | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceDetailDTO | null>(null);
  const [showPayerForm, setShowPayerForm] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState<PayerDetailDTO | null>(null);
  const [expandedPayers, setExpandedPayers] = useState<Set<number>>(new Set([0])); // Expand first payer by default
  const [showAuthorizationForm, setShowAuthorizationForm] = useState(false);
  const [selectedAuthorization, setSelectedAuthorization] = useState<AuthorizationDTO | null>(null);
  const [expandedAuthorizations, setExpandedAuthorizations] = useState<Set<number>>(new Set([0])); // Expand first authorization by default
  const queryClient = useQueryClient();

  const togglePayerExpanded = (index: number) => {
    setExpandedPayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAuthorizationExpanded = (index: number) => {
    setExpandedAuthorizations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Get header info
  const programIdentifier = patient.program?.[0]?.programIdentifier || "—";
  const payerIdentifier = patient.payer?.[0]?.payerIdentifier || "—";
  const hasAuthorization = patient.authorizations && patient.authorizations.length > 0;
  const authorizationStatus = hasAuthorization ? "Authorized" : "Not Authorized";

  return (
    <>
      {/* Header */}
      <div className="mx-6 mb-4 px-6 py-4 bg-white border border-theme rounded-none shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-theme-primary">
            {programIdentifier} - {payerIdentifier} - {authorizationStatus}
          </span>
          {hasAuthorization ? (
            <CheckCircleOutlined style={{ color: '#1f701f', fontSize: '18px' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#9e0303', fontSize: '18px' }} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Program Details Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Program Details
                </span>
                <EditOutlined 
                  className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                  onClick={() => {
                    setSelectedProgram(patient.program && patient.program.length > 0 ? patient.program[0] : null);
                    setShowProgramForm(true);
                  }}
                />
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            {patient.program && patient.program.length > 0 ? (
              <div className="flex flex-col gap-3">
                {patient.program.map((prog: ProgramDetailDTO, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Supervisor</span>
                      <span className="text-[13px] font-normal text-theme-primary">{prog.supervisorName || "—"}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Enrollment</span>
                      <span className="text-[13px] font-normal text-theme-primary">{formatDate(prog.enrollmentDate)}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Created Date</span>
                      <span className="text-[13px] font-normal text-theme-primary">{formatDate(prog.createdAt)}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Status Effective Date</span>
                      <span className="text-[13px] font-normal text-theme-primary">{formatDate(prog.statusEffectiveDate)}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">SOC Date</span>
                      <span className="text-[13px] font-normal text-theme-primary">{formatDate(prog.socDate)}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">EOC Date</span>
                      <span className="text-[13px] font-normal text-theme-primary">{formatDate(prog.eocDate)}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Eligibility Begin Date</span>
                      <span className="text-[13px] font-normal text-theme-primary">{formatDate(prog.eligibilityBeginDate)}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center text-[13px]">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Eligibility End Date</span>
                      <span className="text-[13px] font-normal text-theme-primary">{formatDate(prog.eligibilityEndDate)}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-start text-[13px] md:col-span-2">
                      <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Reason For Change</span>
                      <div className="text-[13px] font-normal text-theme-primary">
                        {Array.isArray(prog.reasonForChange) && prog.reasonForChange.length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-[var(--primary)] hover:opacity-80 list-none font-[550]">
                              {prog.reasonForChange.length} {prog.reasonForChange.length === 1 ? 'change' : 'changes'}
                            </summary>
                            <ul className="mt-2 pl-0 list-none space-y-1">
                              {prog.reasonForChange.map((reason, ridx) => (
                                <li key={ridx} className="text-theme-primary text-[13px] py-1 border-b border-gray-100 last:border-0">
                                  • {reason}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No Program Details" />
            )}
          </Card>

          {/* Service Details Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Service Details
                </span>
                <button
                  className="bg-transparent border-none text-[var(--primary)] text-[13px] font-bold cursor-pointer px-2 py-1 hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedService(null);
                    setShowServiceForm(true);
                  }}
                >
                  + ADD SERVICE
                </button>
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            {patient.services && patient.services.length > 0 ? (
              <div className="flex flex-col gap-3">
                {patient.services.map((service: ServiceDetailDTO, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start"
                  >
                    <div className="grid grid-cols-4 gap-x-6 flex-1 text-[13px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-theme-secondary">Service Name:</span>
                        <span className="text-theme-primary">{service.serviceName || "—"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-theme-secondary">Code:</span>
                        <span className="text-theme-primary">{service.serviceCode || "—"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-theme-secondary">Start Date:</span>
                        <span className="text-theme-primary">{formatDate(service.startDate)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-theme-secondary">End Date:</span>
                        <span className="text-theme-primary">{formatDate(service.endDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <EditOutlined
                        className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                        onClick={() => {
                          setSelectedService(service);
                          setShowServiceForm(true);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No Service Added" />
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Payer Details Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Payer Details
                </span>
                <button
                  className="bg-transparent border-none text-[var(--primary)] text-[13px] font-bold cursor-pointer px-2 py-1 hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedPayer(null);
                    setShowPayerForm(true);
                  }}
                >
                  + ADD PAYER
                </button>
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            {patient.payer && patient.payer.length > 0 ? (
              <div className="flex flex-col">
                {patient.payer.map((py: PayerDetailDTO, idx: number) => {
                  const isExpanded = expandedPayers.has(idx);
                  const hasMultiplePayers = patient.payer && patient.payer.length > 1;
                  
                  return (
                    <div key={idx}>
                      {/* Divider line between payers */}
                      {idx > 0 && (
                        <div className="border-t border-theme my-3" />
                      )}
                      
                      <div className="flex justify-between items-start">
                        {/* Arrow at start of row */}
                        <div className="flex items-center gap-2 mr-3">
                          {hasMultiplePayers && (
                            <button
                              onClick={() => togglePayerExpanded(idx)}
                              className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors bg-transparent border-none p-0"
                            >
                              {isExpanded ? <UpOutlined /> : <DownOutlined />}
                            </button>
                          )}
                        </div>

                        <div className="flex-1">
                          {/* Always visible: First row with Payer and Medicaid ID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
                            <div className="grid grid-cols-[120px_1fr] gap-4 items-center text-[13px]">
                              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Payer:</span>
                              <span className="text-[13px] font-normal text-theme-primary">{py.payerIdentifier || "—"}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-4 items-center text-[13px]">
                              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Medicaid ID:</span>
                              <span className="text-[13px] font-normal text-theme-primary">{py.clientPayerId || "—"}</span>
                            </div>
                          </div>

                          {/* Collapsible details */}
                          {(!hasMultiplePayers || isExpanded) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6 mt-4">
                              <div className="grid grid-cols-[120px_1fr] gap-4 items-center text-[13px]">
                                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Rank:</span>
                                <span className="text-[13px] font-normal text-theme-primary">{py.rank ?? "—"}</span>
                              </div>
                              <div className="grid grid-cols-[120px_1fr] gap-4 items-center text-[13px]">
                                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Group No:</span>
                                <span className="text-[13px] font-normal text-theme-primary">{py.groupNo || "—"}</span>
                              </div>
                              <div className="grid grid-cols-[120px_1fr] gap-4 items-center text-[13px]">
                                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">Start Date:</span>
                                <span className="text-[13px] font-normal text-theme-primary">{formatDate(py.startDate)}</span>
                              </div>
                              <div className="grid grid-cols-[120px_1fr] gap-4 items-center text-[13px]">
                                <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">End Date:</span>
                                <span className="text-[13px] font-normal text-theme-primary">{formatDate(py.endDate)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Edit button */}
                        <div className="flex items-center gap-2 ml-4">
                          <EditOutlined
                            className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                            onClick={() => {
                              setSelectedPayer(py);
                              setShowPayerForm(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty description="No Payer Details Added" />
            )}
          </Card>

          {/* Authorization Details Card */}
          <Card
            title={
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold text-theme-primary">
                  Authorization Details
                </span>
                <button
                  className="bg-transparent border-none text-[var(--primary)] text-[13px] font-bold cursor-pointer px-2 py-1 hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedAuthorization(null);
                    setShowAuthorizationForm(true);
                  }}
                >
                  + ADD AUTHORIZATION
                </button>
              </div>
            }
            className="rounded-none shadow-sm border border-theme"
          >
            {patient.authorizations && patient.authorizations.length > 0 ? (
              <div className="flex flex-col">
                {patient.authorizations.map((auth: AuthorizationDTO, idx: number) => {
                  const isExpanded = expandedAuthorizations.has(idx);
                  const hasMultipleAuthorizations = patient.authorizations && patient.authorizations.length > 1;
                  
                  return (
                    <div key={idx}>
                      {/* Divider line between authorizations */}
                      {idx > 0 && (
                        <div className="border-t border-theme my-3" />
                      )}
                      
                      <div className="flex justify-between items-start">
                        {/* Arrow at start of row */}
                        <div className="flex items-center gap-2 mr-3">
                          {hasMultipleAuthorizations && (
                            <button
                              onClick={() => toggleAuthorizationExpanded(idx)}
                              className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors bg-transparent border-none p-0"
                            >
                              {isExpanded ? <UpOutlined /> : <DownOutlined />}
                            </button>
                          )}
                        </div>

                        <div className="flex-1">
                          {/* Always visible: First 2 rows - Payer + Authorization No (row 1), Service + Event Code (row 2) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
                            <div className="flex items-center gap-2 text-[13px]">
                              <span className="font-medium text-theme-secondary">Payer:</span>
                              <span className="text-theme-primary">{auth.payerIdentifier || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px]">
                              <span className="font-medium text-theme-secondary">Authorization No:</span>
                              <span className="text-theme-primary">{auth.authorizationNo || "—"}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6 mt-2">
                            <div className="flex items-center gap-2 text-[13px]">
                              <span className="font-medium text-theme-secondary">Service:</span>
                              <span className="text-theme-primary">{auth.serviceCode || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px]">
                              <span className="font-medium text-theme-secondary">Event Code:</span>
                              <span className="text-theme-primary">{auth.eventCode || "—"}</span>
                            </div>
                          </div>

                          {/* Collapsible details */}
                          {(!hasMultipleAuthorizations || isExpanded) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6 mt-4">
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">Modifiers:</span>
                                <span className="text-theme-primary">{auth.modifiers ? JSON.stringify(auth.modifiers) : "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">Format:</span>
                                <span className="text-theme-primary">{auth.format || "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">Start Date:</span>
                                <span className="text-theme-primary">{formatDate(auth.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">End Date:</span>
                                <span className="text-theme-primary">{formatDate(auth.endDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px] md:col-span-2">
                                <span className="font-medium text-theme-secondary">Comment:</span>
                                <span className="text-theme-primary">{auth.comments || "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">Total Maximum:</span>
                                <span className="text-theme-primary">{auth.maxUnits ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">Total Used:</span>
                                <span className="text-theme-primary">{auth.totalUsed ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">Total Missed:</span>
                                <span className="text-theme-primary">{auth.totalMissed ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[13px]">
                                <span className="font-medium text-theme-secondary">Total Remaining:</span>
                                <span className="text-theme-primary">{auth.totalRemaining ?? "—"}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Edit button */}
                        <div className="flex items-center gap-2 ml-4">
                          <EditOutlined
                            className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                            onClick={() => {
                              setSelectedAuthorization(auth);
                              setShowAuthorizationForm(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty description="No Authorization Added. Click button to add Authorization." />
            )}
          </Card>
        </div>
      </div>

      {/* Edit Program Form */}
      <EditPatientProgramForm
        open={showProgramForm}
        onClose={() => {
          setShowProgramForm(false);
          setSelectedProgram(null);
        }}
        patientId={patientId}
        initialData={selectedProgram}
        onUpdateSuccess={() => {
          // Invalidate the program query to refetch data
          queryClient.invalidateQueries({ queryKey: ["patient-program", patientId] });
        }}
      />

      {/* Edit Service Form */}
      <EditPatientServiceForm
        open={showServiceForm}
        onClose={() => {
          setShowServiceForm(false);
          setSelectedService(null);
        }}
        patientId={patientId}
        serviceId={selectedService?.patientServiceId}
        initialData={selectedService}
        onUpdateSuccess={() => {
          // Invalidate the program query to refetch data
          queryClient.invalidateQueries({ queryKey: ["patient-program", patientId] });
        }}
      />

      {/* Edit Payer Form */}
      <EditPatientPayerForm
        open={showPayerForm}
        onClose={() => {
          setShowPayerForm(false);
          setSelectedPayer(null);
        }}
        patientId={patientId}
        patientPayerId={selectedPayer?.patientPayerId}
        initialData={selectedPayer}
        onUpdateSuccess={() => {
          // Invalidate the program query to refetch data
          queryClient.invalidateQueries({ queryKey: ["patient-program", patientId] });
        }}
      />

      {/* Edit Authorization Form */}
      <EditAuthorizationForm
        open={showAuthorizationForm}
        onClose={() => {
          setShowAuthorizationForm(false);
          setSelectedAuthorization(null);
        }}
        patientId={patientId}
        authorizationId={selectedAuthorization?.authorizationId}
        initialData={selectedAuthorization}
        services={patient.services || []}
        payers={patient.payer || []}
        onUpdateSuccess={() => {
          // Invalidate the program query to refetch data
          queryClient.invalidateQueries({ queryKey: ["patient-program", patientId] });
        }}
      />

      {/* Apply custom styles to Ant Design Card */}
      <style jsx global>{`
        .ant-card {
          border-radius: 0 !important;
          border: 0 !important
        }
        .ant-card-head {
          border-bottom: none !important;
          border-radius: 0 !important;
          border: 0 !important

        }
        .ant-card-body {
          border-radius: 0 !important;
          border: 0 !important

        }
      `}</style>
    </>
  );
}

