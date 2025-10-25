"use client";

import React from "react";
import { Modal, Input, Select, Checkbox, Button, App } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/hooks/useApi";
import { staffContactSchema, type StaffContactFormData } from "@/lib/validation/staffSchemas";
import { RELATIONSHIP_OPTIONS } from "@/lib/validation/validation";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { StaffContactDTO, StaffPersonalDTO } from "@/types/staff";

interface EditStaffContactFormProps {
  open: boolean;
  onClose: () => void;
  staffId: string;
  initialData?: StaffContactDTO | null;
  onUpdateSuccess?: () => void;
}

export default function EditStaffContactForm({
  open,
  onClose,
  staffId,
  initialData,
  onUpdateSuccess,
}: EditStaffContactFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);
  const { modal } = App.useApp();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StaffContactFormData>({
    resolver: zodResolver(staffContactSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: initialData || {
      relation: "",
      name: "",
      phone: "",
      email: "",
      line1: "",
      line2: "",
      isPrimary: false,
    },
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      reset(
        initialData || {
          relation: "",
          name: "",
          phone: "",
          email: "",
          line1: "",
          line2: "",
          isPrimary: false,
        }
      );
      setShowSuccess(false);
    }
    previousOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Determine if creating or updating based on initialData.id
  const isCreating = !initialData?.id;
  const endpoint = isCreating
    ? `/staff/${staffId}/contacts`
    : `/staff/${staffId}/contacts/${initialData.id}`;
  const method = isCreating ? "POST" : "PATCH";

  const mutation = useApiMutation<StaffPersonalDTO, StaffContactFormData>(
    endpoint,
    method,
    {
      onSuccess: () => {
        setShowSuccess(true);
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      },
    }
  );

  const deleteMutation = useApiMutation<StaffPersonalDTO, void>(
    `/staff/${staffId}/contacts/${initialData?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        setShowSuccess(true);
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      },
    }
  );

  const onSubmit = async (data: StaffContactFormData) => {
    await mutation.mutateAsync(data);
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    mutation.reset();
    deleteMutation.reset();
    onClose();
  };

  const handleDelete = () => {
    if (!initialData?.id) return;

    modal.confirm({
      title: "Delete Contact",
      content: "Are you sure you want to remove this contact? This action cannot be undone.",
      okText: "REMOVE",
      okType: "danger",
      cancelText: "CANCEL",
      centered: true,
      okButtonProps: {
        className: buttonStyles.btnDanger,
      },
      cancelButtonProps: {
        className: buttonStyles.btnCancel,
      },
      onOk: () => {
        deleteMutation.mutate();
      },
    });
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closeIcon={null}
      width={700}
      className={formStyles.formModal}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            {initialData ? "Edit Contact" : "Add Contact"}
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-[450px]"
        >
          <div className="flex-1 px-8 py-8 bg-theme-surface flex flex-col gap-6">
            {/* Relation & Name (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Relation <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="relation"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select relationship"
                      status={errors.relation ? "error" : ""}
                      className={formStyles.formSelect}
                      options={RELATIONSHIP_OPTIONS}
                    />
                  )}
                />
                {errors.relation && (
                  <span className="text-sm text-red-500">
                    {errors.relation.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter full name"
                      status={errors.name ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>

            {/* Phone & Email (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="XXX-XXX-XXXX"
                      status={errors.phone ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.phone && (
                  <span className="text-sm text-red-500">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Email
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                      status={errors.email ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.email && (
                  <span className="text-sm text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Address Line 1
              </label>
              <Controller
                name="line1"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter street address"
                    status={errors.line1 ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.line1 && (
                <span className="text-sm text-red-500">
                  {errors.line1.message}
                </span>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Address Line 2
              </label>
              <Controller
                name="line2"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter apartment, suite, etc. (optional)"
                    status={errors.line2 ? "error" : ""}
                    className={formStyles.formInput}
                  />
                )}
              />
              {errors.line2 && (
                <span className="text-sm text-red-500">
                  {errors.line2.message}
                </span>
              )}
            </div>

            {/* Is Primary Contact Checkbox */}
            <div className="flex items-center gap-2">
              <Controller
                name="isPrimary"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    <span className="text-sm text-theme-primary">
                      Set as primary emergency contact
                    </span>
                  </Checkbox>
                )}
              />
            </div>
          </div>

          {/* Error Message */}
          {(mutation.error || deleteMutation.error) && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface">
              <p className="text-sm text-red-600 m-0">
                {mutation.error?.message || deleteMutation.error?.message ||
                  "Failed to update contact. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Contact {deleteMutation.isSuccess ? "removed" : isCreating ? "created" : "updated"} successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={mutation.isPending || deleteMutation.isPending}
            >
              CANCEL
            </Button>
            <div className="flex gap-3">
              {!isCreating && (
                <Button
                  onClick={handleDelete}
                  className={buttonStyles.btnDanger}
                  disabled={mutation.isPending || deleteMutation.isPending}
                  loading={deleteMutation.isPending}
                >
                  REMOVE
                </Button>
              )}
              <Button
                type="primary"
                htmlType="submit"
                className={buttonStyles.btnPrimary}
                disabled={!isDirty || mutation.isPending || deleteMutation.isPending}
                loading={mutation.isPending}
              >
                {isCreating ? "CREATE" : "SAVE CHANGES"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
