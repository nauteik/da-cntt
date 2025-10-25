"use client";

import React from "react";
import { Modal, Button, Input, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApiMutation } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { OfficeDTO } from "@/types/office";
import type { RoleDTO } from "@/types/role";

// Validation schema matching CreateStaffDTO constraints
const createStaffSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
  officeId: z.string().min(1, "Office is required"),
  roleId: z.string().min(1, "Role is required"),
  ssn: z
    .string()
    .min(1, "SSN is required")
    .regex(/^\d{3}-?\d{2}-?\d{4}$/, "SSN must be in format XXX-XX-XXXX")
    .max(11, "SSN must not exceed 11 characters"),
  phone: z
    .string()
    .regex(
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      "Invalid phone number format"
    )
    .max(20, "Phone number must not exceed 20 characters"),
  nationalProviderId: z
    .string()
    .max(50, "National Provider ID must not exceed 50 characters")
    .optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters"),
});

type CreateStaffFormData = z.infer<typeof createStaffSchema>;

interface CreateStaffModalProps {
  open: boolean;
  onCancel: () => void;
  offices: OfficeDTO[];
  roles: RoleDTO[];
  onCreateSuccess: () => void;
}

export default function CreateStaffModal({
  open,
  onCancel,
  offices,
  roles,
  onCreateSuccess,
}: CreateStaffModalProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      officeId: "",
      roleId: "",
      ssn: "",
      phone: "",
      nationalProviderId: "",
      email: "",
    },
  });

  const createStaffMutation = useApiMutation<
    { id: string; staffName: string },
    CreateStaffFormData
  >("/staff", "POST");

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      reset();
      setShowSuccess(false);
      createStaffMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: CreateStaffFormData) => {
    try {
      await createStaffMutation.mutateAsync(data);

      // Show success message
      setShowSuccess(true);

      // Wait 1 second then close and refresh
      setTimeout(() => {
        setShowSuccess(false);
        onCancel();
        onCreateSuccess();
      }, 1000);
    } catch (error) {
      // Error is already handled by useApiMutation
      console.error("Failed to create staff:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    createStaffMutation.reset();
    onCancel();
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
        <div className="flex justify-between items-center px-8 py-6 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            New Employee
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex-1 px-8 py-6 bg-theme-surface flex flex-col gap-4">
            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Last Name <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.lastName && (
                  <span className="text-xs text-red-500">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="SMITH"
                    status={errors.lastName ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* First Name */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  First Name <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.firstName && (
                  <span className="text-xs text-red-500">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="JOHN"
                    status={errors.firstName ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* Office */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Office <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.officeId && (
                  <span className="text-xs text-red-500">
                    {errors.officeId.message}
                  </span>
                )}
              </div>
              <Controller
                name="officeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select an office"
                    status={errors.officeId ? "error" : ""}
                    className={formStyles.formSelect}
                    showSearch
                    optionFilterProp="label"
                    options={offices.map((office) => ({
                      label: office.name,
                      value: office.id,
                    }))}
                  />
                )}
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Role <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.roleId && (
                  <span className="text-xs text-red-500">
                    {errors.roleId.message}
                  </span>
                )}
              </div>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select a role"
                    status={errors.roleId ? "error" : ""}
                    className={formStyles.formSelect}
                    showSearch
                    optionFilterProp="label"
                    options={roles.map((role) => ({
                      label: role.name,
                      value: role.id,
                    }))}
                  />
                )}
              />
            </div>

            {/* SSN */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  SSN <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.ssn && (
                  <span className="text-xs text-red-500">
                    {errors.ssn.message}
                  </span>
                )}
              </div>
              <Controller
                name="ssn"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="123-45-6789"
                    status={errors.ssn ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Phone <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.phone && (
                  <span className="text-xs text-red-500">
                    {errors.phone.message}
                  </span>
                )}
              </div>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="(215) 555-1234"
                    status={errors.phone ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* National Provider ID */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  National Provider ID
                </label>
                {errors.nationalProviderId && (
                  <span className="text-xs text-red-500">
                    {errors.nationalProviderId.message}
                  </span>
                )}
              </div>
              <Controller
                name="nationalProviderId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1234567890"
                    status={errors.nationalProviderId ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Email <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="john.smith@example.com"
                    status={errors.email ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>
          </div>

          {/* Error Message */}
          {createStaffMutation.error && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface ">
              <p className="text-sm text-red-600 m-0">
                {createStaffMutation.error.message ||
                  "Failed to create employee. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550]">
                Employee created successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={createStaffMutation.isPending}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!isDirty || createStaffMutation.isPending}
              loading={createStaffMutation.isPending}
              className={buttonStyles.btnPrimary}
            >
              CREATE EMPLOYEE
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
