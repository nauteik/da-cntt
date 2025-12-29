"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/apiClient';

const { TextArea } = Input;

interface CancelVisitModalProps {
  open: boolean;
  visitId: string;
  visitInfo: {
    clientName: string;
    employeeName: string;
    visitDate: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CancelVisitModal({
  open,
  visitId,
  visitInfo,
  onCancel,
  onSuccess,
}: CancelVisitModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await apiClient(`/service-delivery/${visitId}/cancel?reason=${encodeURIComponent(values.reason)}`, {
        method: 'PATCH',
      });

      if (response.success) {
        message.success('Visit cancelled successfully');
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.message || 'Failed to cancel visit');
      }
    } catch (error: any) {
      console.error('Failed to cancel visit:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('Failed to cancel visit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
          Cancel Visit
        </span>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Confirm Cancel"
      cancelText="Close"
      okButtonProps={{ danger: true }}
      width={600}
    >
      <div style={{ 
        backgroundColor: '#fff1f0', 
        border: '1px solid #ffccc7', 
        borderRadius: 8,
        padding: 16,
        marginBottom: 24 
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#cf1322' }}>Visit Information</h4>
        <div style={{ fontSize: 14, lineHeight: '1.8' }}>
          <div><strong>Client:</strong> {visitInfo.clientName}</div>
          <div><strong>Employee:</strong> {visitInfo.employeeName}</div>
          <div><strong>Date:</strong> {visitInfo.visitDate}</div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="reason"
          label="Cancellation Reason"
          rules={[
            { required: true, message: 'Please provide a cancellation reason' },
            { min: 10, message: 'Reason must be at least 10 characters' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Explain why this visit is being cancelled (e.g., client unavailable, weather conditions, staff emergency)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>

      <div style={{ 
        backgroundColor: '#fff7e6', 
        border: '1px solid #ffd591',
        borderRadius: 6,
        padding: 12,
        fontSize: 13,
        color: '#ad6800'
      }}>
        <strong>⚠️ Important:</strong> If the visit is in progress (staff has checked in), they will still be able to check out and complete documentation. The visit will be hidden from their schedule after check-out is completed.
      </div>
    </Modal>
  );
}
