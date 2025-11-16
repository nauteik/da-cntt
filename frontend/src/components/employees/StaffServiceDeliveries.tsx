"use client";

import React, { useState } from "react";
import {
  Card,
  Empty,
  Tag,
  Divider,
  Descriptions,
  Alert,
  Space,
  Select,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useStaffServiceDeliveries } from "@/hooks/useStaffServiceDeliveries";
import type {
  ServiceDeliveryDTO,
  ServiceDeliveryStatus,
  ApprovalStatus,
} from "@/types/serviceDelivery";
import LoadingFallback from "@/components/common/LoadingFallback";
import InlineError from "@/components/common/InlineError";

interface StaffServiceDeliveriesProps {
  staffId: string;
}

export default function StaffServiceDeliveries({
  staffId,
}: StaffServiceDeliveriesProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<ServiceDeliveryDTO | null>(null);
  const [statusFilter, setStatusFilter] = useState<ServiceDeliveryStatus | "all">("all");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalStatus | "all">("all");

  const { data, isLoading, error } = useStaffServiceDeliveries(staffId);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "N/A";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status: ServiceDeliveryStatus): string => {
    switch (status) {
      case "completed":
        return "green";
      case "in_progress":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: ServiceDeliveryStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined />;
      case "in_progress":
        return <ClockCircleOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getApprovalColor = (status: ApprovalStatus): string => {
    switch (status) {
      case "approved":
        return "green";
      case "pending":
        return "gold";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return "N/A";
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate.getTime() - startDate.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return "N/A";
    }
  };

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    
    return data.filter((delivery) => {
      const statusMatch = statusFilter === "all" || delivery.status === statusFilter;
      const approvalMatch = approvalFilter === "all" || delivery.approvalStatus === approvalFilter;
      return statusMatch && approvalMatch;
    });
  }, [data, statusFilter, approvalFilter]);

  if (isLoading) {
    return <LoadingFallback message="Loading service deliveries..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <InlineError
          title="Error Loading Service Deliveries"
          message={error.message || "Failed to load service deliveries"}
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <Empty
          description="No service deliveries found for this staff member"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            Service Deliveries
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {filteredData.length} of {data.length} deliveries
          </p>
        </div>

        <Space size="middle">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            placeholder="Filter by Status"
          >
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="in_progress">In Progress</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>

          <Select
            value={approvalFilter}
            onChange={setApprovalFilter}
            style={{ width: 150 }}
            placeholder="Filter by Approval"
          >
            <Select.Option value="all">All Approval</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </Space>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6 h-[calc(100vh-250px)]">
        {/* Left Panel - List (40%) */}
        <div className="w-2/5 overflow-y-auto">
          <div className="space-y-3">
            {filteredData.map((delivery) => (
              <Card
                key={delivery.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDelivery?.id === delivery.id 
                    ? 'border-2 border-[var(--accent)] shadow-md' 
                    : ''
                }`}
                styles={{
                  body: { padding: "16px" },
                }}
                onClick={() => setSelectedDelivery(delivery)}
              >
                {/* Compact Delivery Info */}
                <div className="flex items-center gap-2 mb-2">
                  <CalendarOutlined className="text-[var(--accent)]" />
                  <span className="font-medium text-sm text-[var(--text-primary)]">
                    {formatDate(delivery.startAt)}
                  </span>
                  <Tag color={getStatusColor(delivery.status)} icon={getStatusIcon(delivery.status)} className="text-xs">
                    {delivery.status.toUpperCase().replace("_", " ")}
                  </Tag>
                </div>
                
                <div className="text-xs text-[var(--text-secondary)] mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <UserOutlined />
                    <span>{delivery.patientName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EnvironmentOutlined />
                    <span>{delivery.officeName}</span>
                  </div>
                </div>
                
                {/* Bottom Info */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Tag color={getApprovalColor(delivery.approvalStatus)} className="text-xs">
                    {delivery.approvalStatus.toUpperCase()}
                  </Tag>
                  {delivery.cancelled && (
                    <Tag color="red" icon={<CloseCircleOutlined />} className="text-xs">
                      Cancelled
                    </Tag>
                  )}
                  {delivery.isUnscheduled && (
                    <Tag color="orange" icon={<WarningOutlined />} className="text-xs">
                      Unscheduled
                    </Tag>
                  )}
                  <Tag color="blue" className="text-xs">
                    <ClockCircleOutlined /> {delivery.totalHours?.toFixed(2) || "N/A"}h
                  </Tag>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel - Detail (60%) */}
        <div className="w-3/5 overflow-y-auto border-l border-[var(--border)] pl-6">
          {selectedDelivery ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CalendarOutlined className="text-[var(--accent)] text-xl" />
                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                    {formatDate(selectedDelivery.startAt)}
                  </h4>
                </div>
                
                {/* Status Badges */}
                <div className="flex gap-2">
                  <Tag color={getStatusColor(selectedDelivery.status)} icon={getStatusIcon(selectedDelivery.status)}>
                    {selectedDelivery.status.toUpperCase().replace("_", " ")}
                  </Tag>
                  <Tag color={getApprovalColor(selectedDelivery.approvalStatus)}>
                    {selectedDelivery.approvalStatus.toUpperCase()}
                  </Tag>
                  {selectedDelivery.cancelled && (
                    <Tag color="red" icon={<CloseCircleOutlined />}>
                      CANCELLED
                    </Tag>
                  )}
                  {selectedDelivery.isUnscheduled && (
                    <Tag color="orange" icon={<WarningOutlined />}>
                      UNSCHEDULED VISIT
                    </Tag>
                  )}
                </div>
              </div>

              {/* Alerts */}
              {selectedDelivery.cancelled && selectedDelivery.cancelReason && (
                <Alert
                  message="Service Cancelled"
                  description={
                    <div>
                      <p><strong>Reason:</strong> {selectedDelivery.cancelReason}</p>
                      {selectedDelivery.cancelledByStaffName && (
                        <p><strong>Cancelled by:</strong> {selectedDelivery.cancelledByStaffName}</p>
                      )}
                      {selectedDelivery.cancelledAt && (
                        <p><strong>Cancelled at:</strong> {formatDateTime(selectedDelivery.cancelledAt)}</p>
                      )}
                    </div>
                  }
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}

              {selectedDelivery.isUnscheduled && selectedDelivery.unscheduledReason && (
                <Alert
                  message="Unscheduled Visit"
                  description={
                    <div>
                      <p><strong>Reason:</strong> {selectedDelivery.unscheduledReason}</p>
                      <p><strong>Scheduled Staff:</strong> {selectedDelivery.scheduledStaffName}</p>
                      <p><strong>Actual Staff:</strong> {selectedDelivery.actualStaffName}</p>
                    </div>
                  }
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}

              <Divider />

              {/* Basic Information */}
              <Descriptions title="Basic Information" column={2} bordered size="small" className="mb-4">
                <Descriptions.Item label="Patient">
                  {selectedDelivery.patientName}
                </Descriptions.Item>
                <Descriptions.Item label="Staff">
                  {selectedDelivery.staffName}
                </Descriptions.Item>
                <Descriptions.Item label="Office">
                  {selectedDelivery.officeName}
                </Descriptions.Item>
                <Descriptions.Item label="Total Hours">
                  {selectedDelivery.totalHours?.toFixed(2) || "N/A"} hours
                </Descriptions.Item>
                <Descriptions.Item label="Units">
                  {selectedDelivery.units || "N/A"}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* Scheduled Time */}
              <Descriptions title="Scheduled Time" column={2} bordered size="small" className="mb-4">
                <Descriptions.Item label="Start Time">
                  {formatDateTime(selectedDelivery.startAt)}
                </Descriptions.Item>
                <Descriptions.Item label="End Time">
                  {formatDateTime(selectedDelivery.endAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Duration" span={2}>
                  {calculateDuration(selectedDelivery.startAt, selectedDelivery.endAt)}
                </Descriptions.Item>
              </Descriptions>

              {/* Check-In/Out Information */}
              {(selectedDelivery.checkInTime || selectedDelivery.checkOutTime) && (
                <>
                  <Divider />
                  <Descriptions title="Actual Check-In/Out" column={2} bordered size="small" className="mb-4">
                    {selectedDelivery.checkInTime && (
                      <Descriptions.Item label="Check-In Time">
                        {formatDateTime(selectedDelivery.checkInTime)}
                      </Descriptions.Item>
                    )}
                    {selectedDelivery.checkOutTime && (
                      <Descriptions.Item label="Check-Out Time">
                        {formatDateTime(selectedDelivery.checkOutTime)}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Check-In/Out Status" span={2}>
                      {selectedDelivery.isCheckInCheckOutCompleted ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Completed
                        </Tag>
                      ) : (
                        <Tag color="orange" icon={<ClockCircleOutlined />}>
                          In Progress
                        </Tag>
                      )}
                      {selectedDelivery.isCheckInCheckOutFullyValid !== undefined && (
                        <Tag color={selectedDelivery.isCheckInCheckOutFullyValid ? "green" : "red"}>
                          {selectedDelivery.isCheckInCheckOutFullyValid ? "Valid" : "Invalid"}
                        </Tag>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}

              {/* Metadata */}
              <Divider />
              <Descriptions title="Metadata" column={2} bordered size="small">
                <Descriptions.Item label="Created At">
                  {formatDateTime(selectedDelivery.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                  {formatDateTime(selectedDelivery.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            <Empty
              description="Select a service delivery from the list to view details"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </div>
  );
}
