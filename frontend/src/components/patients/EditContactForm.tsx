"use client";

import React from "react";
import { Modal, Input, Select, Checkbox, Button, App } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApi";
import { contactSchema, type ContactFormData } from "@/lib/validation/patientSchemas";
import { RELATIONSHIP_OPTIONS } from "@/lib/validation/validation";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { ContactDTO, PatientPersonalDTO } from "@/types/patient";

interface EditContactFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  initialData?: ContactDTO | null;
  onUpdateSuccess?: () => void;
}

export default function EditContactForm({
  open,
  onClose,
  patientId,
  initialData,
  onUpdateSuccess,
}: EditContactFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);
  const { modal } = App.useApp();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: initialData
      ? {
          relation: initialData.relation || "",
          firstName: initialData.name?.split(" ")[0] || "",
          lastName: initialData.name?.split(" ").slice(1).join(" ") || "",
          name: initialData.name || "",
          phone: initialData.phone || "",
          email: initialData.email || "",
          line1: initialData.line1 || "",
          line2: initialData.line2 || "",
          isPrimary: initialData.isPrimary || false,
        }
      : {
          relation: "",
          firstName: "",
          lastName: "",
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
        initialData
          ? {
              relation: initialData.relation || "",
              firstName: initialData.name?.split(" ")[0] || "",
              lastName: initialData.name?.split(" ").slice(1).join(" ") || "",
              name: initialData.name || "",
              phone: initialData.phone || "",
              email: initialData.email || "",
              line1: initialData.line1 || "",
              line2: initialData.line2 || "",
              isPrimary: initialData.isPrimary || false,
            }
          : {
              relation: "",
              firstName: "",
              lastName: "",
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
    ? `/patients/${patientId}/contacts`
    : `/patients/${patientId}/contacts/${initialData.id}`;
  const method = isCreating ? "POST" : "PATCH";

  const mutation = useApiMutation<PatientPersonalDTO, ContactFormData>(
    endpoint,
    method,
    {
      onSuccess: async () => {
        setShowSuccess(true);
        
        // Invalidate React Query cache to refetch updated data
        await queryClient.invalidateQueries({
          queryKey: ["patient-personal", patientId],
        });
        
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      },
    }
  );

  const deleteMutation = useApiMutation<PatientPersonalDTO, void>(
    `/patients/${patientId}/contacts/${initialData?.id}`,
    "DELETE",
    {
      onSuccess: async () => {
        setShowSuccess(true);
        
        // Invalidate React Query cache to refetch updated data
        await queryClient.invalidateQueries({
          queryKey: ["patient-personal", patientId],
        });
        
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

  const onSubmit = async (data: ContactFormData) => {
    // Combine firstName and lastName into name field for backend
    const submitData: ContactFormData = {
      ...data,
      name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
    };
    await mutation.mutateAsync(submitData);
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
            {/* Relation */}
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
                  {errors.relation.message || "Relation is required"}
                </span>
              )}
            </div>

            {/* First Name & Last Name (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
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
                  <span className="text-sm text-red-500">
                    {errors.firstName.message || "First name is required"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
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
                  <span className="text-sm text-red-500">
                    {errors.lastName.message || "Last name is required"}
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
                    {errors.phone.message || "Phone number is required"}
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
                  {errors.line1.message || "Address line 1 is invalid"}
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
                  {errors.line2.message || "Address line 2 is invalid"}
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
