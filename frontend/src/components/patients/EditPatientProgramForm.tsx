"use client";

import React from "react";
import { Modal, Input, Select, DatePicker, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { ProgramDetailDTO, StaffSelectDTO, ProgramSelectDTO, PatientProgramDTO } from "@/types/patient";
import dayjs from "dayjs";

interface EditPatientProgramFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  initialData?: ProgramDetailDTO | null;
  onUpdateSuccess?: () => void;
}

interface ProgramFormData {
  programId: string;
  supervisorId: string;
  enrollmentDate: string;
  statusEffectiveDate: string;
  socDate: string;
  eocDate: string;
  eligibilityBeginDate: string;
  eligibilityEndDate: string;
  reasonForChange: string;
}

interface ProgramUpdatePayload {
  programId: string;
  supervisorId: string;
  enrollmentDate: string;
  statusEffectiveDate: string;
  socDate: string;
  eocDate: string;
  eligibilityBeginDate: string;
  eligibilityEndDate: string;
  reasonForChange?: string;
}

export default function EditPatientProgramForm({
  open,
  onClose,
  patientId,
  initialData,
  onUpdateSuccess,
}: EditPatientProgramFormProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const previousOpenRef = React.useRef(open);

  // Fetch staff list for supervisor select
  const { data: staffData, isLoading: isLoadingStaff } = useApiQuery<StaffSelectDTO[]>(
    ["staff", "select"],
    "/staff/select"
  );

  // Fetch program list for program select
  const { data: programData, isLoading: isLoadingPrograms } = useApiQuery<ProgramSelectDTO[]>(
    ["program", "select"],
    "/program/select"
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProgramFormData>({
    mode: "onBlur",
    defaultValues: {
      programId: "",
      supervisorId: "",
      enrollmentDate: "",
      statusEffectiveDate: "",
      socDate: "",
      eocDate: "",
      eligibilityBeginDate: "",
      eligibilityEndDate: "",
      reasonForChange: "",
    },
  });

  const mutation = useApiMutation<PatientProgramDTO, ProgramUpdatePayload>(
    `/patients/${patientId}/program`,
    "PATCH",
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

  // Reset form when modal opens and set program from programIdentifier
  React.useEffect(() => {
    if (open && !previousOpenRef.current) {
      // Wait for data to be loaded before resetting form
      if (!programData || !staffData) {
        previousOpenRef.current = open;
        return;
      }

      // Find program ID from programIdentifier
      const currentProgram = programData.find(
        (p) => p.programIdentifier === initialData?.programIdentifier
      );
      
      // Find supervisor ID from supervisorName
      // displayName format: "fullName (employeeCode) - officeName"
      // supervisorName format: "firstName lastName"
      const currentSupervisor = staffData.find((s) => {
        if (!initialData?.supervisorName) return false;
        // Extract the name part before the first "("
        const nameMatch = s.displayName.split("(")[0].trim();
        return nameMatch === initialData.supervisorName;
      });
      
      const formValues = {
        programId: currentProgram?.id || "",
        supervisorId: currentSupervisor?.id || "",
        enrollmentDate: initialData?.enrollmentDate || "",
        statusEffectiveDate: initialData?.statusEffectiveDate || "",
        socDate: initialData?.socDate || "",
        eocDate: initialData?.eocDate || "",
        eligibilityBeginDate: initialData?.eligibilityBeginDate || "",
        eligibilityEndDate: initialData?.eligibilityEndDate || "",
        reasonForChange: "",
      };
      reset(formValues);
      setShowSuccess(false);
      mutation.reset();
    }
    previousOpenRef.current = open;
  }, [open, initialData, reset, programData, staffData, mutation]);

  const onSubmit = async (data: ProgramFormData) => {
    // Transform reasonForChange from string to object
    const payload: ProgramUpdatePayload = {
      ...data,
      reasonForChange: data.reasonForChange?.trim() || undefined,
    };
    await mutation.mutateAsync(payload);
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
      <div className="flex flex-col h-[85vh]">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface flex-shrink-0">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            Program Details
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

            {/* Program */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium text-theme-primary">
                Program<span className="text-red-500">*</span>
              </label>
              <Controller
                name="programId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Select program"
                    className={formStyles.formSelect}
                    loading={isLoadingPrograms}
                    options={
                      programData?.map((program) => ({
                        value: program.id,
                        label: program.programIdentifier,
                      })) || []
                    }
                  />
                )}
              />
            </div>

            {/* Supervisor */}
            <div className="flex flex-col gap-2 mt-6">
              <label className="text-sm font-medium text-theme-primary">
                Supervisor
              </label>
              <Controller
                name="supervisorId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Select supervisor"
                    className={formStyles.formSelect}
                    showSearch
                    loading={isLoadingStaff}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={
                      staffData?.map((staff) => ({
                        value: staff.id,
                        label: staff.displayName,
                      })) || []
                    }
                  />
                )}
              />
            </div>

            {/* Enrollment Date & Status Effective Date (2 columns) */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Enrollment Date
                </label>
                <Controller
                  name="enrollmentDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                      placeholder="Select enrollment date"
                      className={formStyles.formInput}
                      format="MM/DD/YYYY"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Status Effective Date<span className="text-red-500">*</span>
                </label>
                <Controller
                  name="statusEffectiveDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                      placeholder="Select status effective date"
                      className={formStyles.formInput}
                      format="MM/DD/YYYY"
                    />
                  )}
                />
              </div>
            </div>

            {/* SOC Date & EOC Date (2 columns) */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  SOC Date
                </label>
                <Controller
                  name="socDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                      placeholder="Enter SOC Date"
                      className={formStyles.formInput}
                      format="MM/DD/YYYY"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  EOC Date
                </label>
                <Controller
                  name="eocDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                      placeholder="Enter EOC Date"
                      className={formStyles.formInput}
                      format="MM/DD/YYYY"
                    />
                  )}
                />
              </div>
            </div>

            {/* Eligibility Begin Date & Eligibility End Date (2 columns) */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Eligibility Begin Date
                </label>
                <Controller
                  name="eligibilityBeginDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                      placeholder="Enter Eligibility Begin Date"
                      className={formStyles.formInput}
                      format="MM/DD/YYYY"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Eligibility End Date
                </label>
                <Controller
                  name="eligibilityEndDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                      placeholder="Enter Eligibility End Date"
                      className={formStyles.formInput}
                      format="MM/DD/YYYY"
                    />
                  )}
                />
              </div>
            </div>

            {/* Reason For Change */}
            <div className="flex flex-col gap-2 mt-6">
              <label className="text-sm font-medium text-theme-primary">
                Reason For Change
              </label>
              <Controller
                name="reasonForChange"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    placeholder="Enter reason for change"
                    className={formStyles.formInput}
                    rows={3}
                  />
                )}
              />
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0">
            {/* Error Message */}
            {mutation.error && !showSuccess && (
              <div className="px-8 py-3 bg-theme-surface border-t border-theme">
                <p className="text-sm text-red-600 m-0">
                  {mutation.error?.message ||
                    "Failed to update program. Please try again."}
                </p>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="px-8 py-3 bg-theme-surface border-t border-theme flex items-center gap-2">
                <p className="text-sm text-green-600 font-[550] m-0">
                  Program updated successfully!
                </p>
              </div>
            )}

            {/* Action Buttons */}
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
                SAVE CHANGES
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

