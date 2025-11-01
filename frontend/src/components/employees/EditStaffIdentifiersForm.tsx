"use client";

import React from "react";
import { Modal, Button, Input, Switch, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/hooks/useApi";
import { staffIdentifiersSchema, type StaffIdentifiersFormData } from "@/lib/validation/staffSchemas";
import { apiClient } from "@/lib/apiClient";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import { useQuery } from "@tanstack/react-query";
import type { RoleDTO } from "@/types/role";
import type { OfficeDTO } from "@/types/office";
import type { StaffSelectDTO } from "@/types/patient";

interface EditStaffIdentifiersFormProps {
  open: boolean;
  onClose: () => void;
  staffId: string;
  initialData: {
    ssn: string;
    employeeId: string;
    nationalProviderId: string;
    isSupervisor: boolean;
    isActive: boolean;
    position: string;
    supervisorId: string;
    officeId: string;
    effectiveDate?: string;
    hireDate?: string;
  };
  onUpdateSuccess?: () => void;
}

export default function EditStaffIdentifiersForm({
  open,
  onClose,
  staffId,
  initialData,
  onUpdateSuccess,
}: EditStaffIdentifiersFormProps) {
  const [showSSN, setShowSSN] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StaffIdentifiersFormData>({
    resolver: zodResolver(staffIdentifiersSchema),
    defaultValues: {
      ...initialData,
      isSupervisor: initialData.isSupervisor || false,
    },
  });

  const updateIdentifiersMutation = useApiMutation<
    unknown,
    StaffIdentifiersFormData
  >(`/staff/${staffId}/identifiers`, "PATCH");

  // Fetch roles for position dropdown
  const { data: roles = [] } = useQuery<RoleDTO[]>({
    queryKey: ["roles-active"],
    queryFn: async (): Promise<RoleDTO[]> => {
      const response = await apiClient<RoleDTO[]>("/role/active");
      return response.data || [];
    },
    enabled: open,
  });

  // Fetch active staff for supervisor dropdown
  const { data: staffList = [] } = useQuery<StaffSelectDTO[]>({
    queryKey: ["staff-select"],
    queryFn: async (): Promise<StaffSelectDTO[]> => {
      const response = await apiClient<StaffSelectDTO[]>("/staff/select");
      return response.data || [];
    },
    enabled: open,
  });

  // Fetch offices for office dropdown
  const { data: offices = [] } = useQuery<OfficeDTO[]>({
    queryKey: ["offices-active"],
    queryFn: async (): Promise<OfficeDTO[]> => {
      const response = await apiClient<OfficeDTO[]>("/office/active");
      return response.data || [];
    },
    enabled: open,
  });

  // Reset form when modal opens (but not on subsequent re-renders while open)
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      // Modal just opened
      reset(initialData);
      setShowSSN(false);
      setShowSuccess(false);
      updateIdentifiersMutation.reset();
    }
    previousOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: StaffIdentifiersFormData) => {
    try {
      // Normalize: required fields must be non-empty strings; optional -> undefined if empty
      const normalizedData: StaffIdentifiersFormData = {
        ...data,
        ssn: data.ssn.trim(),
        employeeId: data.employeeId.trim(),
        position: data.position.trim(),
        hireDate: data.hireDate.trim(),
        isActive: data.isActive,
        nationalProviderId: data.nationalProviderId?.trim() || undefined,
        supervisorId: data.supervisorId?.trim() || undefined,
        officeId: data.officeId?.trim() || undefined,
        effectiveDate: data.effectiveDate?.trim() || undefined,
      };
      
      await updateIdentifiersMutation.mutateAsync(normalizedData);

      // Show success message
      setShowSuccess(true);

      // Call onUpdateSuccess if provided
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      // Error is already handled by useApiMutation
      console.error("Failed to update identifiers:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    updateIdentifiersMutation.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closeIcon={null}
      width={600}
      className={formStyles.formModal}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            Edit Identifiers
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-[400px]"
        >
          <div className="flex-1 px-8 py-8 bg-theme-surface flex flex-col gap-6">
            {/* Row: SSN | Employee ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SSN */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  SSN <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="ssn"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="XXX-XX-XXXX"
                      status={errors.ssn ? "error" : ""}
                      className={formStyles.formInput}
                      visibilityToggle={{
                        visible: showSSN,
                        onVisibleChange: setShowSSN,
                      }}
                    />
                  )}
                />
                {errors.ssn && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.ssn.message}
                  </span>
                )}
              </div>

              {/* Employee ID */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter employee ID"
                      status={errors.employeeId ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.employeeId && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.employeeId.message}
                  </span>
                )}
              </div>
            </div>

            {/* Dates Row: Effective Date | Hire Date */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Effective Date */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Effective Date
                </label>
                <Controller
                  name="effectiveDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      placeholder="YYYY-MM-DD"
                      status={errors.effectiveDate ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.effectiveDate && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.effectiveDate.message as string}
                  </span>
                )}
              </div>

              {/* Hire Date */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Hire Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="hireDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      placeholder="YYYY-MM-DD"
                      status={errors.hireDate ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.hireDate && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.hireDate.message as string}
                  </span>
                )}
              </div>
            </div>

            {/* National Provider ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                National Provider ID
              </label>
              <Controller
                name="nationalProviderId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter national provider ID"
                    status={errors.nationalProviderId ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.nationalProviderId && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.nationalProviderId.message}
                </span>
              )}
            </div>

            {/* Row: Position | Office */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Position <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select position"
                      status={errors.position ? "error" : ""}
                      className={formStyles.formSelect}
                      options={roles.map((role: RoleDTO) => ({
                        value: role.name,
                        label: role.name,
                      }))}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
                {errors.position && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.position.message}
                  </span>
                )}
              </div>

              {/* Office */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Office
                </label>
                <Controller
                  name="officeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select office"
                      status={errors.officeId ? "error" : ""}
                      className={formStyles.formSelect}
                      options={offices.map((office: OfficeDTO) => ({
                        value: office.id,
                        label: office.name,
                      }))}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
                {errors.officeId && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.officeId.message}
                  </span>
                )}
              </div>
            </div>

            {/* Supervisor */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Supervisor
              </label>
              <Controller
                name="supervisorId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supervisor"
                    status={errors.supervisorId ? "error" : ""}
                    className={formStyles.formSelect}
                    options={staffList.map((staff: StaffSelectDTO) => ({
                      value: staff.id,
                      label: staff.displayName,
                    }))}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    allowClear
                  />
                )}
              />
              {errors.supervisorId && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.supervisorId.message}
                </span>
              )}
            </div>

            {/* Status (Active) */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Active
              </label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      className="form-switch"
                    />
                    <span className="text-sm text-theme-secondary">
                      {field.value ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              />
            </div>

            {/* Is Supervisor Switch - last */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Is Supervisor
              </label>
              <Controller
                name="isSupervisor"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      className="form-switch"
                    />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Error Message */}
          {updateIdentifiersMutation.error && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface">
              <p className="text-sm text-red-600 m-0">
                {updateIdentifiersMutation.error.message ||
                  "Failed to update identifiers. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Identifiers updated successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={updateIdentifiersMutation.isPending}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!isDirty || updateIdentifiersMutation.isPending}
              loading={updateIdentifiersMutation.isPending}
              className={buttonStyles.btnPrimary}
            >
              SAVE
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
