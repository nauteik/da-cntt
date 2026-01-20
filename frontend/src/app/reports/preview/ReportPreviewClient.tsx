"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Table, Button, Space, message, Typography } from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import type {
  ReportType,
  ReportFilters,
  AuthVsActualReportDTO,
  AuthorizationReportDTO,
  ClientsWithoutAuthReportDTO,
  ExpiringAuthReportDTO,
  ActiveClientContactDTO,
  ActiveClientDTO,
  ActiveEmployeeDTO,
  CallListingDTO,
  CallSummaryDTO,
  ClientAddressListingDTO,
  EmployeeAttributesDTO,
  GpsDistanceExceptionDTO,
  PayerProgramServiceListingDTO,
  VisitListingDTO,
  PageResponse,
} from "@/types/report";
import { reportApi } from "@/lib/api/reportApi";
import buttonStyles from "@/styles/buttons.module.css";
import layoutStyles from "@/styles/table-layout.module.css";

const { Title, Text } = Typography;

type ReportData =
  | AuthVsActualReportDTO
  | AuthorizationReportDTO
  | ClientsWithoutAuthReportDTO
  | ExpiringAuthReportDTO
  | ActiveClientContactDTO
  | ActiveClientDTO
  | ActiveEmployeeDTO
  | CallListingDTO
  | CallSummaryDTO
  | ClientAddressListingDTO
  | EmployeeAttributesDTO
  | GpsDistanceExceptionDTO
  | PayerProgramServiceListingDTO
  | VisitListingDTO;

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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Parse query params
  const reportType = searchParams.get("reportType") as ReportType;
  const reportName = searchParams.get("reportName") || "Report";
  const filtersParam = searchParams.get("filters");
  const filters: ReportFilters = filtersParam ? JSON.parse(filtersParam) : {};

  // Fetch report data
  const fetchReportData = async (
    page: number,
    pageSize: number,
    sort?: string
  ) => {
    setLoading(true);
    try {
      let response: PageResponse<ReportData>;
      const paginationParams = {
        page: page - 1, // Backend uses 0-based indexing
        size: pageSize,
        sort,
      };

      switch (reportType) {
        case "auth-vs-actual":
          response = await reportApi.getAuthVsActualReport(
            filters,
            paginationParams
          );
          break;
        case "authorizations":
          response = await reportApi.getAuthorizationsReport(
            filters,
            paginationParams
          );
          break;
        case "clients-without-auth":
          response = await reportApi.getClientsWithoutAuthReport(
            filters,
            paginationParams
          );
          break;
        case "expiring-auth":
          response = await reportApi.getExpiringAuthReport(
            filters,
            paginationParams
          );
          break;
        case "active-client-contacts":
          response = await reportApi.getActiveClientContacts(
            filters,
            paginationParams
          );
          break;
        case "active-clients":
          response = await reportApi.getActiveClients(
            filters,
            paginationParams
          );
          break;
        case "active-employees":
          response = await reportApi.getActiveEmployees(
            filters,
            paginationParams
          );
          break;
        case "call-listing":
          response = await reportApi.getCallListing(
            filters,
            paginationParams
          );
          break;
        case "call-summary":
          response = await reportApi.getCallSummary(
            filters,
            paginationParams
          );
          break;
        case "client-address-listing":
          response = await reportApi.getClientAddressListing(
            filters,
            paginationParams
          );
          break;
        case "employee-attributes":
          response = await reportApi.getEmployeeAttributes(
            filters,
            paginationParams
          );
          break;
        case "gps-distance-exception":
          response = await reportApi.getGpsDistanceException(
            filters,
            paginationParams
          );
          break;
        case "payer-program-service-listing":
          response = await reportApi.getPayerProgramServiceListing(
            filters,
            paginationParams
          );
          break;
        case "visit-listing":
          response = await reportApi.getVisitListing(
            filters,
            paginationParams
          );
          break;
        default:
          message.error("Invalid report type");
          return;
      }

      setData(response.content);
      setPagination({
        current: page,
        pageSize,
        total: response.page?.totalElements || 0,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      message.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType) {
      const sortParam =
        sortField && sortOrder
          ? `${sortField},${sortOrder === "asc" ? "asc" : "desc"}`
          : undefined;
      fetchReportData(pagination.current, pagination.pageSize, sortParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<ReportData> | SorterResult<ReportData>[]
  ) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;

    // Handle sorting
    if (sortInfo && sortInfo.field && sortInfo.order) {
      const newSortField = String(sortInfo.field);
      const newSortOrder = sortInfo.order === "ascend" ? "asc" : "desc";
      setSortField(newSortField);
      setSortOrder(newSortOrder);
      const sortParam = `${newSortField},${newSortOrder}`;
      fetchReportData(
        pagination.current || 1,
        pagination.pageSize || 25,
        sortParam
      );
    } else {
      setSortField(null);
      setSortOrder(null);
      fetchReportData(pagination.current || 1, pagination.pageSize || 25);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Determine which export function to use based on report type
      const isDailyReport = [
        'active-client-contacts', 'active-clients', 'active-employees',
        'call-listing', 'call-summary', 'client-address-listing',
        'employee-attributes', 'gps-distance-exception',
        'payer-program-service-listing', 'visit-listing'
      ].includes(reportType);

      const blob = isDailyReport 
        ? await reportApi.exportDailyReport(reportType, filters)
        : await reportApi.exportReport(reportType, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      message.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  // Define columns based on report type
  const columns = useMemo((): ColumnsType<ReportData> => {
    switch (reportType) {
      case "auth-vs-actual":
        return [
          {
            title: "Client Name",
            dataIndex: "clientName",
            key: "clientName",
            sorter: true,
            width: 150,
          },
          {
            title: "Type",
            dataIndex: "clientType",
            key: "clientType",
            width: 80,
          },
          {
            title: "Medicaid ID",
            dataIndex: "medicaidId",
            key: "medicaidId",
            width: 120,
          },
          {
            title: "Alternate Payer",
            dataIndex: "alternatePayer",
            key: "alternatePayer",
            width: 120,
          },
          { title: "Payer", dataIndex: "payer", key: "payer", width: 120 },
          {
            title: "Program",
            dataIndex: "program",
            key: "program",
            width: 100,
          },
          {
            title: "Service",
            dataIndex: "service",
            key: "service",
            width: 100,
          },
          {
            title: "Auth Start",
            dataIndex: "authStartDate",
            key: "authStartDate",
            width: 110,
          },
          {
            title: "Auth End",
            dataIndex: "authEndDate",
            key: "authEndDate",
            width: 110,
          },
          { title: "Auth ID", dataIndex: "authId", key: "authId", width: 120 },
          {
            title: "Authorized",
            dataIndex: "authorizedUnits",
            key: "authorizedUnits",
            width: 100,
            align: "right",
          },
          {
            title: "Used",
            dataIndex: "usedUnits",
            key: "usedUnits",
            width: 80,
            align: "right",
          },
          {
            title: "Available",
            dataIndex: "availableUnits",
            key: "availableUnits",
            width: 100,
            align: "right",
          },
          {
            title: "Limit Type",
            dataIndex: "limitType",
            key: "limitType",
            width: 100,
          },
        ];

      case "authorizations":
        return [
          {
            title: "Client Name",
            dataIndex: "clientName",
            key: "clientName",
            sorter: true,
            width: 150,
          },
          {
            title: "Payer",
            dataIndex: "payerName",
            key: "payerName",
            width: 120,
          },
          {
            title: "Program",
            dataIndex: "programIdentifier",
            key: "programIdentifier",
            width: 100,
          },
          {
            title: "Service",
            dataIndex: "serviceCode",
            key: "serviceCode",
            width: 100,
          },
          {
            title: "Authorization No",
            dataIndex: "authorizationNo",
            key: "authorizationNo",
            width: 140,
          },
          {
            title: "Start Date",
            dataIndex: "startDate",
            key: "startDate",
            sorter: true,
            width: 110,
          },
          {
            title: "End Date",
            dataIndex: "endDate",
            key: "endDate",
            sorter: true,
            width: 110,
          },
          {
            title: "Max Units",
            dataIndex: "maxUnits",
            key: "maxUnits",
            width: 100,
            align: "right",
          },
          {
            title: "Total Used",
            dataIndex: "totalUsed",
            key: "totalUsed",
            width: 100,
            align: "right",
          },
          {
            title: "Remaining",
            dataIndex: "totalRemaining",
            key: "totalRemaining",
            width: 100,
            align: "right",
          },
          { title: "Status", dataIndex: "status", key: "status", width: 100 },
        ];

      case "clients-without-auth":
        return [
          {
            title: "Client Name",
            dataIndex: "clientName",
            key: "clientName",
            sorter: true,
            width: 150,
          },
          {
            title: "Type",
            dataIndex: "clientType",
            key: "clientType",
            width: 80,
          },
          {
            title: "Medicaid ID",
            dataIndex: "medicaidId",
            key: "medicaidId",
            width: 120,
          },
          {
            title: "Alternate Payer",
            dataIndex: "alternatePayer",
            key: "alternatePayer",
            width: 120,
          },
          { title: "Payer", dataIndex: "payer", key: "payer", width: 120 },
          {
            title: "Program",
            dataIndex: "program",
            key: "program",
            width: 100,
          },
          {
            title: "Service",
            dataIndex: "service",
            key: "service",
            width: 100,
          },
          {
            title: "Supervisor",
            dataIndex: "supervisor",
            key: "supervisor",
            width: 150,
          },
        ];

      case "expiring-auth":
        return [
          {
            title: "Client Name",
            dataIndex: "clientName",
            key: "clientName",
            sorter: true,
            width: 150,
          },
          {
            title: "Type",
            dataIndex: "clientType",
            key: "clientType",
            width: 80,
          },
          {
            title: "Medicaid ID",
            dataIndex: "medicaidId",
            key: "medicaidId",
            width: 120,
          },
          { title: "Payer", dataIndex: "payer", key: "payer", width: 120 },
          {
            title: "Program",
            dataIndex: "program",
            key: "program",
            width: 100,
          },
          {
            title: "Service",
            dataIndex: "service",
            key: "service",
            width: 100,
          },
          {
            title: "Start Date",
            dataIndex: "startDate",
            key: "startDate",
            width: 110,
          },
          {
            title: "End Date",
            dataIndex: "endDate",
            key: "endDate",
            sorter: true,
            width: 110,
          },
          { title: "Auth ID", dataIndex: "authId", key: "authId", width: 120 },
          {
            title: "Authorized",
            dataIndex: "authorizedUnits",
            key: "authorizedUnits",
            width: 100,
            align: "right",
          },
          {
            title: "Available",
            dataIndex: "available",
            key: "available",
            width: 100,
            align: "right",
          },
          {
            title: "Days Left",
            dataIndex: "daysUntilExpiration",
            key: "daysUntilExpiration",
            sorter: true,
            width: 100,
            align: "right",
          },
        ];

      case "active-client-contacts":
        return [
          { title: "Account Name", dataIndex: "accountName", key: "accountName", width: 150 },
          { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 150, sorter: true },
          { title: "Client Medicaid ID", dataIndex: "clientMedicaidId", key: "clientMedicaidId", width: 140 },
          { title: "Contact Name", dataIndex: "contactName", key: "contactName", width: 150 },
          { title: "Relationship", dataIndex: "relationshipToClient", key: "relationshipToClient", width: 120 },
          { title: "Email", dataIndex: "email", key: "email", width: 200 },
        ];

      case "active-clients":
        return [
          { title: "Account Name", dataIndex: "accountName", key: "accountName", width: 150 },
          { title: "Client Medicaid ID", dataIndex: "clientMedicaidId", key: "clientMedicaidId", width: 140 },
          { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 150, sorter: true },
          { title: "Phone", dataIndex: "phone", key: "phone", width: 120 },
          { title: "Address", dataIndex: "address", key: "address", width: 200 },
          { title: "City", dataIndex: "city", key: "city", width: 120 },
          { title: "State", dataIndex: "state", key: "state", width: 80 },
          { title: "ZIP", dataIndex: "zip", key: "zip", width: 90 },
          { title: "County", dataIndex: "county", key: "county", width: 120 },
          { title: "Active Since", dataIndex: "activeSinceDate", key: "activeSinceDate", width: 110 },
        ];

      case "active-employees":
        return [
          { title: "Account Name", dataIndex: "accountName", key: "accountName", width: 150 },
          { title: "Employee ID", dataIndex: "employeeId", key: "employeeId", width: 120 },
          { title: "Employee Name", dataIndex: "employeeName", key: "employeeName", width: 150, sorter: true },
          { title: "Email", dataIndex: "employeeEmail", key: "employeeEmail", width: 200 },
          { title: "Phone", dataIndex: "phone", key: "phone", width: 120 },
          { title: "Department", dataIndex: "department", key: "department", width: 120 },
        ];

      case "call-listing":
        return [
          { title: "Account Name", dataIndex: "accountName", key: "accountName", width: 150 },
          { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 150 },
          { title: "Client Medicaid ID", dataIndex: "clientMedicaidId", key: "clientMedicaidId", width: 140 },
          { title: "Employee Name", dataIndex: "employeeName", key: "employeeName", width: 150 },
          { title: "Visit Date", dataIndex: "visitDate", key: "visitDate", width: 110, sorter: true },
          { title: "Start Time", dataIndex: "startTime", key: "startTime", width: 100 },
          { title: "End Time", dataIndex: "endTime", key: "endTime", width: 100 },
          { title: "Call In", dataIndex: "callInTime", key: "callInTime", width: 100 },
          { title: "Call Out", dataIndex: "callOutTime", key: "callOutTime", width: 100 },
          { title: "Status", dataIndex: "status", key: "status", width: 100 },
          { title: "Indicators", dataIndex: "indicators", key: "indicators", width: 100 },
        ];

      case "call-summary":
        return [
          { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 150, sorter: true },
          { title: "Client Medicaid ID", dataIndex: "clientMedicaidId", key: "clientMedicaidId", width: 140 },
          { title: "Employee Name", dataIndex: "employeeName", key: "employeeName", width: 150 },
          { title: "Employee ID", dataIndex: "employeeId", key: "employeeId", width: 120 },
          { title: "Start Time", dataIndex: "startTime", key: "startTime", width: 100 },
          { title: "End Time", dataIndex: "endTime", key: "endTime", width: 100 },
          { title: "Calls Start", dataIndex: "callsStart", key: "callsStart", width: 100, align: "right" },
          { title: "Calls End", dataIndex: "callsEnd", key: "callsEnd", width: 100, align: "right" },
          { title: "Hours Total", dataIndex: "hoursTotal", key: "hoursTotal", width: 100, align: "right" },
          { title: "Units", dataIndex: "units", key: "units", width: 80, align: "right" },
        ];

      case "client-address-listing":
        return [
          { title: "Account Name", dataIndex: "accountName", key: "accountName", width: 150 },
          { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 150, sorter: true },
          { title: "Client Medicaid ID", dataIndex: "clientMedicaidId", key: "clientMedicaidId", width: 140 },
          { title: "Tag", dataIndex: "tag", key: "tag", width: 100 },
          { title: "Address Type", dataIndex: "addressType", key: "addressType", width: 110 },
          { title: "Phone", dataIndex: "phone", key: "phone", width: 120 },
          { title: "Address", dataIndex: "address", key: "address", width: 200 },
          { title: "City", dataIndex: "city", key: "city", width: 120 },
          { title: "State", dataIndex: "state", key: "state", width: 80 },
          { title: "ZIP", dataIndex: "zip", key: "zip", width: 90 },
          { title: "County", dataIndex: "county", key: "county", width: 120 },
        ];

      case "employee-attributes":
        return [
          { title: "Employee Name", dataIndex: "employeeName", key: "employeeName", width: 200, sorter: true },
          { title: "Attribute Name", dataIndex: "attributeName", key: "attributeName", width: 200 },
          { title: "Attribute Value", dataIndex: "attributeValue", key: "attributeValue", width: 200 },
        ];

      case "gps-distance-exception":
        return [
          { title: "Account Name", dataIndex: "accountName", key: "accountName", width: 150 },
          { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 150 },
          { title: "Client Medicaid ID", dataIndex: "clientMedicaidId", key: "clientMedicaidId", width: 140 },
          { title: "Employee Name", dataIndex: "employeeName", key: "employeeName", width: 150 },
          { title: "Visit Date", dataIndex: "visitDate", key: "visitDate", width: 110, sorter: true },
          { title: "Start Time", dataIndex: "startTime", key: "startTime", width: 100 },
          { title: "End Time", dataIndex: "endTime", key: "endTime", width: 100 },
          { title: "Expected (km)", dataIndex: "expectedDistance", key: "expectedDistance", width: 120, align: "right" },
          { title: "Actual (km)", dataIndex: "actualDistance", key: "actualDistance", width: 110, align: "right" },
          { title: "Variance (km)", dataIndex: "variance", key: "variance", width: 120, align: "right" },
          { title: "Exception Reason", dataIndex: "exceptionReason", key: "exceptionReason", width: 200 },
        ];

      case "payer-program-service-listing":
        return [
          { title: "Payer Name", dataIndex: "payerName", key: "payerName", width: 200, sorter: true },
          { title: "Program Name", dataIndex: "programName", key: "programName", width: 200 },
          { title: "Service Code", dataIndex: "serviceCode", key: "serviceCode", width: 120 },
          { title: "Service Name", dataIndex: "serviceName", key: "serviceName", width: 200 },
        ];

      case "visit-listing":
        return [
          { title: "Account Name", dataIndex: "accountName", key: "accountName", width: 150 },
          { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 150 },
          { title: "Client Medicaid ID", dataIndex: "clientMedicaidId", key: "clientMedicaidId", width: 140 },
          { title: "Employee Name", dataIndex: "employeeName", key: "employeeName", width: 150 },
          { title: "Employee ID", dataIndex: "employeeId", key: "employeeId", width: 120 },
          { title: "Visit Date", dataIndex: "visitDate", key: "visitDate", width: 110, sorter: true },
          { title: "Start Time", dataIndex: "startTime", key: "startTime", width: 100 },
          { title: "End Time", dataIndex: "endTime", key: "endTime", width: 100 },
          { title: "Status", dataIndex: "status", key: "status", width: 100 },
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
          <div
            onClick={() => router.push("/reports")}
            className="flex items-center gap-1 font-semibold text-base cursor-pointer text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            <LeftOutlined /> BACK
          </div>
          <Title
            level={4}
            style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}
            className="text-theme-primary"
          >
            {reportName}
          </Title>

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
            className="mt-3 px-3 py-2 bg-theme-surface border border-theme"
            style={{ fontSize: "13px" }}
          >
            <Space split="|" size="small">
              {filters.fromDate && (
                <Text className="text-theme-secondary">
                  From: {filters.fromDate}
                </Text>
              )}
              {filters.toDate && (
                <Text className="text-theme-secondary">
                  To: {filters.toDate}
                </Text>
              )}
              {filters.fromTime && filters.toTime && (
                <Text className="text-theme-secondary">
                  Time: {filters.fromTime} - {filters.toTime}
                </Text>
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
          rowKey={(record, index) => index?.toString() || "0"}
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
            pageSizeOptions: ["10", "25", "50", "100"],
            position: ["bottomCenter"],
          }}
          scroll={{
            x: "max-content",
            y: "calc(100vh - 320px)", // Dynamic height
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
