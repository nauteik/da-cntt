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

// Validation schema matching CreatePatientDTO constraints
const createClientSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
  officeId: z.string().min(1, "Office is required"),
  programIdentifier: z
    .string()
    .min(1, "Program is required")
    .max(50, "Program must not exceed 50 characters"),
  payerIdentifier: z
    .string()
    .min(1, "Payer is required")
    .max(50, "Payer must not exceed 50 characters"),
  medicaidId: z
    .string()
    .min(1, "Medicaid ID is required")
    .max(50, "Medicaid ID must not exceed 50 characters"),
  phone: z
    .string()
    .regex(
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      "Invalid phone number format"
    )
    .max(20, "Phone number must not exceed 20 characters")
    .optional()
    .or(z.literal("")),
});

type CreateClientFormData = z.infer<typeof createClientSchema>;

interface CreateClientModalProps {
  open: boolean;
  onCancel: () => void;
  offices: OfficeDTO[];
  onCreateSuccess: () => void;
}

export default function CreateClientModal({
  open,
  onCancel,
  offices,
  onCreateSuccess,
}: CreateClientModalProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      officeId: "",
      programIdentifier: "",
      payerIdentifier: "",
      medicaidId: "",
      phone: "",
    },
  });

  const createPatientMutation = useApiMutation<
    { id: string; clientName: string },
    CreateClientFormData
  >("/patients", "POST");

  // Watch the programIdentifier field to auto-fill payerIdentifier
  const programIdentifier = watch("programIdentifier");

  React.useEffect(() => {
    if (programIdentifier) {
      // Auto-fill payer as "PA" + Program (e.g., ODP -> PAODP)
      const autoPayerId = "PA" + programIdentifier;
      setValue("payerIdentifier", autoPayerId, { shouldDirty: true });
    }
  }, [programIdentifier, setValue]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      reset();
      setShowSuccess(false);
      createPatientMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: CreateClientFormData) => {
    try {
      await createPatientMutation.mutateAsync(data);

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
      console.error("Failed to create client:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    createPatientMutation.reset();
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
            New Client
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
                    placeholder="TRAN"
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
                    placeholder="MINH"
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

            {/* Program */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Program <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.programIdentifier && (
                  <span className="text-xs text-red-500">
                    {errors.programIdentifier.message}
                  </span>
                )}
              </div>
              <Controller
                name="programIdentifier"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    placeholder="ODP"
                    status={errors.programIdentifier ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* Payer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Payer <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.payerIdentifier && (
                  <span className="text-xs text-red-500">
                    {errors.payerIdentifier.message}
                  </span>
                )}
              </div>
              <Controller
                name="payerIdentifier"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    placeholder="PAODP"
                    status={errors.payerIdentifier ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* Medicaid ID */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-primary mb-0">
                  Medicaid ID <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.medicaidId && (
                  <span className="text-xs text-red-500">
                    {errors.medicaidId.message}
                  </span>
                )}
              </div>
              <Controller
                name="medicaidId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="123456789"
                    status={errors.medicaidId ? "error" : ""}
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
                    placeholder="(124) 554-5654"
                    status={errors.phone ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>
          </div>

          {/* Error Message */}
          {createPatientMutation.error && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface ">
              <p className="text-sm text-red-600 m-0">
                {createPatientMutation.error.message ||
                  "Failed to create client. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550]">
                Client created successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={createPatientMutation.isPending}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!isDirty || createPatientMutation.isPending}
              loading={createPatientMutation.isPending}
              className={buttonStyles.btnPrimary}
            >
              CREATE CLIENT
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
