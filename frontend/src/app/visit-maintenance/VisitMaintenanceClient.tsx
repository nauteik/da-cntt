"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Input,
  Select,
  DatePicker,
  Card,
  Checkbox,
  Badge,
  message,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  ReloadOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table/interface';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import layoutStyles from '@/styles/table-layout.module.css';
import buttonStyles from '@/styles/buttons.module.css';
import { getVisits } from '@/lib/api/visitMaintenance';
import type { VisitMaintenanceDTO, VisitStatus as VisitStatusType } from '@/types/visitMaintenance';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;

// Visit Status Enum for display
export enum VisitStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export default function VisitMaintenanceClient() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitMaintenanceDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisitStatusType | 'all'>('all');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const loadVisits = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD');

      const response = await getVisits({
        page: currentPage - 1, // Backend uses 0-based pagination
        size: pageSize,
        sortBy: 'startAt',
        sortDir: 'desc',
        startDate,
        endDate,
        search: searchText || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (response.success && response.data) {
        setVisits(response.data.content);
        setTotal(response.data.page.totalElements);
      } else {
      setVisits([]);
      setTotal(0);
      message.error(response.message || 'Failed to load visit records. Please check your connection and try again.');
      }
    } catch (error: unknown) {
      console.error('Failed to load visits:', error);
      setVisits([]);
      setTotal(0);
      
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message 
        || (error as { message?: string })?.message 
        || 'Unable to connect to server. Please check your network connection and try again.';
      
      message.error({
        content: errorMessage,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, dateRange, searchText, statusFilter]);

  // Load visits data
  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadVisits();
      } else {
        setCurrentPage(1); // Reset to page 1, which will trigger loadVisits
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, statusFilter, currentPage, loadVisits]);

  const getStatusColor = (status: VisitStatusType) => {
    const colorMap = {
      [VisitStatus.NOT_STARTED]: 'default',
      [VisitStatus.IN_PROGRESS]: 'processing',
      [VisitStatus.COMPLETED]: 'success',
      [VisitStatus.INCOMPLETE]: 'warning',
      [VisitStatus.VERIFIED]: 'success',
      [VisitStatus.CANCELLED]: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status: VisitStatus) => {
    const iconMap = {
      [VisitStatus.NOT_STARTED]: <ClockCircleOutlined />,
      [VisitStatus.IN_PROGRESS]: <ClockCircleOutlined />,
      [VisitStatus.COMPLETED]: <CheckCircleOutlined />,
      [VisitStatus.INCOMPLETE]: <WarningOutlined />,
      [VisitStatus.VERIFIED]: <CheckCircleOutlined />,
      [VisitStatus.CANCELLED]: <CloseCircleOutlined />,
    };
    return iconMap[status];
  };

  const getStatusDisplay = (status: VisitStatusType): string => {
    const displayMap = {
      [VisitStatus.NOT_STARTED]: 'Not Started',
      [VisitStatus.IN_PROGRESS]: 'In Progress',
      [VisitStatus.COMPLETED]: 'Completed',
      [VisitStatus.INCOMPLETE]: 'Incomplete',
      [VisitStatus.VERIFIED]: 'Verified',
      [VisitStatus.CANCELLED]: 'Cancelled',
    };
    return displayMap[status] || status;
  };

  const handleDoNotBillChange = async (recordId: string, checked: boolean) => {
    try {
      // TODO: Implement API call to update do not bill status
      // await updateVisitDoNotBill(recordId, checked);
      
      setVisits(visits.map(visit => 
        visit.serviceDeliveryId === recordId 
          ? { 
              ...visit, 
              doNotBill: checked,
              visitStatus: checked ? VisitStatus.CANCELLED : visit.visitStatus 
            }
          : visit
      ));
      message.success(checked ? 'Visit marked as Do Not Bill' : 'Do Not Bill removed');
    } catch (error: unknown) {
      console.error('Failed to update do not bill status:', error);
      message.error('Failed to update do not bill status. Please try again.');
    }
  };

  const handleEdit = (record: VisitMaintenanceDTO) => {
    router.push(`/visit-maintenance/${record.serviceDeliveryId}`);
  };

  const handleRowClick = (record: VisitMaintenanceDTO) => {
    return {
      onClick: () => {
        router.push(`/visit-maintenance/${record.serviceDeliveryId}`);
      },
      style: { cursor: 'pointer' }
    };
  };

  const columns: ColumnsType<VisitMaintenanceDTO> = [
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'clientName',
      width: 150,
      fixed: 'left',
      sorter: (a, b) => a.clientName.localeCompare(b.clientName),
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search client"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </div>
      ),
      onFilter: (value, record) => 
        record.clientName.toLowerCase().includes(searchText.toLowerCase()),
    },
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Visit Date',
      dataIndex: 'visitDate',
      key: 'visitDate',
      width: 110,
      sorter: (a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime(),
    },
    {
      title: 'Scheduled Time In',
      dataIndex: 'scheduledTimeIn',
      key: 'scheduledTimeIn',
      width: 130,
    },
    {
      title: 'Scheduled Time Out',
      dataIndex: 'scheduledTimeOut',
      key: 'scheduledTimeOut',
      width: 140,
    },
    {
      title: 'Scheduled Hours',
      dataIndex: 'scheduledHours',
      key: 'scheduledHours',
      width: 120,
      align: 'center',
      render: (hours: number) => hours.toFixed(2),
    },
    {
      title: 'Call In',
      dataIndex: 'callIn',
      key: 'callIn',
      width: 100,
      render: (time: string | null) => (
        <Badge 
          status={time ? 'success' : 'default'} 
          dot
        >
          <span>{time || '---'}</span>
        </Badge>
      ),
    },
    {
      title: 'Call Out',
      dataIndex: 'callOut',
      key: 'callOut',
      width: 100,
      render: (time: string | null) => (
        <Badge 
          status={time ? 'success' : 'default'} 
          dot
        >
          <span>{time || '---'}</span>
        </Badge>
      ),
    },
    {
      title: 'Call Hours',
      dataIndex: 'callHours',
      key: 'callHours',
      width: 100,
      align: 'center',
      render: (hours: number | null) => hours ? hours.toFixed(2) : '---',
    },
    {
      title: 'Adjusted In',
      dataIndex: 'adjustedIn',
      key: 'adjustedIn',
      width: 110,
      render: (time: string | null) => time || '---',
    },
    {
      title: 'Adjusted Out',
      dataIndex: 'adjustedOut',
      key: 'adjustedOut',
      width: 120,
      render: (time: string | null) => time || '---',
    },
    {
      title: 'Adjusted Hours',
      dataIndex: 'adjustedHours',
      key: 'adjustedHours',
      width: 120,
      align: 'center',
      render: (hours: number | null) => hours ? hours.toFixed(2) : '---',
    },
    {
      title: 'Pay Hours',
      dataIndex: 'payHours',
      key: 'payHours',
      width: 100,
      align: 'center',
      render: (hours: number) => (
        <strong style={{ color: '#1890ff' }}>{hours.toFixed(2)}</strong>
      ),
    },
    {
      title: 'Bill Hours',
      dataIndex: 'billHours',
      key: 'billHours',
      width: 100,
      align: 'center',
      render: (hours: number) => (
        <strong style={{ color: '#52c41a' }}>{hours.toFixed(2)}</strong>
      ),
    },
    {
      title: 'Visit Status',
      dataIndex: 'visitStatus',
      key: 'visitStatus',
      width: 130,
      render: (status: VisitStatusType, record) => (
        <Tag 
          icon={getStatusIcon(status)} 
          color={getStatusColor(status)}
        >
          {record.visitStatusDisplay || getStatusDisplay(status)}
        </Tag>
      ),
    },
    {
      title: 'Do Not Bill',
      dataIndex: 'doNotBill',
      key: 'doNotBill',
      width: 100,
      align: 'center',
      render: (checked: boolean, record: VisitMaintenanceDTO) => (
        <Checkbox
          checked={checked}
          onChange={(e) => handleDoNotBillChange(record.serviceDeliveryId, e.target.checked)}
        />
      ),
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
      width: 80,
      align: 'center',
      render: (units: number) => units || 0,
    },
    {
      title: 'Distance',
      dataIndex: 'totalDistanceFormatted',
      key: 'totalDistanceFormatted',
      width: 100,
      align: 'center',
      render: (distance: string | null) => distance || '---',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_: unknown, record: VisitMaintenanceDTO) => (
        <Tooltip title="Edit Visit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className={layoutStyles.pageContainer}>
      <Card className={layoutStyles.controlBar} variant="borderless">
        <div className={layoutStyles.controlsRow}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={buttonStyles.btnPrimary}
          >
            CREATE CALL
          </Button>

          <Space size="middle" className={layoutStyles.rightControls}>
            <Input
              placeholder="Search by client or employee name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={layoutStyles.searchInput}
              allowClear
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="MM/DD/YYYY"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              placeholder="Filter by Status"
            >
              <Option value="all">All Status</Option>
              <Option value="NOT_STARTED">Not Started</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="INCOMPLETE">Incomplete</Option>
              <Option value="VERIFIED">Verified</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadVisits}
              loading={loading}
              className={buttonStyles.btnSecondary}
            >
              REFRESH
            </Button>
            <Button
              icon={<ExportOutlined />}
              className={buttonStyles.btnSecondary}
            >
              EXPORT
            </Button>
          </Space>
        </div>
      </Card>

      {/* Legend */}
      <Card className={layoutStyles.controlBar} variant="borderless" style={{ marginBottom: 16 }}>
        <Space size="large">
          <span>
            <Badge status="default" /> Not Started
          </span>
          <span>
            <Badge status="processing" /> In Progress
          </span>
          <span>
            <Badge status="success" /> Completed/Verified
          </span>
          <span>
            <Badge status="warning" /> Incomplete
          </span>
          <span>
            <Badge status="error" /> Cancelled
          </span>
        </Space>
      </Card>

      {/* Table */}
      <Card className={layoutStyles.tableCard} variant="borderless">
        <Table
          columns={columns}
          dataSource={visits}
          rowKey="serviceDeliveryId"
          loading={loading}
          onRow={handleRowClick}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0' }}>
                <ClockCircleOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
                  No visit records found
                </div>
                <div style={{ fontSize: 14, color: '#999' }}>
                  {searchText || statusFilter !== 'all' || dateRange 
                    ? 'Try adjusting your filters or search criteria'
                    : 'Visit records will appear here once they are created'}
                </div>
              </div>
            )
          }}
          scroll={{
            x: 2500,
            y: "calc(100vh - 280px)",
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} visits`,
            pageSizeOptions: ['10', '25', '50', '100'],
            position: ["bottomCenter"],
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1); // Reset to first page when page size changes
              }
            },
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </Card>
    </div>
  );
}
