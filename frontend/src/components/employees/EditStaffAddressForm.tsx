"use client";

import React from "react";
import { Modal, Input, Select, Checkbox, Button, App } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/hooks/useApi";
import { staffAddressSchema, type StaffAddressFormData } from "@/lib/validation/staffSchemas";
import { ADDRESS_TYPES, US_STATES } from "@/lib/validation/validation";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { StaffAddressDTO, StaffPersonalDTO } from "@/types/staff";

interface EditStaffAddressFormProps {
  open: boolean;
  onClose: () => void;
  staffId: string;
  initialData?: StaffAddressDTO | null;
  onUpdateSuccess?: () => void;
}

export default function EditStaffAddressForm({
  open,
  onClose,
  staffId,
  initialData,
  onUpdateSuccess,
}: EditStaffAddressFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);
  const { modal } = App.useApp();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StaffAddressFormData>({
    resolver: zodResolver(staffAddressSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      label: "",
      type: undefined,
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      county: "",
      phone: "",
      email: "",
      isMain: false,
    },
  });

  // Determine if creating or updating based on initialData.id
  const isCreating = !initialData?.id;
  const endpoint = isCreating
    ? `/staff/${staffId}/addresses`
    : `/staff/${staffId}/addresses/${initialData.id}`;
  const method = isCreating ? "POST" : "PATCH";

  const mutation = useApiMutation<StaffPersonalDTO, StaffAddressFormData>(
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
    `/staff/${staffId}/addresses/${initialData?.id}`,
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

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      // Transform incoming data to match form's expected enum values (uppercase)
      const formValues = initialData
        ? {
            ...initialData,
            type: initialData.type?.toUpperCase() as "HOME" | "COMMUNITY" | "SENIOR" | "BUSINESS" | undefined,
          }
        : {
            label: "",
            type: undefined,
            line1: "",
            line2: "",
            city: "",
            state: "",
            postalCode: "",
            county: "",
            phone: "",
            email: "",
            isMain: false,
          };

      reset(formValues);
      setShowSuccess(false);
      mutation.reset();
    }
    previousOpenRef.current = open;
  }, [open, initialData, reset, mutation]);

  const onSubmit = async (data: StaffAddressFormData) => {
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
      title: "Remove Address",
      content: "Are you sure you want to remove this address? This action cannot be undone.",
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
            {initialData ? "Edit Address" : "Add Address"}
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
            {/* Address Label & Address Type (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Address Label
                </label>
                <Controller
                  name="label"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g., Home, Work"
                      className={formStyles.formInput}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select address type"
                      status={errors.type ? "error" : ""}
                      className={formStyles.formSelect}
                      options={ADDRESS_TYPES}
                    />
                  )}
                />
                {errors.type && (
                  <span className="text-sm text-red-500">
                    {errors.type.message}
                  </span>
                )}
              </div>
            </div>

            {/* Address Line 1 & Line 2 (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Address Line 1 <span className="text-red-500">*</span>
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
                      placeholder="Apt, Suite, Unit, etc."
                      className={formStyles.formInput}
                    />
                  )}
                />
              </div>
            </div>

            {/* City & State (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  City <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter city"
                      status={errors.city ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.city && (
                  <span className="text-sm text-red-500">
                    {errors.city.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  State <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select state"
                      status={errors.state ? "error" : ""}
                      className={formStyles.formSelect}
                      options={US_STATES}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
                {errors.state && (
                  <span className="text-sm text-red-500">
                    {errors.state.message}
                  </span>
                )}
              </div>
            </div>

            {/* ZIP Code & County (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="XXXXX or XXXXX-XXXX"
                      status={errors.postalCode ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.postalCode && (
                  <span className="text-sm text-red-500">
                    {errors.postalCode.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  County <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="county"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter county"
                      status={errors.county ? "error" : ""}
                      className={formStyles.formInput}
                    />
                  )}
                />
                {errors.county && (
                  <span className="text-sm text-red-500">
                    {errors.county.message}
                  </span>
                )}
              </div>
            </div>

            {/* Phone Number & Email (2 columns) */}
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

            {/* Is Main Address Checkbox */}
            <div className="flex items-center gap-2">
              <Controller
                name="isMain"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    <span className="text-sm text-theme-primary">
                      Set as main address
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
                  "Failed to update address. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Address {deleteMutation.isSuccess ? "removed" : isCreating ? "created" : "updated"} successfully!
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
