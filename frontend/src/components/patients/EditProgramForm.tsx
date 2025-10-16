"use client";

import React from "react";
import { Modal, Input, Select, DatePicker, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useApiQuery } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { ProgramDetailDTO, StaffSelectDTO, ProgramSelectDTO } from "@/types/patient";
import dayjs from "dayjs";

interface EditProgramFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  initialData?: ProgramDetailDTO | null;
}

interface ProgramFormData {
  program: string;
  supervisorName: string;
  enrollmentDate: string;
  statusEffectiveDate: string;
  socDate: string;
  eocDate: string;
  eligibilityBeginDate: string;
  eligibilityEndDate: string;
  createdAt: string;
  reasonForChange: string;
}

export default function EditProgramForm({
  open,
  onClose,
  patientId,
  initialData,
}: EditProgramFormProps) {
  const previousOpenRef = React.useRef(open);

  // Fetch staff list for supervisor select
  const { data: staffData, isLoading: isLoadingStaff } = useApiQuery<StaffSelectDTO[]>(
    ["staff", "select"],
    "/staff/select",
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch program list for program select
  const { data: programData, isLoading: isLoadingPrograms } = useApiQuery<ProgramSelectDTO[]>(
    ["program", "select"],
    "/program/select",
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProgramFormData>({
    mode: "onBlur",
    defaultValues: {
      program: "",
      supervisorName: initialData?.supervisorName || "",
      enrollmentDate: initialData?.enrollmentDate || "",
      statusEffectiveDate: initialData?.statusEffectiveDate || "",
      socDate: initialData?.socDate || "",
      eocDate: initialData?.eocDate || "",
      eligibilityBeginDate: initialData?.eligibilityBeginDate || "",
      eligibilityEndDate: initialData?.eligibilityEndDate || "",
      createdAt: initialData?.createdAt || "",
      reasonForChange: "",
    },
  });

  // Reset form when modal opens and set program from programIdentifier
  React.useEffect(() => {
    if (open && !previousOpenRef.current && programData) {
      // Find program ID from programIdentifier
      const currentProgram = programData?.find(
        (p) => p.programIdentifier === initialData?.programIdentifier
      );
      
      const formValues = {
        program: currentProgram?.id || "",
        supervisorName: initialData?.supervisorName || "",
        enrollmentDate: initialData?.enrollmentDate || "",
        statusEffectiveDate: initialData?.statusEffectiveDate || "",
        socDate: initialData?.socDate || "",
        eocDate: initialData?.eocDate || "",
        eligibilityBeginDate: initialData?.eligibilityBeginDate || "",
        eligibilityEndDate: initialData?.eligibilityEndDate || "",
        createdAt: initialData?.createdAt || "",
        reasonForChange: "",
      };
      reset(formValues);
    }
    previousOpenRef.current = open;
  }, [open, initialData, reset, programData]);

  const onSubmit = async (data: ProgramFormData) => {
    console.log("Program form data:", data);
    console.log("Patient ID:", patientId);
    // TODO: Handle save
  };

  const handleCancel = () => {
    reset();
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
        <div className="flex justify-between items-center px-8 py-6 border-b border-theme bg-theme-surface">
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
          className="flex flex-col min-h-[500px]"
        >
          <div className="flex-1 px-8 py-8 bg-theme-surface flex flex-col gap-6">
            {/* Required Note */}
            <p className="text-sm text-red-500 m-0">* Required</p>

            {/* Program */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Program<span className="text-red-500">*</span>
              </label>
              <Controller
                name="program"
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-theme-primary">
                Supervisor
              </label>
              <Controller
                name="supervisorName"
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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

            {/* Created Date & Reason For Change (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Created Date<span className="text-red-500">*</span>
                </label>
                <Controller
                  name="createdAt"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                      placeholder="Select created date"
                      className={formStyles.formInput}
                      format="MM/DD/YYYY"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-theme-primary">
                  Reason For Change:
                </label>
                <Controller
                  name="reasonForChange"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      placeholder="Select Reason For Change"
                      className={formStyles.formInput}
                      rows={1}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-theme bg-theme-surface">
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className={buttonStyles.btnPrimary}
              disabled={!isDirty}
            >
              SAVE
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

