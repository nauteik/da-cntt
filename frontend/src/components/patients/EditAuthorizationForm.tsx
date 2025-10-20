"use client";

import React from "react";
import { Modal, Select, DatePicker, Button, Input, InputNumber, App } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useApiMutation } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type {
  AuthorizationDTO,
  PatientProgramDTO,
  ServiceDetailDTO,
  PayerDetailDTO,
} from "@/types/patient";
import dayjs from "dayjs";

interface EditAuthorizationFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  authorizationId?: string;
  initialData?: AuthorizationDTO | null;
  services: ServiceDetailDTO[];
  payers: PayerDetailDTO[];
  onUpdateSuccess?: () => void;
}

interface AuthorizationFormData {
  patientServiceId: string;
  patientPayerId: string;
  authorizationNo: string;
  eventCode: string;
  format: string;
  maxUnits: number | null;
  startDate: string;
  endDate: string;
  comments: string;
}

export default function EditAuthorizationForm({
  open,
  onClose,
  patientId,
  authorizationId,
  initialData,
  services,
  payers,
  onUpdateSuccess,
}: EditAuthorizationFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);
  const { modal } = App.useApp();

  // Determine if creating or updating
  const isCreating = !authorizationId;
  const endpoint = isCreating
    ? `/patients/${patientId}/authorizations`
    : `/patients/${patientId}/authorizations/${authorizationId}`;
  const method = isCreating ? "POST" : "PATCH";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AuthorizationFormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      patientServiceId: "",
      patientPayerId: "",
      authorizationNo: "",
      eventCode: "",
      format: "units",
      maxUnits: null,
      startDate: "",
      endDate: "",
      comments: "",
    },
  });

  const mutation = useApiMutation<PatientProgramDTO, AuthorizationFormData>(
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

  const deleteMutation = useApiMutation<PatientProgramDTO, void>(
    `/patients/${patientId}/authorizations/${authorizationId}`,
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
      // Find service and payer IDs from codes/identifiers
      const currentService = services.find(
        (s) => s.serviceCode === initialData?.serviceCode
      );
      const currentPayer = payers.find(
        (p) => p.payerIdentifier === initialData?.payerIdentifier
      );

      const formValues = {
        patientServiceId: currentService?.patientServiceId || "",
        patientPayerId: currentPayer?.patientPayerId || "",
        authorizationNo: initialData?.authorizationNo || "",
        eventCode: initialData?.eventCode || "",
        format: initialData?.format || "units",
        maxUnits: initialData?.maxUnits ?? null,
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
        comments: initialData?.comments || "",
      };

      reset(formValues);
      setShowSuccess(false);
      mutation.reset();
    }
    previousOpenRef.current = open;
  }, [open, initialData, reset, services, payers, mutation]);

  const onSubmit = async (data: AuthorizationFormData) => {
    // Only send non-null maxUnits
    const payload = {
      ...data,
      maxUnits: data.maxUnits !== null ? data.maxUnits : undefined,
    };
    await mutation.mutateAsync(payload as AuthorizationFormData);
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    mutation.reset();
    deleteMutation.reset();
    onClose();
  };

  const handleDelete = () => {
    if (!authorizationId) return;

    modal.confirm({
      title: "Remove Authorization",
      content: "Are you sure you want to remove this authorization? This action cannot be undone.",
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
      width={900}
      className={formStyles.formModal}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="flex flex-col h-[85vh]">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface flex-shrink-0">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            {isCreating ? "Add Authorization" : "Edit Authorization"}
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-8 pt-4 pb-8 bg-theme-surface flex flex-col">
            {/* Required Note */}
            <p className="text-sm text-red-500 m-0 mb-4">* Required</p>

            {/* General Info Section */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-base font-bold text-theme-primary m-0">General Info</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Service */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="patientServiceId"
                    control={control}
                    rules={{ required: "Service is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Select service"
                        status={errors.patientServiceId ? "error" : ""}
                        className={formStyles.formSelect}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={
                          services?.map((service) => ({
                            value: service.patientServiceId,
                            label: service.serviceCode,
                          })) || []
                        }
                      />
                    )}
                  />
                  {errors.patientServiceId && (
                    <span className="text-sm text-red-500">
                      {errors.patientServiceId.message}
                    </span>
                  )}
                </div>

                {/* Payer */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Payer <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="patientPayerId"
                    control={control}
                    rules={{ required: "Payer is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Select payer"
                        status={errors.patientPayerId ? "error" : ""}
                        className={formStyles.formSelect}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={
                          payers?.map((payer) => ({
                            value: payer.patientPayerId,
                            label: payer.payerIdentifier,
                          })) || []
                        }
                      />
                    )}
                  />
                  {errors.patientPayerId && (
                    <span className="text-sm text-red-500">
                      {errors.patientPayerId.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Authorization Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Authorization Number <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="authorizationNo"
                    control={control}
                    rules={{ required: "Authorization number is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter authorization number"
                        status={errors.authorizationNo ? "error" : ""}
                        className={formStyles.formInput}
                      />
                    )}
                  />
                  {errors.authorizationNo && (
                    <span className="text-sm text-red-500">
                      {errors.authorizationNo.message}
                    </span>
                  )}
                </div>

                {/* Event Code */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Event Code
                  </label>
                  <Controller
                    name="eventCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter event code"
                        className={formStyles.formInput}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Format Section */}
            <div className="flex flex-col gap-2 mt-6">
              <label className="text-sm font-medium text-theme-primary">
                Format <span className="text-red-500">*</span>
              </label>
              <Controller
                name="format"
                control={control}
                rules={{ required: "Format is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Select format"
                    status={errors.format ? "error" : ""}
                    className={formStyles.formSelect}
                    options={[
                      { value: "units", label: "Units" }
                    //   { value: "hours", label: "Hours" },
                    //   { value: "days", label: "Days" },
                    //   { value: "sessions", label: "Sessions" },
                    ]}
                  />
                )}
              />
              {errors.format && (
                <span className="text-sm text-red-500">
                  {errors.format.message}
                </span>
              )}
            </div>

            {/* Date Range Section */}
            <div className="flex flex-col gap-4 mt-6">
              <h3 className="text-base font-bold text-theme-primary m-0">Date Range</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: "Start date is required" }}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                        placeholder="Select start date"
                        status={errors.startDate ? "error" : ""}
                        className={formStyles.formInput}
                        format="MM/DD/YYYY"
                      />
                    )}
                  />
                  {errors.startDate && (
                    <span className="text-sm text-red-500">
                      {errors.startDate.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    End Date
                  </label>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                        placeholder="Select end date"
                        className={formStyles.formInput}
                        format="MM/DD/YYYY"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Additional Section */}
            <div className="flex flex-col gap-2 mt-6">
              <label className="text-sm font-medium text-theme-primary">
                Comments
              </label>
              <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter comments"
                    className={formStyles.formInput}
                  />
                )}
              />
            </div>

            {/* Authorization Limitation Section */}
            <div className="flex flex-col gap-3 mt-6">
              <h3 className="text-base font-bold text-theme-primary m-0">Authorization Limitation</h3>
              
              <div className="rounded-sm px-1">
                {/* Overall Limit header - Only show when editing */}
                {!isCreating && initialData && (
                  <h4 className="text-sm font-medium text-theme-secondary mb-3">Overall Limit</h4>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Maximum field - always visible */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-theme-primary">
                      Maximum <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="maxUnits"
                      control={control}
                      rules={{ required: "Maximum is required" }}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={0}
                          placeholder="Enter maximum units"
                          status={errors.maxUnits ? "error" : ""}
                          className={formStyles.formInput}
                          style={{ width: "100%" }}
                        />
                      )}
                    />
                    {errors.maxUnits && (
                      <span className="text-sm text-red-500">
                        {errors.maxUnits.message}
                      </span>
                    )}
                  </div>

                  {/* Overall Limit stats - Only show when editing */}
                  {!isCreating && initialData ? (
                    <div className="grid grid-cols-3 gap-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-theme-secondary">Total Used</span>
                        <span className="text-base font-semibold text-theme-primary">
                          {initialData.totalUsed ?? 0.00}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-theme-secondary">Total Missed</span>
                        <span className="text-base font-semibold text-theme-primary">
                          {initialData.totalMissed ?? 0.00}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-theme-secondary">Total Remaining</span>
                        <span className="text-base font-semibold text-[var(--primary)]">
                          {initialData.totalRemaining ?? 0.00}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0">
            {/* Error Message */}
            {(mutation.error || deleteMutation.error) && !showSuccess && (
              <div className="px-8 py-3 bg-theme-surface border-t border-theme">
                <p className="text-sm text-red-600 m-0">
                  {mutation.error?.message || deleteMutation.error?.message ||
                    "Failed to save authorization. Please try again."}
                </p>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="px-8 py-3 bg-theme-surface border-t border-theme flex items-center gap-2">
                <p className="text-sm text-green-600 font-[550] m-0">
                  Authorization {deleteMutation.isSuccess ? "deleted" : isCreating ? "created" : "updated"} successfully!
                </p>
              </div>
            )}

            {/* Action Buttons */}
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
          </div>
        </form>
      </div>
    </Modal>
  );
}

