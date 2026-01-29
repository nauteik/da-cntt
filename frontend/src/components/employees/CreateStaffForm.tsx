"use client";

import React from "react";
import { Modal, Button, Input, Select, Switch } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApiMutation } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { OfficeDTO } from "@/types/office";
import type { RoleDTO } from "@/types/role";
import { VALIDATION_REGEX, VALIDATION_MESSAGES, FIELD_CONSTRAINTS } from "@/lib/validation/validation";
import { useQueryClient } from "@tanstack/react-query";

// Validation schema matching CreateStaffDTO constraints
const createStaffSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX))
    .regex(/^[A-Za-z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
    .refine((val) => val.trim().length > 0, "First name cannot be only spaces"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(FIELD_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.NAME_MAX))
    .regex(/^[A-Za-z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .refine((val) => val.trim().length > 0, "Last name cannot be only spaces"),
  officeId: z.string().min(1, "Office is required"),
  roleId: z.string().min(1, "Role is required"),
  ssn: z
    .string()
    .min(1, "SSN is required")
    .regex(VALIDATION_REGEX.SSN, VALIDATION_MESSAGES.SSN_INVALID)
    .max(FIELD_CONSTRAINTS.SSN_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.SSN_MAX)),
  phone: z
    .string()
    .regex(VALIDATION_REGEX.PHONE, VALIDATION_MESSAGES.PHONE_INVALID)
    .max(FIELD_CONSTRAINTS.PHONE_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.PHONE_MAX))
    .optional()
    .or(z.literal("")),
  nationalProviderId: z
    .string()
    .max(50, "National Provider ID must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "Email is required")
    .email(VALIDATION_MESSAGES.EMAIL_INVALID)
    .max(FIELD_CONSTRAINTS.EMAIL_MAX, VALIDATION_MESSAGES.MAX_LENGTH(FIELD_CONSTRAINTS.EMAIL_MAX)),
  isSupervisor: z.boolean().optional(),
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
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isDirty },
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      officeId: undefined,
      roleId: undefined,
      ssn: "",
      phone: "",
      nationalProviderId: "",
      email: "",
      isSupervisor: false,
    },
  });

  const createStaffMutation = useApiMutation<
    { id: string; staffName: string },
    CreateStaffFormData
  >("/staff", "POST");

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      reset({
        firstName: "",
        lastName: "",
        officeId: undefined,
        roleId: undefined,
        ssn: "",
        phone: "",
        nationalProviderId: "",
        email: "",
        isSupervisor: false,
      });
      setShowSuccess(false);
      createStaffMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: CreateStaffFormData) => {
    const isValid = await trigger();
    if (!isValid) return;

    try {
      await createStaffMutation.mutateAsync(data);

      // Show success message
      setShowSuccess(true);
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["staff-list"] });

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
                  Phone
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
                    type="email"
                    placeholder="john.smith@example.com"
                    status={errors.email ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* Is Supervisor */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Is Supervisor
                </label>
                {errors.isSupervisor && (
                  <span className="text-xs text-red-500">
                    {errors.isSupervisor.message}
                  </span>
                )}
              </div>
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
                    <span className="text-sm text-theme-secondary">
                      {field.value ? "Yes" : "No"}
                    </span>
                  </div>
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
