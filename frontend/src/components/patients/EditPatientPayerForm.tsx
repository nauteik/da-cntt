"use client";

import React from "react";
import { Modal, Select, DatePicker, Button, Input, InputNumber, Empty } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { PayerDetailDTO, PayerSelectDTO, PatientProgramDTO, PayerAuthorizationDTO } from "@/types/patient";
import dayjs from "dayjs";
import { formatDate } from "@/lib/dateUtils";

interface EditPatientPayerFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientPayerId?: string;
  initialData?: PayerDetailDTO | null;
  onUpdateSuccess?: () => void;
}

interface PayerFormData {
  payerId: string;
  rank: number | null;
  groupNo: string;
  startDate: string;
  endDate: string;
}

export default function EditPatientPayerForm({
  open,
  onClose,
  patientId,
  patientPayerId,
  initialData,
  onUpdateSuccess,
}: EditPatientPayerFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);

  // Fetch payer options for select
  const { data: payerData, isLoading: isLoadingPayers } = useApiQuery<PayerSelectDTO[]>(
    ["payer", "select"],
    "/payer/select"
  );

  // Fetch authorizations for editing mode
  const { data: authorizationsData, isLoading: isLoadingAuthorizations } = useApiQuery<PayerAuthorizationDTO[]>(
    ["patient-payer-authorizations", patientId, patientPayerId],
    patientPayerId ? `/patients/${patientId}/payers/${patientPayerId}/authorizations` : "",
    { enabled: !!patientPayerId && open }
  );

  // Determine if creating or updating
  const isCreating = !patientPayerId;
  const endpoint = isCreating
    ? `/patients/${patientId}/payers`
    : `/patients/${patientId}/payers/${patientPayerId}`;
  const method = isCreating ? "POST" : "PATCH";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PayerFormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      payerId: "",
      rank: null,
      groupNo: "",
      startDate: "",
      endDate: "",
    },
  });

  const mutation = useApiMutation<PatientProgramDTO, PayerFormData>(
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

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      if (!payerData) {
        previousOpenRef.current = open;
        return;
      }

      // Find payer ID from payerIdentifier
      const currentPayer = payerData.find(
        (p) => p.payerIdentifier === initialData?.payerIdentifier
      );

      const formValues = {
        payerId: currentPayer?.id || "",
        rank: initialData?.rank ?? null,
        groupNo: initialData?.groupNo || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
      };

      reset(formValues);
      setShowSuccess(false);
      mutation.reset();
    }
    previousOpenRef.current = open;
  }, [open, initialData, reset, payerData, mutation]);

  const onSubmit = async (data: PayerFormData) => {
    // Only send non-null rank
    const payload = {
      ...data,
      rank: data.rank !== null ? data.rank : undefined,
    };
    await mutation.mutateAsync(payload as PayerFormData);
  };

  const handleCancel = () => {
    reset();
    setShowSuccess(false);
    mutation.reset();
    onClose();
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
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            {isCreating ? "Add Payer" : "Edit Payer"}
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
            {/* General Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-theme-primary m-0">General</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Payer Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Payer Name <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="payerId"
                    control={control}
                    rules={{ required: "Payer is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Select payer"
                        status={errors.payerId ? "error" : ""}
                        className={formStyles.formSelect}
                        loading={isLoadingPayers}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={
                          payerData?.map((payer) => ({
                            value: payer.id,
                            label: `${payer.payerIdentifier} - ${payer.payerName}`,
                          })) || []
                        }
                      />
                    )}
                  />
                  {errors.payerId && (
                    <span className="text-sm text-red-500">
                      {errors.payerId.message}
                    </span>
                  )}
                </div>

                {/* Medicaid ID (Read-only) */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-secondary">
                    Medicaid ID
                  </label>
                  <Input
                    value={initialData?.clientPayerId || "Auto-filled from patient"}
                    disabled
                    className={formStyles.formInputDisabled}
                  />
                </div>
              </div>

              {/* Rank */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Rank <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="rank"
                  control={control}
                  rules={{ required: "Rank is required" }}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      min={1}
                      max={9}
                      placeholder="Enter rank (1-9)"
                      status={errors.rank ? "error" : ""}
                      className={formStyles.formInput}
                      style={{ width: "100%" }}
                    />
                  )}
                />
                {errors.rank && (
                  <span className="text-sm text-red-500">
                    {errors.rank.message}
                  </span>
                )}
              </div>
            </div>

            {/* Numbers, Etc. Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-theme-primary m-0">Numbers, Etc.</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Client Payer ID (Read-only in edit) */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-secondary">
                    Client Payer ID
                  </label>
                  <Input
                    value={initialData?.clientPayerId || "Auto-filled from patient"}
                    disabled
                    className={formStyles.formInputDisabled}
                  />
                </div>

                {/* Group No */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Group No.
                  </label>
                  <Controller
                    name="groupNo"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter Group No."
                        className={formStyles.formInput}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Start Date
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                        placeholder="Select start date"
                        className={formStyles.formInput}
                        format="MM/DD/YYYY"
                      />
                    )}
                  />
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

            {/* Authorization Section - Only show when editing */}
            {!isCreating && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-theme-primary m-0">Authorization</h3>
                
                {isLoadingAuthorizations ? (
                  <div className="text-center py-4">Loading authorizations...</div>
                ) : authorizationsData && authorizationsData.length > 0 ? (
                  <div className="border border-theme rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-theme-surface">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-theme-primary">Service</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-theme-primary">Authorization No</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-theme-primary">Format</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-theme-primary">Max Units</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-theme-primary">Start Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-theme-primary">End Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {authorizationsData.map((auth, idx) => (
                          <tr key={idx} className="border-t border-theme">
                            <td className="px-4 py-2 text-theme-primary">{auth.serviceCode || "—"}</td>
                            <td className="px-4 py-2 text-theme-primary">{auth.authorizationNo || "—"}</td>
                            <td className="px-4 py-2 text-theme-primary">{auth.format || "—"}</td>
                            <td className="px-4 py-2 text-theme-primary">{auth.maxUnits ?? "—"}</td>
                            <td className="px-4 py-2 text-theme-primary">{formatDate(auth.startDate)}</td>
                            <td className="px-4 py-2 text-theme-primary">{formatDate(auth.endDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty description="No authorizations found for this payer" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {mutation.error && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface">
              <p className="text-sm text-red-600 m-0">
                {mutation.error?.message ||
                  "Failed to save payer. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Payer {isCreating ? "created" : "updated"} successfully!
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
              disabled={mutation.isPending}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className={buttonStyles.btnPrimary}
              disabled={!isDirty || mutation.isPending}
              loading={mutation.isPending}
            >
              {isCreating ? "CREATE" : "SAVE CHANGES"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

