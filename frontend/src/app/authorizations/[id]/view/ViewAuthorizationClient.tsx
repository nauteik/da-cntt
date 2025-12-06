"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, Row, Col, Input, DatePicker, Button, message, Table, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import dayjs, { type Dayjs } from "dayjs";
import type { AuthorizationDetailDTO, UpdateAuthorizationFormData, PatientServiceDTO } from "@/types/authorization";
import { useApiMutation } from "@/hooks/useApi";
import formStyles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import type { ColumnsType } from "antd/es/table/interface";

const { TextArea } = Input;
const { Title } = Typography;

interface ViewAuthorizationClientProps {
  authorization: AuthorizationDetailDTO;
  patientServices: PatientServiceDTO[];
}

export default function ViewAuthorizationClient({
  authorization,
  patientServices,
}: ViewAuthorizationClientProps) {
  const router = useRouter();

  // Initialize form with react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<UpdateAuthorizationFormData>({
    defaultValues: {
      authorizationNo: authorization.authorizationNo || "",
      format: authorization.format || "",
      startDate: authorization.startDate || "",
      endDate: authorization.endDate || "",
      maxUnits: authorization.maxUnits || 0,
      comments: authorization.comments || "",
    },
  });

  // Mutation for updating authorization
  const updateMutation = useApiMutation<AuthorizationDetailDTO, UpdateAuthorizationFormData>(
    `/authorizations/${authorization.authorizationId}`,
    "PATCH",
    {
      onSuccess: (data) => {
        message.success("Authorization updated successfully");
        // Reset form with new data to clear isDirty state
        reset({
          authorizationNo: data.authorizationNo || "",
          format: data.format || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          maxUnits: data.maxUnits || 0,
          comments: data.comments || "",
        });
      },
      onError: (error) => {
        message.error(error.message || "Failed to update authorization");
      },
    }
  );

  // Handle form submission
  const onSubmit = (data: UpdateAuthorizationFormData) => {
    updateMutation.mutate(data);
  };

  // Handle cancel button
  const handleCancel = () => {
    reset(); // Reset form to initial values
    router.back(); // Navigate back
  };

  // Table columns for Service Limitations
  const serviceColumns: ColumnsType<PatientServiceDTO> = [
    {
      title: "SERVICE CODE",
      dataIndex: "serviceCode",
      key: "serviceCode",
      width: 150,
    },
    {
      title: "SERVICE NAME",
      dataIndex: "serviceName",
      key: "serviceName",
      width: 250,
    },
    {
      title: "START DATE",
      dataIndex: "startDate",
      key: "startDate",
      width: 150,
      render: (date: string) => (date ? dayjs(date).format("MM/DD/YYYY") : "—"),
    },
    {
      title: "END DATE",
      dataIndex: "endDate",
      key: "endDate",
      width: 150,
      render: (date: string) => (date ? dayjs(date).format("MM/DD/YYYY") : "—"),
    },
    {
      title: "TOTAL UNITS",
      dataIndex: "totalUnits",
      key: "totalUnits",
      width: 150,
      render: (units: number) => (units !== undefined && units !== null ? units.toFixed(2) : "—"),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="!mb-0">
          Viewing Authorization
        </Title>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* General Section */}
        <Card title="General" className="mb-6">
          <div className="space-y-4">
            {/* Row 1: Client Name and Client ID (readonly) */}
            <Row gutter={16}>
              <Col span={12}>
                <label className="block text-sm font-medium mb-1">CLIENT NAME</label>
                <Input
                  value={authorization.clientName}
                  disabled
                  className={formStyles.formInputDisabled}
                />
              </Col>
              <Col span={12}>
                <label className="block text-sm font-medium mb-1">CLIENT ID</label>
                <Input
                  value={authorization.clientId}
                  disabled
                  className={formStyles.formInputDisabled}
                />
              </Col>
            </Row>

            {/* Row 2: Payer (readonly), Authorization Reference, Authorization Type */}
            <Row gutter={16}>
              <Col span={8}>
                <label className="block text-sm font-medium mb-1">PAYER</label>
                <Input
                  value={authorization.payerIdentifier}
                  disabled
                  className={formStyles.formInputDisabled}
                />
              </Col>
              <Col span={8}>
                <label className="block text-sm font-medium mb-1">
                  AUTHORIZATION REFERENCE <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="authorizationNo"
                  control={control}
                  rules={{ required: "Authorization reference is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter Authorization Reference"
                      className={formStyles.formInput}
                    />
                  )}
                />
              </Col>
              <Col span={8}>
                <label className="block text-sm font-medium mb-1">
                  AUTHORIZATION TYPE <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="format"
                  control={control}
                  rules={{ required: "Authorization type is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter Authorization Type (e.g., Unit)"
                      className={formStyles.formInput}
                    />
                  )}
                />
              </Col>
            </Row>

            {/* Row 3: From Date, To Date, Max Units Allocated */}
            <Row gutter={16}>
              <Col span={8}>
                <label className="block text-sm font-medium mb-1">
                  FROM DATE <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "From date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date: Dayjs | null) => {
                        field.onChange(date ? date.format("YYYY-MM-DD") : "");
                      }}
                      format="MM/DD/YYYY"
                      placeholder="MM/DD/YYYY"
                      className={`w-full ${formStyles.formDatePicker}`}
                    />
                  )}
                />
              </Col>
              <Col span={8}>
                <label className="block text-sm font-medium mb-1">TO DATE</label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date: Dayjs | null) => {
                        field.onChange(date ? date.format("YYYY-MM-DD") : "");
                      }}
                      format="MM/DD/YYYY"
                      placeholder="MM/DD/YYYY"
                      className={`w-full ${formStyles.formDatePicker}`}
                    />
                  )}
                />
              </Col>
              <Col span={8}>
                <label className="block text-sm font-medium mb-1">
                  MAX UNITS ALLOCATED <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="maxUnits"
                  control={control}
                  rules={{
                    required: "Max units is required",
                    min: { value: 0, message: "Max units must be positive" },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className={formStyles.formInput}
                    />
                  )}
                />
              </Col>
            </Row>

            {/* Row 4: Comments (full width) */}
            <Row>
              <Col span={24}>
                <label className="block text-sm font-medium mb-1">COMMENTS</label>
                <Controller
                  name="comments"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder="Add a comment"
                      rows={4}
                      className={formStyles.formInput}
                    />
                  )}
                />
              </Col>
            </Row>
          </div>
        </Card>

        {/* Service Limitations Section (Readonly) */}
        <Card title="Service Limitations" className="mb-6">
          <Table
            columns={serviceColumns}
            dataSource={patientServices}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{
              emptyText: "No services available for this patient",
            }}
          />
        </Card>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="default"
            className={buttonStyles.btnSecondary}
            onClick={handleCancel}
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
            FINISH
          </Button>
        </div>
      </form>
    </div>
  );
}

