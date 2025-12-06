"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Table,
  Input,
  Button,
  Tag,
  DatePicker,
  Select,
  Row,
  Col,
  type TablePaginationConfig,
} from "antd";
import {
  ExportOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType, SorterResult } from "antd/es/table/interface";
import type { FilterValue } from "antd/es/table/interface";
import dayjs, { type Dayjs } from "dayjs";
import { useAuthorizations } from "@/hooks/useAuthorizations";
import type {
  PaginatedAuthorizations,
  AuthorizationStatus,
  AuthorizationSearchResult,
} from "@/types/authorization";
import type { PayerSelectDTO, ProgramSelectDTO, ServiceTypeSelectDTO } from "@/types/patient";
import type { StaffSelectDTO } from "@/types/staff";
import layoutStyles from "@/styles/table-layout.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import formStyles from "@/styles/form.module.css";

const { RangePicker } = DatePicker;

interface AuthorizationsClientProps {
  initialData: PaginatedAuthorizations;
  payers: PayerSelectDTO[];
  supervisors: StaffSelectDTO[];
  programs: ProgramSelectDTO[];
  services: ServiceTypeSelectDTO[];
}

export default function AuthorizationsClient({
  initialData,
  payers,
  supervisors,
  programs,
  services,
}: AuthorizationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive all state from URL - single source of truth
  // URL uses 1-based pagination (page=1 is first page, matching UI)
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("size") || "25", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  
  // Form filters from URL
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const payerId = searchParams.get("payerId") || undefined;
  const supervisorId = searchParams.get("supervisorId") || undefined;
  const programId = searchParams.get("programId") || undefined;
  const serviceTypeId = searchParams.get("serviceTypeId") || undefined;
  const authorizationNo = searchParams.get("authorizationNo") || "";
  const clientId = searchParams.get("clientId") || "";
  const clientFirstName = searchParams.get("clientFirstName") || "";
  const clientLastName = searchParams.get("clientLastName") || "";
  const status = searchParams.get("status") || undefined;

  // Check if we have any search parameters (if not, don't fetch data)
  const hasSearchParams = Boolean(
    startDateParam || endDateParam || payerId || supervisorId || programId || 
    serviceTypeId || authorizationNo || clientId || clientFirstName || 
    clientLastName || status
  );

  // Local state for form inputs (for immediate UI feedback)
  const [dateRange, setDateRange] = React.useState<[Dayjs | null, Dayjs | null] | null>(
    startDateParam && endDateParam
      ? [dayjs(startDateParam), dayjs(endDateParam)]
      : null
  );
  const [payerIdInput, setPayerIdInput] = React.useState<string | undefined>(payerId);
  const [supervisorIdInput, setSupervisorIdInput] = React.useState<string | undefined>(supervisorId);
  const [programIdInput, setProgramIdInput] = React.useState<string | undefined>(programId);
  const [serviceTypeIdInput, setServiceTypeIdInput] = React.useState<string | undefined>(serviceTypeId);
  const [authorizationNoInput, setAuthorizationNoInput] = React.useState(authorizationNo);
  const [clientIdInput, setClientIdInput] = React.useState(clientId);
  const [clientFirstNameInput, setClientFirstNameInput] = React.useState(clientFirstName);
  const [clientLastNameInput, setClientLastNameInput] = React.useState(clientLastName);
  const [statusInput, setStatusInput] = React.useState<string | undefined>(status);

  // Use React Query with URL-derived state
  // Only fetch if we have search parameters
  // Convert 1-based URL page to 0-based backend page
  const { data, isLoading } = useAuthorizations(
    {
      page: currentPage - 1, // Backend uses 0-based indexing
      size: pageSize,
      sortBy,
      sortDir,
      startDate: startDateParam || undefined,
      endDate: endDateParam || undefined,
      payerId,
      supervisorId,
      programId,
      serviceTypeId,
      authorizationNo: authorizationNo || undefined,
      clientId: clientId || undefined,
      clientFirstName: clientFirstName || undefined,
      clientLastName: clientLastName || undefined,
      status,
    },
    {
      enabled: hasSearchParams, // Only fetch when we have search params
      initialData: hasSearchParams ? initialData : undefined,
    }
  );

  // Use data from query or fallback to initialData (same pattern as EmployeesClient/ClientsClient)
  const currentData = data || initialData;

  // Define table columns
  const columns: ColumnsType<AuthorizationSearchResult> = [
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 100,
      sorter: true,
      sortOrder:
        sortBy === "status"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (status: AuthorizationStatus) => {
        const colorMap: Record<AuthorizationStatus, string> = {
          ACTIVE: "green",
          EXPIRED: "red",
          PENDING: "orange",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "CLIENT ID",
      dataIndex: "clientId",
      key: "clientId",
      width: 120,
    },
    {
      title: "CLIENT NAME",
      dataIndex: "clientName",
      key: "clientName",
      width: 200,
      sorter: true,
      sortOrder:
        sortBy === "clientName"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (name: string, record: AuthorizationSearchResult) => (
        <span
          onClick={() => router.push(`/authorizations/${record.authorizationId}/view`)}
          className="text-[var(--primary)] cursor-pointer font-medium transition-colors duration-200 hover:text-[var(--primary-hover)] hover:underline"
        >
          {name}
        </span>
      ),
    },
    {
      title: "SUPERVISOR",
      dataIndex: "supervisorName",
      key: "supervisorName",
      width: 150,
      render: (name: string) => name || "—",
    },
    {
      title: "PAYER",
      dataIndex: "payerName",
      key: "payerName",
      width: 150,
      sorter: true,
      sortOrder:
        sortBy === "payerName"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "PROGRAM",
      dataIndex: "programIdentifier",
      key: "programIdentifier",
      width: 120,
      sorter: true,
      sortOrder:
        sortBy === "programIdentifier"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "SERVICE",
      dataIndex: "serviceName",
      key: "serviceName",
      width: 200,
      sorter: true,
      sortOrder:
        sortBy === "serviceCode"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (_: string, record: AuthorizationSearchResult) =>
        `${record.serviceCode} - ${record.serviceName}`,
    },
    {
      title: "AUTHORIZATION REFERENCE NUMBER",
      dataIndex: "authorizationNo",
      key: "authorizationNo",
      width: 200,
      sorter: true,
      sortOrder:
        sortBy === "authorizationNo"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "FROM DATE",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      sorter: true,
      sortOrder:
        sortBy === "startDate"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? dayjs(date).format("MM/DD/YYYY") : "—",
    },
    {
      title: "TO DATE",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      sorter: true,
      sortOrder:
        sortBy === "endDate"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? dayjs(date).format("MM/DD/YYYY") : "—",
    },
    {
      title: "MAX UNITS",
      dataIndex: "maxUnits",
      key: "maxUnits",
      width: 120,
      sorter: true,
      sortOrder:
        sortBy === "maxUnits"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (units: number) => units?.toFixed(2) || "—",
    },
    {
      title: "USED",
      dataIndex: "totalUsed",
      key: "totalUsed",
      width: 100,
      sorter: true,
      sortOrder:
        sortBy === "totalUsed"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (used: number) => used?.toFixed(2) || "—",
    },
    {
      title: "REMAINING",
      dataIndex: "totalRemaining",
      key: "totalRemaining",
      width: 120,
      sorter: true,
      sortOrder:
        sortBy === "totalRemaining"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (remaining: number) => remaining?.toFixed(2) || "—",
    },
  ];

  // Handle table change via URL navigation
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<AuthorizationSearchResult> | SorterResult<AuthorizationSearchResult>[]
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    let shouldUpdate = false;

    // Handle sorting
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    const urlSortBy = searchParams.get("sortBy");

    if (sortInfo && sortInfo.field && sortInfo.order) {
      const newSortBy = String(sortInfo.field);
      const newSortDir = sortInfo.order === "ascend" ? "asc" : "desc";
      const urlSortDir = searchParams.get("sortDir") || "asc";

      if (newSortBy !== urlSortBy || newSortDir !== urlSortDir) {
        params.set("sortBy", newSortBy);
        params.set("sortDir", newSortDir);
        params.set("page", "1");
        shouldUpdate = true;
      }
    } else if (urlSortBy) {
      params.delete("sortBy");
      params.delete("sortDir");
      params.set("page", "1");
      shouldUpdate = true;
    }

    // Handle pagination changes
    if (pagination.current && pagination.current !== currentPage) {
      params.set("page", String(pagination.current));
      shouldUpdate = true;
    }
    if (pagination.pageSize && pagination.pageSize !== pageSize) {
      params.set("size", String(pagination.pageSize));
      params.set("page", "1");
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      router.push(`/authorizations?${params.toString()}`, { scroll: false });
    }
  };

  // Handle search button click
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Add date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.set("startDate", dateRange[0].format("YYYY-MM-DD"));
      params.set("endDate", dateRange[1].format("YYYY-MM-DD"));
    }
    
    // Add filters
    if (payerIdInput) params.set("payerId", payerIdInput);
    if (supervisorIdInput) params.set("supervisorId", supervisorIdInput);
    if (programIdInput) params.set("programId", programIdInput);
    if (serviceTypeIdInput) params.set("serviceTypeId", serviceTypeIdInput);
    if (authorizationNoInput) params.set("authorizationNo", authorizationNoInput);
    if (clientIdInput) params.set("clientId", clientIdInput);
    if (clientFirstNameInput) params.set("clientFirstName", clientFirstNameInput);
    if (clientLastNameInput) params.set("clientLastName", clientLastNameInput);
    if (statusInput) params.set("status", statusInput);
    
    // Reset to first page
    params.set("page", "1");
    params.set("size", String(pageSize));
    
    // Keep sort if exists
    if (sortBy) {
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);
    }
    
    router.push(`/authorizations?${params.toString()}`, { scroll: false });
  };

  // Handle clear button click
  const handleClear = () => {
    setDateRange(null);
    setPayerIdInput(undefined);
    setSupervisorIdInput(undefined);
    setProgramIdInput(undefined);
    setServiceTypeIdInput(undefined);
    setAuthorizationNoInput("");
    setClientIdInput("");
    setClientFirstNameInput("");
    setClientLastNameInput("");
    setStatusInput(undefined);
    
    // Clear URL params - go to base page without any params
    router.push("/authorizations", { scroll: false });
  };

  // Handle export (placeholder)
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked");
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <Card className={layoutStyles.controlBar} variant="borderless">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Search Authorizations</h2>
          
          <Row gutter={16}>
            {/* Left column - 40% width */}
            <Col span={10}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    DATE RANGE MM/DD/YYYY
                  </label>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                    format="MM/DD/YYYY"
                    className={`w-full ${formStyles.formDatePicker}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">PAYER</label>
                  <Select
                    value={payerIdInput}
                    onChange={setPayerIdInput}
                    placeholder="Select Payer"
                    allowClear
                    className={`w-full ${formStyles.formSelect}`}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={payers.map((p) => ({
                      value: p.id,
                      label: p.payerName,
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">SUPERVISOR</label>
                  <Select
                    value={supervisorIdInput}
                    onChange={setSupervisorIdInput}
                    placeholder="Select Supervisor"
                    allowClear
                    className={`w-full ${formStyles.formSelect}`}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={supervisors.map((s) => ({
                      value: s.id,
                      label: s.displayName,
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    AUTHORIZATION REFERENCE NUMBER
                  </label>
                  <Input
                    value={authorizationNoInput}
                    onChange={(e) => setAuthorizationNoInput(e.target.value)}
                    placeholder="Enter Authorization Reference Number"
                    className={formStyles.formInput}
                  />
                </div>
              </div>
            </Col>
            
            {/* Right column - 60% width */}
            <Col span={14}>
              <div className="space-y-4">
                <Row gutter={12}>
                  <Col span={8}>
                    <label className="block text-sm font-medium mb-1">CLIENT ID</label>
                    <Input
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      placeholder="Enter Client ID"
                      className={formStyles.formInput}
                    />
                  </Col>
                  <Col span={8}>
                    <label className="block text-sm font-medium mb-1">CLIENT FIRST NAME</label>
                    <Input
                      value={clientFirstNameInput}
                      onChange={(e) => setClientFirstNameInput(e.target.value)}
                      placeholder="Enter Client First Name"
                      className={formStyles.formInput}
                    />
                  </Col>
                  <Col span={8}>
                    <label className="block text-sm font-medium mb-1">CLIENT LAST NAME</label>
                    <Input
                      value={clientLastNameInput}
                      onChange={(e) => setClientLastNameInput(e.target.value)}
                      placeholder="Enter Client Last Name"
                      className={formStyles.formInput}
                    />
                  </Col>
                </Row>
                
                <Row gutter={12}>
                  <Col span={12}>
                    <label className="block text-sm font-medium mb-1">PROGRAM</label>
                    <Select
                      value={programIdInput}
                      onChange={setProgramIdInput}
                      placeholder="Select Program"
                      allowClear
                      className={`w-full ${formStyles.formSelect}`}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={programs.map((p) => ({
                        value: p.id,
                        label: p.programIdentifier,
                      }))}
                    />
                  </Col>
                  <Col span={12}>
                    <label className="block text-sm font-medium mb-1">SERVICE</label>
                    <Select
                      value={serviceTypeIdInput}
                      onChange={setServiceTypeIdInput}
                      placeholder="Select Service"
                      allowClear
                      className={`w-full ${formStyles.formSelect}`}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={services.map((s) => ({
                        value: s.id,
                        label: `${s.code} - ${s.name}`,
                      }))}
                    />
                  </Col>
                </Row>
                
                <div>
                  <label className="block text-sm font-medium mb-1">AUTHORIZATION STATUS</label>
                  <Select
                    value={statusInput}
                    onChange={setStatusInput}
                    placeholder="All"
                    allowClear
                    className={`w-full ${formStyles.formSelect}`}
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "EXPIRED", label: "Expired" },
                      { value: "PENDING", label: "Pending" },
                    ]}
                  />
                </div>
              </div>
            </Col>
          </Row>
          
          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className={buttonStyles.btnPrimary}
              onClick={handleSearch}
            >
              SEARCH
            </Button>
            <Button
              type="default"
              className={buttonStyles.btnSecondary}
              onClick={handleClear}
            >
              CLEAR
            </Button>
            <Button
              type="default"
              icon={<ExportOutlined />}
              className={buttonStyles.btnSecondary}
              onClick={handleExport}
            >
              EXPORT
            </Button>
          </div>
        </div>
      </Card>

      <Card className={layoutStyles.tableCard} variant="borderless">
        {hasSearchParams ? (
          <Table
            columns={columns}
            dataSource={currentData?.content || []}
            rowKey="authorizationId"
            loading={isLoading}
            onChange={handleTableChange}
            pagination={{
              current: currentPage, // Already 1-based from URL
              pageSize: pageSize,
              total: currentData?.page?.totalElements || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} entries`,
              pageSizeOptions: ["10", "25", "50", "100"],
              position: ["bottomCenter", "topRight"],
            }}
            scroll={{
              x: "max-content",
              y: "calc(100vh - 580px)",
            }}
            size="small"
            sticky={{
              offsetHeader: 0,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Please select search criteria and click SEARCH to view results
          </div>
        )}
      </Card>
    </div>
  );
}