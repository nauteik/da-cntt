"use client";

import React, { useState } from "react";
import { Card, Empty, Badge } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import type {
  StaffPersonalDTO,
  StaffContactDTO,
  StaffAddressDTO,
} from "@/types/staff";
import { formatDateLong } from "@/lib/dateUtils";
import EditStaffIdentifiersForm from "./EditStaffIdentifiersForm";
import EditStaffPersonalInfoForm from "./EditStaffPersonalInfoForm";
import EditStaffAddressForm from "./EditStaffAddressForm";
import EditStaffContactForm from "./EditStaffContactForm";

interface StaffPersonalProps {
  staff: StaffPersonalDTO;
}

export default function StaffPersonal({ staff }: StaffPersonalProps) {
  const [showSSN, setShowSSN] = useState(false);
  const [showIdentifiersForm, setShowIdentifiersForm] = useState(false);
  const [showPersonalInfoForm, setShowPersonalInfoForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<StaffAddressDTO | null>(
    null
  );
  const [selectedContact, setSelectedContact] = useState<StaffContactDTO | null>(
    null
  );
  const queryClient = useQueryClient();

  // Handlers for Address actions
  const handleAddAddress = () => {
    setSelectedAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: StaffAddressDTO) => {
    setSelectedAddress(address);
    setShowAddressForm(true);
  };

  // Handlers for Contact actions
  const handleAddContact = () => {
    setSelectedContact(null);
    setShowContactForm(true);
  };

  const handleEditContact = (contact: StaffContactDTO) => {
    setSelectedContact(contact);
    setShowContactForm(true);
  };

  const maskSSN = (ssn: string) => {
    if (!ssn) return "—";
    return "***-**-" + ssn.slice(-4);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 min-h-[600px]">
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
                className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                onClick={() => setShowIdentifiersForm(true)}
              />
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                SSN
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-normal text-theme-primary">
                  {showSSN ? staff.ssn || "—" : maskSSN(staff.ssn)}
                </span>
                {staff.ssn && (
                  <button
                    onClick={() => setShowSSN(!showSSN)}
                    className="text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    {showSSN ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Status
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    staff.status === "Active" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-[13px] font-normal text-theme-primary">
                  {staff.status || "—"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Effective Date
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {formatDateLong(staff.effectiveDate)}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Employee ID
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.employeeId || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Position
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.position || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Hire Date
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {formatDateLong(staff.hireDate)}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Supervisor
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.supervisor || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                National Provider ID
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.nationalProviderId || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Is Supervisor
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    staff.isSupervisor ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-[13px] font-normal text-theme-primary">
                  {staff.isSupervisor ? "Yes" : "No"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Office
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.officeName || "—"}
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
                className="text-sm text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                onClick={() => setShowPersonalInfoForm(true)}
              />
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-6">
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Employee Name
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.firstName} {staff.lastName}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Date of Birth
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {formatDateLong(staff.dob)}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Gender
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.gender || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 items-center text-[13px]">
              <span className="text-xs font-medium text-theme-secondary whitespace-nowrap">
                Language
              </span>
              <span className="text-[13px] font-normal text-theme-primary">
                {staff.primaryLanguage || "—"}
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
              <button
                onClick={handleAddAddress}
                className="bg-transparent border-none text-[var(--primary)] text-[13px] font-bold cursor-pointer px-2 py-1 hover:opacity-90 transition-opacity"
              >
                + ADD ADDRESS
              </button>
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          {staff.addresses && staff.addresses.length > 0 ? (
            <div className="flex flex-col gap-3">
              {staff.addresses.map((address: StaffAddressDTO) => (
                <div
                  key={address.id}
                  className="flex justify-between items-center py-3 px-4 border border-theme rounded-md bg-[var(--bg-primary)] hover:border-[var(--primary)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <PhoneOutlined className="text-base text-theme-secondary" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[13px] text-theme-primary">
                        {address.line1 || "—"} | {address.phone || "—"}
                      </span>
                      {address.isMain && (
                        <span className="bg-[var(--primary)] text-white text-xs font-medium px-2.5 py-0.5 tracking-[0.3px]">
                          Main Address
                        </span>
                      )}
                    </div>
                  </div>
                  <MoreOutlined
                    className="text-base text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                    onClick={() => handleEditAddress(address)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Empty
              description="No addresses found"
              className="py-8"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
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
              <button
                onClick={handleAddContact}
                className="bg-transparent border-none text-[var(--primary)] text-[13px] font-bold cursor-pointer px-2 py-1 hover:opacity-90 transition-opacity"
              >
                + ADD CONTACT
              </button>
            </div>
          }
          className="rounded-none shadow-sm border border-theme"
        >
          {staff.contacts && staff.contacts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {staff.contacts.map((contact: StaffContactDTO) => (
                <div
                  key={contact.id}
                  className="flex justify-between items-start p-4 border border-theme rounded-md bg-[var(--bg-primary)] hover:border-[var(--primary)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="text-sm font-semibold text-theme-primary">
                        {contact.name}
                      </div>
                      {contact.isPrimary && (
                        <span className="bg-[var(--primary)] text-white text-xs font-medium px-2.5 py-0.5 tracking-[0.3px]">
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
                    {(contact.line1 || contact.line2) && (
                      <div className="text-xs text-theme-secondary">
                        <span className="font-medium">Address:</span>{" "}
                        <span>
                          {contact.line1}
                          {contact.line2 && `, ${contact.line2}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <MoreOutlined
                    className="text-base text-theme-secondary cursor-pointer hover:text-[var(--primary)] transition-colors"
                    onClick={() => handleEditContact(contact)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Empty
              description="No contact(s) added. Click button to add contacts."
              className="py-8"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>

      {/* Edit Forms */}
      <EditStaffIdentifiersForm
        open={showIdentifiersForm}
        onClose={() => setShowIdentifiersForm(false)}
        staffId={staff.id}
        initialData={{
          ssn: staff.ssn || "",
          employeeId: staff.employeeId || "",
          nationalProviderId: staff.nationalProviderId || "",
          isSupervisor: staff.isSupervisor || false,
          position: staff.position || "",
          supervisorId: staff.supervisorId || "",
          officeId: staff.officeId || "",
        }}
        onUpdateSuccess={() => {
          // Invalidate both header and personal queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["staff-header", staff.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["staff-personal", staff.id],
          });
        }}
      />

      <EditStaffPersonalInfoForm
        open={showPersonalInfoForm}
        onClose={() => setShowPersonalInfoForm(false)}
        staffId={staff.id}
        initialData={{
          firstName: staff.firstName || "",
          lastName: staff.lastName || "",
          dob: staff.dob || "",
          gender: staff.gender || "",
          primaryLanguage: staff.primaryLanguage || "",
        }}
        onUpdateSuccess={() => {
          // Invalidate both header and personal queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["staff-header", staff.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["staff-personal", staff.id],
          });
        }}
      />

      <EditStaffAddressForm
        open={showAddressForm}
        onClose={() => {
          setShowAddressForm(false);
          setSelectedAddress(null);
        }}
        staffId={staff.id}
        initialData={selectedAddress}
        onUpdateSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["staff-header", staff.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["staff-personal", staff.id],
          });
        }}
      />

      <EditStaffContactForm
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setSelectedContact(null);
        }}
        staffId={staff.id}
        initialData={selectedContact}
        onUpdateSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["staff-header", staff.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["staff-personal", staff.id],
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
    </div>
  );
}
