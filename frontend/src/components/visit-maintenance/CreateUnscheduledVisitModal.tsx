"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, message, Alert, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';

const { Option } = Select;
const { TextArea } = Input;

interface ScheduleEventDTO {
  id: string;
  patientName: string;
  employeeName: string;
  eventDate: string;
  startAt: string;
  endAt: string;
  authorizationId?: string;
  serviceCode?: string;
  status: string;
  serviceDeliveryId?: string; // ID của service delivery nếu đã có
}

interface StaffSelectDTO {
  id: string;
  displayName: string;
}

interface CreateUnscheduledVisitModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CreateUnscheduledVisitModal({
  open,
  onCancel,
  onSuccess,
}: CreateUnscheduledVisitModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEventDTO[]>([]);
  const [staff, setStaff] = useState<StaffSelectDTO[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEventDTO | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Load staff and schedule events on mount
  useEffect(() => {
    if (open) {
      loadStaff();
      loadScheduleEvents();
    }
  }, [open]);

  const loadScheduleEvents = async () => {
    setLoadingEvents(true);
    try {
      // Get upcoming schedule events (next 7 days)
      const today = dayjs().format('YYYY-MM-DD');
      const nextWeek = dayjs().add(7, 'days').format('YYYY-MM-DD');
      
      const response: ApiResponse<any> = await apiClient(
        `/schedules?from=${today}&to=${nextWeek}&status=CONFIRMED`
      );

      if (response.success && response.data) {
        // Backend returns Page<ScheduleEventDTO>
        const events = response.data.content || [];
        setScheduleEvents(events);
        console.log('Loaded schedule events:', events);
      }
    } catch (error) {
      console.error('Failed to load schedule events:', error);
      message.error('Failed to load schedule events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const response: ApiResponse<StaffSelectDTO[]> = await apiClient('/staff/select');

      if (response.success && response.data) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
      message.error('Failed to load staff list');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleScheduleEventSelect = (eventId: string) => {
    const event = scheduleEvents.find(e => e.id === eventId);
    setSelectedEvent(event || null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!selectedEvent) {
        message.error('Please select a schedule event');
        return;
      }

      setLoading(true);

      // Payload for staff replacement
      const payload = {
        scheduleEventId: selectedEvent.id,
        authorizationId: selectedEvent.authorizationId || null,
        actualStaffId: values.replacementStaffId,
        startAt: dayjs(selectedEvent.startAt).format('YYYY-MM-DDTHH:mm:ss'),
        endAt: dayjs(selectedEvent.endAt).format('YYYY-MM-DDTHH:mm:ss'),
        isUnscheduled: true,
        unscheduledReason: values.unscheduledReason,
      };

      console.log('Submitting payload:', payload);
      
      // Check if service delivery already exists for this schedule
      if (selectedEvent.serviceDeliveryId) {
        // UPDATE existing service delivery to mark as unscheduled (staff replacement)
        console.log('Updating existing service delivery:', selectedEvent.serviceDeliveryId);
        const response = await apiClient(`/service-delivery/${selectedEvent.serviceDeliveryId}`, {
          method: 'PUT',
          body: payload,
        });

        if (response.success) {
          message.success('Staff replacement updated successfully');
          form.resetFields();
          setSelectedEvent(null);
          onSuccess();
        } else {
          message.error(response.message || 'Failed to update staff replacement');
        }
      } else {
        // CREATE new service delivery with unscheduled staff
        console.log('Creating new unscheduled service delivery');
        const response = await apiClient('/service-delivery', {
          method: 'POST',
          body: payload,
        });

        if (response.success) {
          message.success('Staff replacement created successfully');
          form.resetFields();
          setSelectedEvent(null);
          onSuccess();
        } else {
          message.error(response.message || 'Failed to create staff replacement');
        }
      }
    } catch (error: any) {
      console.error('Failed to create staff replacement:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('Failed to create staff replacement. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedEvent(null);
    onCancel();
  };

  return (
    <Modal
      title="Create Staff Replacement"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText="Create Replacement"
      cancelText="Cancel"
    >
      <Alert
        message="Staff Replacement"
        description="Select a scheduled visit that needs staff replacement. The replacement staff will take over the visit with all original details (patient, time, authorization)."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="scheduleEventId"
          label="Select Schedule to Replace"
          rules={[{ required: true, message: 'Please select a schedule' }]}
          extra={scheduleEvents.length === 0 && !loadingEvents ? 'No confirmed schedules found for the next 7 days' : `${scheduleEvents.length} schedule(s) available`}
        >
          <Select
            showSearch
            placeholder="Search by patient name to select schedule"
            onChange={handleScheduleEventSelect}
            loading={loadingEvents}
            optionFilterProp="children"
            filterOption={(input, option: any) => {
              const searchText = input.toLowerCase();
              const optionText = option?.children?.toString().toLowerCase() || '';
              const patientName = option?.patientname?.toLowerCase() || '';
              // Prioritize patient name matching
              return patientName.includes(searchText) || optionText.includes(searchText);
            }}
            notFoundContent={loadingEvents ? 'Loading...' : 'No schedules found'}
            dropdownStyle={{ maxWidth: '650px' }}
            popupClassName="schedule-select-dropdown"
          >
            {scheduleEvents.map((event) => {
              const date = dayjs(event.eventDate).format('MMM DD, YYYY');
              const time = `${dayjs(event.startAt).format('HH:mm')} - ${dayjs(event.endAt).format('HH:mm')}`;
              return (
                <Option 
                  key={event.id} 
                  value={event.id}
                  patientname={event.patientName}
                  style={{ height: 'auto', minHeight: '60px', padding: '8px 12px', lineHeight: 'normal' }}
                >
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    maxWidth: '100%'
                  }}>
                    <strong style={{ fontSize: '14px' }}>{event.patientName}</strong>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.3' }}>
                      {date} • {time}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      Original: {event.employeeName}
                    </div>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        {selectedEvent && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            description={
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Patient">{selectedEvent.patientName}</Descriptions.Item>
                <Descriptions.Item label="Original Staff">{selectedEvent.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Date">
                  {dayjs(selectedEvent.eventDate).format('MMMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Time">
                  {dayjs(selectedEvent.startAt).format('HH:mm')} - {dayjs(selectedEvent.endAt).format('HH:mm')}
                </Descriptions.Item>
                {selectedEvent.serviceCode && (
                  <Descriptions.Item label="Service">{selectedEvent.serviceCode}</Descriptions.Item>
                )}
              </Descriptions>
            }
          />
        )}

        <Form.Item
          name="replacementStaffId"
          label="Replacement Staff"
          rules={[{ required: true, message: 'Please select replacement staff' }]}
        >
          <Select
            showSearch
            placeholder="Select staff to replace"
            loading={loadingStaff}
            optionFilterProp="children"
            suffixIcon={<UserOutlined />}
            style={{ width: '100%' }}
          >
            {staff.map((s) => (
              <Option key={s.id} value={s.id} style={{ whiteSpace: 'normal' }}>
                {s.displayName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="unscheduledReason"
          label="Reason for Replacement"
          rules={[
            { required: true, message: 'Please provide a reason' },
            { min: 10, message: 'Reason must be at least 10 characters' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Explain why staff replacement is needed (e.g., original staff sick, emergency, unavailable)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
