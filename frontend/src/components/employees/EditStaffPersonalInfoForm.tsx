"use client";

import React from "react";
import { Modal, Button, Input, Select, DatePicker } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs, { Dayjs } from "dayjs";
import { useApiMutation } from "@/hooks/useApi";
import { staffPersonalInfoSchema, type StaffPersonalInfoFormData } from "@/lib/validation/staffSchemas";
import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/validation/validation";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";

interface EditStaffPersonalInfoFormProps {
  open: boolean;
  onClose: () => void;
  staffId: string;
  initialData: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    primaryLanguage: string;
  };
  onUpdateSuccess?: () => void;
}

export default function EditStaffPersonalInfoForm({
  open,
  onClose,
  staffId,
  initialData,
  onUpdateSuccess,
}: EditStaffPersonalInfoFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StaffPersonalInfoFormData>({
    resolver: zodResolver(staffPersonalInfoSchema),
    defaultValues: initialData,
  });

  const updatePersonalMutation = useApiMutation<unknown, StaffPersonalInfoFormData>(
    `/staff/${staffId}/personal`,
    "PATCH"
  );

  // Reset form when modal opens (but not on subsequent re-renders while open)
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      // Modal just opened
      reset(initialData);
      setShowSuccess(false);
      updatePersonalMutation.reset();
    }
    previousOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: StaffPersonalInfoFormData) => {
    try {
      await updatePersonalMutation.mutateAsync(data);

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
      console.error("Failed to update personal information:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    updatePersonalMutation.reset();
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
            Edit Personal Information
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-[500px]"
        >
          <div className="flex-1 px-8 py-8 bg-theme-surface flex flex-col gap-6">
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                First Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter first name"
                    status={errors.firstName ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.firstName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter last name"
                    status={errors.lastName ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.lastName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.lastName.message}
                </span>
              )}
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Date of Birth
              </label>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date: Dayjs | null) => {
                      field.onChange(date ? date.format("YYYY-MM-DD") : "");
                    }}
                    format="MM/DD/YYYY"
                    placeholder="Select date of birth"
                    status={errors.dob ? "error" : ""}
                    className={formStyles.formDatePicker}
                    style={{ width: "100%" }}
                  />
                )}
              />
              {errors.dob && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.dob.message}
                </span>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Gender
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select gender"
                    status={errors.gender ? "error" : ""}
                    className={formStyles.formSelect}
                    options={GENDER_OPTIONS}
                  />
                )}
              />
              {errors.gender && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.gender.message}
                </span>
              )}
            </div>

            {/* Primary Language */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Primary Language
              </label>
              <Controller
                name="primaryLanguage"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select primary language"
                    status={errors.primaryLanguage ? "error" : ""}
                    className={formStyles.formSelect}
                    showSearch
                    options={LANGUAGE_OPTIONS}
                  />
                )}
              />
              {errors.primaryLanguage && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.primaryLanguage.message}
                </span>
              )}
            </div>

          </div>

          {/* Error Message */}
          {updatePersonalMutation.error && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface">
              <p className="text-sm text-red-600 m-0">
                {updatePersonalMutation.error.message ||
                  "Failed to update personal information. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Personal information updated successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={updatePersonalMutation.isPending}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!isDirty || updatePersonalMutation.isPending}
              loading={updatePersonalMutation.isPending}
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
