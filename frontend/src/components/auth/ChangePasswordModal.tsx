"use client";

import React from "react";
import { Modal, Input, Button } from "antd";
import { CloseOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { staffApi } from "@/lib/api/staff";
import type { ChangePasswordRequest } from "@/lib/api/staff";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";

// Validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const previousOpenRef = React.useRef(open);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowSuccess(false);
      setError(null);
    }
    previousOpenRef.current = open;
  }, [open, reset]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await staffApi.changePassword(data as ChangePasswordRequest);
      
      setShowSuccess(true);
      
      // Hide success message and close modal after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        reset();
        onClose();
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closeIcon={null}
      width={500}
      className={formStyles.formModal}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            Change Password
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex-1 px-8 py-8 bg-theme-surface flex flex-col gap-6">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Current Password <span className="text-red-500">*</span>
              </label>
              <Controller
                name="currentPassword"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Enter current password"
                    className={formStyles.formInput}
                    status={errors.currentPassword ? "error" : ""}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                )}
              />
              {errors.currentPassword && (
                <span className="text-sm text-red-500">
                  {errors.currentPassword.message}
                </span>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                New Password <span className="text-red-500">*</span>
              </label>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Enter new password (min 6 characters)"
                    className={formStyles.formInput}
                    status={errors.newPassword ? "error" : ""}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                )}
              />
              {errors.newPassword && (
                <span className="text-sm text-red-500">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Confirm new password"
                    className={formStyles.formInput}
                    status={errors.confirmPassword ? "error" : ""}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                )}
              />
              {errors.confirmPassword && (
                <span className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface">
              <p className="text-sm text-red-600 m-0">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Password changed successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={isSubmitting}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className={buttonStyles.btnPrimary}
              disabled={!isDirty || isSubmitting}
              loading={isSubmitting}
            >
              CHANGE PASSWORD
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
