"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Table, Button, Space, message, Typography } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type {
  ReportType,
  ReportFilters,
  AuthVsActualReportDTO,
  AuthorizationReportDTO,
  ClientsWithoutAuthReportDTO,
  ExpiringAuthReportDTO,
  PageResponse,
} from '@/types/report';
import { reportApi } from '@/lib/api/reportApi';
import buttonStyles from '@/styles/buttons.module.css';
import layoutStyles from '@/styles/table-layout.module.css';

const { Title, Text } = Typography;

type ReportData = AuthVsActualReportDTO | AuthorizationReportDTO | ClientsWithoutAuthReportDTO | ExpiringAuthReportDTO;

export default function ReportPreviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<ReportData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
  });
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Parse query params
  const reportType = searchParams.get('reportType') as ReportType;
  const reportName = searchParams.get('reportName') || 'Report';
  const filtersParam = searchParams.get('filters');
  const filters: ReportFilters = filtersParam ? JSON.parse(filtersParam) : {};

  // Fetch report data
  const fetchReportData = async (page: number, pageSize: number, sort?: string) => {
    setLoading(true);
    try {
      let response: PageResponse<any>;
      const paginationParams = {
        page: page - 1, // Backend uses 0-based indexing
        size: pageSize,
        sort,
      };

      switch (reportType) {
        case 'auth-vs-actual':
          response = await reportApi.getAuthVsActualReport(filters, paginationParams);
          break;
        case 'authorizations':
          response = await reportApi.getAuthorizationsReport(filters, paginationParams);
          break;
        case 'clients-without-auth':
          response = await reportApi.getClientsWithoutAuthReport(filters, paginationParams);
          break;
        case 'expiring-auth':
          response = await reportApi.getExpiringAuthReport(filters, paginationParams);
          break;
        default:
          message.error('Invalid report type');
          return;
      }

      setData(response.content);
      setPagination({
        current: page,
        pageSize,
        total: response.totalElements,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      message.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType) {
      const sortParam = sortField && sortOrder 
        ? `${sortField},${sortOrder === 'asc' ? 'asc' : 'desc'}`
        : undefined;
      fetchReportData(pagination.current, pagination.pageSize, sortParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: any,
    sorter: SorterResult<any> | SorterResult<any>[]
  ) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    
    // Handle sorting
    if (sortInfo && sortInfo.field && sortInfo.order) {
      const newSortField = String(sortInfo.field);
      const newSortOrder = sortInfo.order === 'ascend' ? 'asc' : 'desc';
      setSortField(newSortField);
      setSortOrder(newSortOrder);
      const sortParam = `${newSortField},${newSortOrder}`;
      fetchReportData(pagination.current || 1, pagination.pageSize || 25, sortParam);
    } else {
      setSortField(null);
      setSortOrder(null);
      fetchReportData(pagination.current || 1, pagination.pageSize || 25);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await reportApi.exportReport(reportType, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // Define columns based on report type
  const columns = useMemo((): ColumnsType<any> => {
    switch (reportType) {
      case 'auth-vs-actual':
        return [
          { title: 'Client Name', dataIndex: 'clientName', key: 'clientName', sorter: true, width: 150 },
          { title: 'Type', dataIndex: 'clientType', key: 'clientType', width: 80 },
          { title: 'Medicaid ID', dataIndex: 'medicaidId', key: 'medicaidId', width: 120 },
          { title: 'Alternate Payer', dataIndex: 'alternatePayer', key: 'alternatePayer', width: 120 },
          { title: 'Payer', dataIndex: 'payer', key: 'payer', width: 120 },
          { title: 'Program', dataIndex: 'program', key: 'program', width: 100 },
          { title: 'Service', dataIndex: 'service', key: 'service', width: 100 },
          { title: 'Auth Start', dataIndex: 'authStartDate', key: 'authStartDate', width: 110 },
          { title: 'Auth End', dataIndex: 'authEndDate', key: 'authEndDate', width: 110 },
          { title: 'Auth ID', dataIndex: 'authId', key: 'authId', width: 120 },
          { title: 'Authorized', dataIndex: 'authorizedUnits', key: 'authorizedUnits', width: 100, align: 'right' },
          { title: 'Used', dataIndex: 'usedUnits', key: 'usedUnits', width: 80, align: 'right' },
          { title: 'Available', dataIndex: 'availableUnits', key: 'availableUnits', width: 100, align: 'right' },
          { title: 'Limit Type', dataIndex: 'limitType', key: 'limitType', width: 100 },
        ];

      case 'authorizations':
        return [
          { title: 'Client Name', dataIndex: 'clientName', key: 'clientName', sorter: true, width: 150 },
          { title: 'Payer', dataIndex: 'payerName', key: 'payerName', width: 120 },
          { title: 'Program', dataIndex: 'programIdentifier', key: 'programIdentifier', width: 100 },
          { title: 'Service', dataIndex: 'serviceCode', key: 'serviceCode', width: 100 },
          { title: 'Authorization No', dataIndex: 'authorizationNo', key: 'authorizationNo', width: 140 },
          { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', sorter: true, width: 110 },
          { title: 'End Date', dataIndex: 'endDate', key: 'endDate', sorter: true, width: 110 },
          { title: 'Max Units', dataIndex: 'maxUnits', key: 'maxUnits', width: 100, align: 'right' },
          { title: 'Total Used', dataIndex: 'totalUsed', key: 'totalUsed', width: 100, align: 'right' },
          { title: 'Remaining', dataIndex: 'totalRemaining', key: 'totalRemaining', width: 100, align: 'right' },
          { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
        ];

      case 'clients-without-auth':
        return [
          { title: 'Client Name', dataIndex: 'clientName', key: 'clientName', sorter: true, width: 150 },
          { title: 'Type', dataIndex: 'clientType', key: 'clientType', width: 80 },
          { title: 'Medicaid ID', dataIndex: 'medicaidId', key: 'medicaidId', width: 120 },
          { title: 'Alternate Payer', dataIndex: 'alternatePayer', key: 'alternatePayer', width: 120 },
          { title: 'Payer', dataIndex: 'payer', key: 'payer', width: 120 },
          { title: 'Program', dataIndex: 'program', key: 'program', width: 100 },
          { title: 'Service', dataIndex: 'service', key: 'service', width: 100 },
          { title: 'Supervisor', dataIndex: 'supervisor', key: 'supervisor', width: 150 },
        ];

      case 'expiring-auth':
        return [
          { title: 'Client Name', dataIndex: 'clientName', key: 'clientName', sorter: true, width: 150 },
          { title: 'Type', dataIndex: 'clientType', key: 'clientType', width: 80 },
          { title: 'Medicaid ID', dataIndex: 'medicaidId', key: 'medicaidId', width: 120 },
          { title: 'Payer', dataIndex: 'payer', key: 'payer', width: 120 },
          { title: 'Program', dataIndex: 'program', key: 'program', width: 100 },
          { title: 'Service', dataIndex: 'service', key: 'service', width: 100 },
          { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', width: 110 },
          { title: 'End Date', dataIndex: 'endDate', key: 'endDate', sorter: true, width: 110 },
          { title: 'Auth ID', dataIndex: 'authId', key: 'authId', width: 120 },
          { title: 'Authorized', dataIndex: 'authorizedUnits', key: 'authorizedUnits', width: 100, align: 'right' },
          { title: 'Available', dataIndex: 'available', key: 'available', width: 100, align: 'right' },
          { title: 'Days Left', dataIndex: 'daysUntilExpiration', key: 'daysUntilExpiration', sorter: true, width: 100, align: 'right' },
        ];

      default:
        return [];
    }
  }, [reportType]);

  return (
    <div className={layoutStyles.pageContainer}>
      {/* Control Bar - Header with Actions */}
       <Card className={layoutStyles.controlBar} variant="borderless">
         <div className={layoutStyles.controlsRow}>
           <Space>
             <Button
               icon={<ArrowLeftOutlined />}
               onClick={() => router.push('/reports')}
               className={buttonStyles.btnSecondary}
             >
               BACK
             </Button>
             <Title level={4} style={{ margin: 0, fontSize: '20px', fontWeight: 600 }} className="text-theme-primary">
               {reportName}
             </Title>
           </Space>

          <Space size="middle" className={layoutStyles.rightControls}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
              className={buttonStyles.btnPrimary}
            >
              EXPORT TO EXCEL
            </Button>
          </Space>
        </div>

         {/* Report Parameters Info */}
         {(filters.fromDate || filters.toDate) && (
           <div 
             className="mt-3 px-3 py-2 rounded bg-theme-surface border border-theme"
             style={{ fontSize: '13px' }}
           >
             <Space split="|" size="small">
               {filters.fromDate && <Text className="text-theme-secondary">From: {filters.fromDate}</Text>}
               {filters.toDate && <Text className="text-theme-secondary">To: {filters.toDate}</Text>}
               {filters.fromTime && filters.toTime && (
                 <Text className="text-theme-secondary">Time: {filters.fromTime} - {filters.toTime}</Text>
               )}
             </Space>
           </div>
         )}
      </Card>

      {/* Data Table Card */}
      <Card className={layoutStyles.tableCard} variant="borderless">
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record, index) => index?.toString() || '0'}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} entries`,
            pageSizeOptions: ['10', '25', '50', '100'],
            position: ['bottomCenter'],
          }}
          scroll={{
            x: 'max-content',
            y: 'calc(100vh - 320px)', // Dynamic height
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

