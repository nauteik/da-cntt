"use client";

import React from "react";
import { Modal, Input, Button, App } from "antd";
import { CloseOutlined, CopyOutlined, CheckOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { staffApi } from "@/lib/api/staff";
import type { ResetPasswordResponse } from "@/lib/api/staff";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
}

export default function ResetPasswordModal({
  open,
  onClose,
  staffId,
  staffName,
}: ResetPasswordModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [resetData, setResetData] = React.useState<ResetPasswordResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const { message } = App.useApp();

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffApi.resetPassword(staffId);
      setResetData(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (resetData?.newPassword) {
      try {
        await navigator.clipboard.writeText(resetData.newPassword);
        setCopied(true);
        message.success("Password copied to clipboard");
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        message.error("Failed to copy password");
      }
    }
  };

  const handleClose = () => {
    setResetData(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  const getTitle = () => {
    if (loading) return "Resetting Password...";
    if (resetData) return "Password Reset Successful";
    if (error) return "Reset Failed";
    return "Confirm Password Reset";
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={null}
      width={550}
      className={formStyles.formModal}
      styles={{
        body: { padding: 0 },
      }}
      maskClosable={false}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            {getTitle()}
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleClose}
          />
        </div>

        {/* Content */}
        <div className="px-8 py-8 bg-theme-surface flex flex-col gap-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : resetData ? (
            /* Success State */
            <>
              <p className="text-sm text-theme-primary m-0">
                The password has been reset for{" "}
                <span className="font-semibold">{staffName}</span>.
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  New Password
                </label>
                <div className="flex gap-2">
                  <Input
                    value={resetData.newPassword}
                    readOnly
                    className={formStyles.formInput}
                    style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}
                  />
                  <Button
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={handleCopy}
                    className={buttonStyles.btnSecondary}
                    style={{
                      minWidth: "100px",
                      backgroundColor: copied ? "#52c41a" : undefined,
                      borderColor: copied ? "#52c41a" : undefined,
                      color: copied ? "white" : undefined,
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-theme-secondary m-0">
                  Please copy this password and share it with the employee securely.
                  This password will not be shown again.
                </p>
              </div>
            </>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-md border border-red-100">
                <ExclamationCircleOutlined className="text-xl" />
                <p className="text-sm m-0 flex-1">{error}</p>
              </div>
              <p className="text-sm text-theme-secondary m-0">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          ) : (
            /* Confirmation State */
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-md border border-amber-100">
                <ExclamationCircleOutlined className="text-xl text-amber-500 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-amber-800 m-0">
                    Are you sure you want to reset the password for {staffName}?
                  </p>
                  <p className="text-sm text-amber-700 m-0">
                    This will invalidate the current password and generate a new random one.
                    The new password will be displayed on the next screen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center px-8 py-4 border-t border-theme bg-theme-surface gap-3">
          {resetData ? (
            <Button
              type="primary"
              onClick={handleClose}
              className={buttonStyles.btnPrimary}
            >
              DONE
            </Button>
          ) : (
            <>
              <Button
                onClick={handleClose}
                className={buttonStyles.btnCancel}
                disabled={loading}
              >
                CANCEL
              </Button>
              {!error && (
                <Button
                  type="primary"
                  onClick={handleResetPassword}
                  className={buttonStyles.btnPrimary}
                  loading={loading}
                  danger
                >
                  RESET PASSWORD
                </Button>
              )}
              {error && (
                <Button
                  type="primary"
                  onClick={handleResetPassword}
                  className={buttonStyles.btnPrimary}
                >
                  TRY AGAIN
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
