"use client";

import React from "react";
import { Modal, Button, Input } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/hooks/useApi";
import { identifiersSchema, type IdentifiersFormData } from "@/lib/validation/patientSchemas";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";

interface EditIdentifiersFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  initialData: {
    clientId: string;
    medicaidId: string;
    ssn: string;
    agencyId: string;
  };
  onUpdateSuccess?: () => void;
}

export default function EditIdentifiersForm({
  open,
  onClose,
  patientId,
  initialData,
  onUpdateSuccess,
}: EditIdentifiersFormProps) {
  const [showSSN, setShowSSN] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<IdentifiersFormData>({
    resolver: zodResolver(identifiersSchema),
    defaultValues: initialData,
  });

  const updateIdentifiersMutation = useApiMutation<
    unknown,
    IdentifiersFormData
  >(`/patients/${patientId}/identifiers`, "PATCH");

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

  const onSubmit = async (data: IdentifiersFormData) => {
    try {
      await updateIdentifiersMutation.mutateAsync(data);

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
            {/* Client ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Client ID
              </label>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter client ID"
                    status={errors.clientId ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.clientId && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.clientId.message}
                </span>
              )}
            </div>

            {/* Medicaid ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Medicaid ID
              </label>
              <Controller
                name="medicaidId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Medicaid ID"
                    status={errors.medicaidId ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.medicaidId && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.medicaidId.message}
                </span>
              )}
            </div>

            {/* SSN */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                SSN
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

            {/* Agency ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary mb-0">
                Agency ID
              </label>
              <Controller
                name="agencyId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter agency ID"
                    status={errors.agencyId ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.agencyId && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.agencyId.message}
                </span>
              )}
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
