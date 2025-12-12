"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, DatePicker, TimePicker, Select, Input, Button, Alert, Space } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import type { ReportType, ReportMetadata, ReportFilters } from "@/types/report";
import { REPORT_FILTER_CONFIGS } from "@/types/report";
import { useApiQuery } from "@/hooks/useApi";
import buttonStyles from "@/styles/buttons.module.css";
import formStyles from "@/styles/form.module.css";

const { RangePicker } = DatePicker;

interface PayerSelectDTO {
  id: string;
  payerName: string;
  payerIdentifier: string;
}

interface ProgramSelectDTO {
  id: string;
  programIdentifier: string;
  programName: string;
}

interface ServiceTypeSelectDTO {
  id: string;
  code: string;
  name: string;
}

interface ReportFilterModalProps {
  open: boolean;
  reportMetadata: ReportMetadata | null;
  onClose: () => void;
}

export default function ReportFilterModal({
  open,
  reportMetadata,
  onClose,
}: ReportFilterModalProps) {
  const [form] = Form.useForm();
  const router = useRouter();

  // Fetch filter options
  const { data: payers } = useApiQuery<PayerSelectDTO[]>(
    ["payer", "select"],
    "/payer/select",
    { enabled: open }
  );

  const { data: programs } = useApiQuery<ProgramSelectDTO[]>(
    ["program", "select"],
    "/program/select",
    { enabled: open }
  );

  const { data: serviceTypes } = useApiQuery<ServiceTypeSelectDTO[]>(
    ["service-type", "select"],
    "/services/select",
    { enabled: open }
  );

  // Initialize form with default values when modal opens
  useEffect(() => {
    if (open) {
      const now = dayjs();
      const startOfMonth = now.startOf('month');
      const endOfMonth = now.endOf('month');
      
      form.setFieldsValue({
        dateRange: [startOfMonth, endOfMonth],
        fromTime: dayjs().startOf('day'),
        toTime: dayjs().endOf('day').subtract(1, 'minute'), // 11:59 PM
      });
    }
  }, [open, form]);

  const handleClear = () => {
    form.resetFields();
    // Re-apply defaults
    const now = dayjs();
    const startOfMonth = now.startOf('month');
    const endOfMonth = now.endOf('month');
    
    form.setFieldsValue({
      dateRange: [startOfMonth, endOfMonth],
      fromTime: dayjs().startOf('day'),
      toTime: dayjs().endOf('day').subtract(1, 'minute'),
    });
  };

  const handleRunReport = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate date range (max 730 days)
      if (values.dateRange) {
        const [fromDate, toDate] = values.dateRange;
        const daysDiff = toDate.diff(fromDate, 'day');
        
        if (daysDiff > 730) {
          Modal.error({
            title: 'Invalid Date Range',
            content: 'The range for this report cannot exceed 730 days.',
          });
          return;
        }
      }

      // Build filters
      const filters: ReportFilters = {
        fromDate: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : null,
        toDate: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : null,
        fromTime: values.fromTime ? values.fromTime.format('HH:mm:ss') : null,
        toTime: values.toTime ? values.toTime.format('HH:mm:ss') : null,
        payerIds: values.payerIds,
        programIds: values.programIds,
        serviceTypeIds: values.serviceTypeIds,
        clientMedicaidId: values.clientMedicaidId,
        clientSearch: values.clientSearch,
      };

      // Encode filters as query params
      const params = new URLSearchParams();
      params.set('reportType', reportMetadata!.key);
      params.set('reportName', reportMetadata!.name);
      params.set('filters', JSON.stringify(filters));

      // Navigate to report preview page
      router.push(`/reports/preview?${params.toString()}`);
      
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  if (!reportMetadata) return null;

  const config = REPORT_FILTER_CONFIGS[reportMetadata.key as ReportType];

  return (
    <Modal
      title="Filters"
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={null}
    >
      <Alert
        message="Note: The range for this report cannot exceed 730 days."
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        className={formStyles.form}
      >
        {config.showDateRange && (
          <Form.Item
            label="Date Range"
            name="dateRange"
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <RangePicker
              format="MM/DD/YYYY"
              style={{ width: '100%' }}
              placeholder={['From Date', 'To Date']}
            />
          </Form.Item>
        )}

        {config.showTimeRange && (
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="From Time"
              name="fromTime"
              rules={[{ required: true, message: 'Please select from time' }]}
              style={{ flex: 1 }}
            >
              <TimePicker
                format="hh:mm A"
                use12Hours
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="To Time"
              name="toTime"
              rules={[{ required: true, message: 'Please select to time' }]}
              style={{ flex: 1 }}
            >
              <TimePicker
                format="hh:mm A"
                use12Hours
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        )}

        {config.showPayers && (
          <Form.Item
            label="Payers"
            name="payerIds"
          >
            <Select
              mode="multiple"
              placeholder="Select payers"
              allowClear
              maxTagCount="responsive"
              options={payers?.map(p => ({
                label: p.payerIdentifier,
                value: p.id,
              }))}
            />
          </Form.Item>
        )}

        {config.showPrograms && (
          <Form.Item
            label="Programs"
            name="programIds"
          >
            <Select
              mode="multiple"
              placeholder="Select programs"
              allowClear
              maxTagCount="responsive"
              options={programs?.map(p => ({
                label: p.programIdentifier,
                value: p.id,
              }))}
            />
          </Form.Item>
        )}

        {config.showServices && (
          <Form.Item
            label="Services"
            name="serviceTypeIds"
          >
            <Select
              mode="multiple"
              placeholder="Select services"
              allowClear
              maxTagCount="responsive"
              options={serviceTypes?.map(s => ({
                label: `${s.code} - ${s.name}`,
                value: s.id,
              }))}
            />
          </Form.Item>
        )}

        {config.showClient && (
          <Form.Item
            label="Client"
            name="clientSearch"
          >
            <Input placeholder="Enter client name" />
          </Form.Item>
        )}

        {config.showClientMedicaidId && (
          <Form.Item
            label="Client Medicaid ID"
            name="clientMedicaidId"
          >
            <Input placeholder="Enter Medicaid ID" />
          </Form.Item>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Button
            onClick={handleClear}
            className={buttonStyles.btnSecondary}
          >
            CLEAR
          </Button>
          
          <Space>
            <Button
              onClick={handleCancel}
              className={buttonStyles.btnCancel}
            >
              CANCEL
            </Button>
            <Button
              type="primary"
              onClick={handleRunReport}
              className={buttonStyles.btnPrimary}
            >
              RUN REPORT
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}

