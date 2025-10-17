"use client";

import React from "react";
import { Modal, Select, DatePicker, Button, App } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { ServiceDetailDTO, ServiceTypeSelectDTO, PatientProgramDTO } from "@/types/patient";
import dayjs from "dayjs";

interface EditPatientServiceFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  serviceId?: string;
  initialData?: ServiceDetailDTO | null;
  onUpdateSuccess?: () => void;
}

interface ServiceFormData {
  serviceTypeId: string;
  startDate: string;
  endDate: string;
}

export default function EditPatientServiceForm({
  open,
  onClose,
  patientId,
  serviceId,
  initialData,
  onUpdateSuccess,
}: EditPatientServiceFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);
  const { modal } = App.useApp();

  // Fetch service types for select
  const { data: serviceTypesData, isLoading: isLoadingServiceTypes } = useApiQuery<ServiceTypeSelectDTO[]>(
    ["service-types", "select"],
    "/services/select"
  );

  // Determine if creating or updating
  const isCreating = !serviceId;
  const endpoint = isCreating
    ? `/patients/${patientId}/services`
    : `/patients/${patientId}/services/${serviceId}`;
  const method = isCreating ? "POST" : "PATCH";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ServiceFormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      serviceTypeId: "",
      startDate: "",
      endDate: "",
    },
  });

  const mutation = useApiMutation<PatientProgramDTO, ServiceFormData>(
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
    `/patients/${patientId}/services/${serviceId}`,
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
      if (!serviceTypesData) {
        previousOpenRef.current = open;
        return;
      }

      // Find service type ID from code
      const currentServiceType = serviceTypesData.find(
        (st) => st.code === initialData?.serviceCode
      );

      const formValues = {
        serviceTypeId: currentServiceType?.id || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
      };

      reset(formValues);
      setShowSuccess(false);
      mutation.reset();
    }
    previousOpenRef.current = open;
  }, [open, initialData, reset, serviceTypesData, mutation]);

  const onSubmit = async (data: ServiceFormData) => {
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
    if (!serviceId) return;

    modal.confirm({
      title: "Remove Service",
      content: "Are you sure you want to remove this service? This action cannot be undone.",
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
            {isCreating ? "Add Service" : "Edit Service"}
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
            {/* Service Type */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Service Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="serviceTypeId"
                control={control}
                rules={{ required: "Service type is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Select service type"
                    status={errors.serviceTypeId ? "error" : ""}
                    className={formStyles.formSelect}
                    loading={isLoadingServiceTypes}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={
                      serviceTypesData?.map((st) => ({
                        value: st.id,
                        label: `${st.code} - ${st.name}`,
                      })) || []
                    }
                  />
                )}
              />
              {errors.serviceTypeId && (
                <span className="text-sm text-red-500">
                  {errors.serviceTypeId.message}
                </span>
              )}
            </div>

            {/* Start Date & End Date */}
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

          {/* Error Message */}
          {(mutation.error || deleteMutation.error) && !showSuccess && (
            <div className="px-8 py-3 bg-theme-surface">
              <p className="text-sm text-red-600 m-0">
                {mutation.error?.message || deleteMutation.error?.message ||
                  "Failed to update service. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="px-8 py-3 bg-theme-surface flex items-center gap-2">
              <p className="text-sm text-green-600 font-[550] m-0">
                Service {deleteMutation.isSuccess ? "removed" : isCreating ? "created" : "updated"} successfully!
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

