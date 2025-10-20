"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Tag,
  type TablePaginationConfig,
} from "antd";
import {
  ExportOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType, SorterResult } from "antd/es/table/interface";
import type { FilterValue } from "antd/es/table/interface";
import { useDebounce } from "@/hooks/useDebounce";
import { useClients } from "@/hooks/useClients";
import type {
  PaginatedPatients,
  PatientStatus,
  PatientSummary,
} from "@/types/patient";
import styles from "./clients.module.css";
import layoutStyles from "@/styles/table-layout.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import CreateClientModal from "@/components/clients/CreateClientForm";
import type { OfficeDTO } from "@/types/office";

interface ClientsClientProps {
  initialData: PaginatedPatients;
  offices: OfficeDTO[];
}

export default function ClientsClient({
  initialData,
  offices,
}: ClientsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Derive all state from URL - single source of truth
  // URL uses 1-based pagination (page=1 is first page, matching UI)
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("size") || "25", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  const searchText = searchParams.get("search") || "";
  const statusFilter = searchParams.getAll("status") as PatientStatus[];

  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = React.useState(searchText);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Debounce search input to prevent excessive API calls (500ms delay)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync search input with URL on mount and when URL changes
  React.useEffect(() => {
    setSearchInput(searchText);
  }, [searchText]);

  // Update URL when debounced search value changes
  React.useEffect(() => {
    // Only update if the debounced value differs from the current URL search param
    if (debouncedSearch !== searchText) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to first page on search (1-based)
      router.push(`/clients?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, searchText, searchParams, router]);

  // Use React Query with URL-derived state
  // Convert 1-based URL page to 0-based backend page
  const { data, isLoading, error } = useClients(
    {
      page: currentPage - 1, // Backend uses 0-based indexing
      size: pageSize,
      sortBy,
      sortDir,
      search: searchText, // Use URL search param for API call
      status: statusFilter.length > 0 ? statusFilter : undefined,
    },
    {
      initialData, // Use server-rendered data as initial data
      // Don't use placeholderData here - it can cause unnecessary refetches
      // React Query will use cached data automatically if it's still fresh (within staleTime)
    }
  );

  // Define table columns
  const columns: ColumnsType<PatientSummary> = [
    {
      title: "CLIENT",
      dataIndex: "clientName",
      key: "clientName",
      sorter: true,
      sortOrder:
        sortBy === "clientName"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      width: 180,
      fixed: "left",
      render: (name: string, record: PatientSummary) => (
        <span
          className={styles.clientName}
          onClick={() => router.push(`/clients/${record.id}`)}
        >
          {name}
        </span>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
        { text: "Pending", value: "PENDING" },
      ],
      filteredValue: statusFilter.length > 0 ? statusFilter : null,
      render: (status: PatientStatus) => {
        const colorMap: Record<PatientStatus, string> = {
          ACTIVE: "green",
          INACTIVE: "red",
          PENDING: "orange",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "PROGRAM",
      dataIndex: "program",
      key: "program",
      width: 100,
      render: (program: string) => program || "—",
    },
    {
      title: "SUPERVISOR",
      dataIndex: "supervisor",
      key: "supervisor",
      width: 150,
      render: (supervisor: string) => supervisor || "—",
    },
    {
      title: "MEDICAID ID",
      dataIndex: "medicaidId",
      key: "medicaidId",
      width: 130,
      render: (id: string) => id || "—",
    },
    {
      title: "CLIENT PAYER ID",
      dataIndex: "clientPayerId",
      key: "clientPayerId",
      width: 140,
      render: (id: string) => id || "—",
    },
    {
      title: "AS OF",
      dataIndex: "asOf",
      key: "asOf",
      width: 110,
      sorter: true,
      sortOrder:
        sortBy === "asOf"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "SOC",
      dataIndex: "soc",
      key: "soc",
      width: 110,
      sorter: true,
      sortOrder:
        sortBy === "soc"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "EOC",
      dataIndex: "eoc",
      key: "eoc",
      width: 110,
      sorter: true,
      sortOrder:
        sortBy === "eoc"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "SERVICES",
      dataIndex: "services",
      key: "services",
      width: 200,
      render: (services: string[]) => (
        <Space size={[0, 4]} wrap>
          {services && services.length > 0
            ? services.map((service, idx) => (
                <Tag key={idx} color="blue">
                  {service}
                </Tag>
              ))
            : "—"}
        </Space>
      ),
    },
  ];

  // Handle table change via URL navigation
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<PatientSummary> | SorterResult<PatientSummary>[]
  ) => {
    // Create a new URLSearchParams from current params
    const params = new URLSearchParams(searchParams.toString());
    let shouldUpdate = false;

    // Handle sorting - normalize to single sorter
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    const urlSortBy = searchParams.get("sortBy");

    if (sortInfo && sortInfo.field && sortInfo.order) {
      // A new sort is being applied or an existing one is changed
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
      // No new sort is being applied, but a sort exists in the URL, so clear it.
      params.delete("sortBy");
      params.delete("sortDir");
      params.set("page", "1");
      shouldUpdate = true;
    }

    // Handle pagination changes (URL uses 1-based indexing)
    if (pagination.current && pagination.current !== currentPage) {
      params.set("page", String(pagination.current)); // Direct mapping: UI page = URL page
      shouldUpdate = true;
    }
    if (pagination.pageSize && pagination.pageSize !== pageSize) {
      params.set("size", String(pagination.pageSize));
      params.set("page", "1"); // Reset to first page on page size change (1-based)
      shouldUpdate = true;
    }

    // Handle status filter changes
    const currentStatusFilters = searchParams.getAll("status");
    const newStatusFilters = filters.status ? (filters.status as string[]) : [];

    // Compare current and new status filters
    const statusChanged =
      currentStatusFilters.length !== newStatusFilters.length ||
      !currentStatusFilters.every((s) => newStatusFilters.includes(s));

    if (statusChanged) {
      // Remove all existing status parameters
      params.delete("status");

      // Add new status filters
      if (newStatusFilters.length > 0) {
        newStatusFilters.forEach((status) => params.append("status", status));
      }

      params.set("page", "1"); // Reset to first page on filter change (1-based)
      shouldUpdate = true;
    }

    // Only navigate if something actually changed
    if (shouldUpdate) {
      router.push(`/clients?${params.toString()}`, { scroll: false });
    }
  };

  const handleCreateSuccess = () => {
    // Invalidate all queries related to clients to force fresh data fetch
    // This ensures the new patient appears in the list
    queryClient.invalidateQueries({ queryKey: ["clients"] });

    // Navigate to default /clients URL with no query parameters
    // This ensures the new patient appears at the top with default sorting
    router.push("/clients");

    // Force a refresh to fetch fresh data from the server
    // This ensures we bypass any stale cache
    router.refresh();
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <Card className={layoutStyles.controlBar} variant="borderless">
        <div className={layoutStyles.controlsRow}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={buttonStyles.btnPrimary}
            onClick={() => setIsCreateModalOpen(true)}
          >
            CREATE CLIENT
          </Button>

          <Space size="middle" className={layoutStyles.rightControls}>
            <Input
              placeholder="Type here for a quick search..."
              prefix={<SearchOutlined />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={layoutStyles.searchInput}
              allowClear
            />
            <Button
              icon={<FilterOutlined />}
              type="default"
              className={buttonStyles.btnSecondary}
            >
              FILTERS
            </Button>
            <Button
              type="default"
              icon={<ExportOutlined />}
              className={buttonStyles.btnSecondary}
            >
              EXPORT DATA
            </Button>
          </Space>
        </div>
      </Card>

      <Card className={layoutStyles.tableCard} variant="borderless">
        <Table
          columns={columns}
          dataSource={data?.content || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage, // Already 1-based from URL
            pageSize: pageSize,
            total: data?.page?.totalElements || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} entries`,
            pageSizeOptions: ["10", "25", "50", "100"],
            position: ["bottomCenter"],
          }}
          scroll={{
            x: 1500,
            y: "calc(100vh - 280px)", // Dynamic height: viewport - (header + controls + pagination)
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </Card>

      {error && (
        <Card className="mt-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Error Loading Clients
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {error.message === "Không thể kết nối đến máy chủ" ||
                error.status === 503
                  ? "Cannot connect to the server. Please ensure the backend is running."
                  : error.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Create Client Modal */}
      <CreateClientModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        offices={offices}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
}
