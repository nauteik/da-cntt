"use client";

import React, { useState } from "react";
import { Table, Button, Tag, Space, Input, Card } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useRouter, useSearchParams } from "next/navigation";
import { useClients } from "@/hooks/useClients";
import type {
  PatientSummary,
  PatientStatus,
  PaginatedPatients,
} from "@/types/patient";
import styles from "./clients.module.css";

interface ClientsClientProps {
  initialData: PaginatedPatients;
  searchParams: {
    page?: string;
    size?: string;
    sortBy?: string;
    sortDir?: string;
  };
}

export default function ClientsClient({
  initialData,
  searchParams,
}: ClientsClientProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.page || "0", 10)
  );
  const [pageSize, setPageSize] = useState(
    parseInt(searchParams.size || "25", 10)
  );
  const [sortBy, setSortBy] = useState(searchParams.sortBy || "lastName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    (searchParams.sortDir as "asc" | "desc") || "asc"
  );
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus[]>([]);

  // Use React Query for interactive updates (edit, delete, refresh)
  // with initialData from server for instant display
  const { data, isLoading, error } = useClients(
    {
      page: currentPage,
      size: pageSize,
      sortBy,
      sortDir,
    },
    {
      initialData, // Use server-fetched data immediately
      placeholderData: (previousData) => previousData, // Keep previous data while fetching (React Query v5)
    }
  );

  // Update URL when pagination/sorting changes
  const updateURL = (
    newPage: number,
    newSize: number,
    newSortBy: string,
    newSortDir: "asc" | "desc"
  ) => {
    const params = new URLSearchParams(currentSearchParams);
    params.set("page", newPage.toString());
    params.set("size", newSize.toString());
    params.set("sortBy", newSortBy);
    params.set("sortDir", newSortDir);
    router.push(`/clients?${params.toString()}`, { scroll: false });
  };

  // Define table columns
  const columns: ColumnsType<PatientSummary> = [
    {
      title: "CLIENT",
      dataIndex: "clientName",
      key: "clientName",
      sorter: true,
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
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "SOC",
      dataIndex: "soc",
      key: "soc",
      width: 110,
      sorter: true,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "EOC",
      dataIndex: "eoc",
      key: "eoc",
      width: 110,
      sorter: true,
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

  // Handle table change (pagination, sorting, filtering)
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, unknown>,
    sorter: unknown
  ) => {
    const newPage = (pagination.current || 1) - 1;
    const newSize = pagination.pageSize || 25;

    let newSortBy = sortBy;
    let newSortDir = sortDir;

    // Handle sorting
    if (
      sorter &&
      typeof sorter === "object" &&
      "field" in sorter &&
      "order" in sorter
    ) {
      if (sorter.order) {
        // Map frontend field names to backend field names
        const fieldMapping: Record<string, string> = {
          clientName: "lastName",
          asOf: "asOf",
          soc: "soc",
          eoc: "eoc",
        };
        const field = sorter.field as string;
        newSortBy = fieldMapping[field] || field;
        newSortDir = sorter.order === "ascend" ? "asc" : "desc";
        setSortBy(newSortBy);
        setSortDir(newSortDir);
      }
    }

    // Handle status filter (support multiple selections)
    if (filters.status && Array.isArray(filters.status)) {
      setStatusFilter(filters.status as PatientStatus[]);
    } else {
      setStatusFilter([]);
    }

    setCurrentPage(newPage);
    setPageSize(newSize);
    updateURL(newPage, newSize, newSortBy, newSortDir);
  };

  // Apply client-side filtering for search and status
  const filteredData = React.useMemo(() => {
    if (!data?.content) return [];

    return data.content.filter((client) => {
      // Search filter
      const matchesSearch =
        !searchText ||
        client.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
        client.medicaidId?.toLowerCase().includes(searchText.toLowerCase()) ||
        client.clientPayerId?.toLowerCase().includes(searchText.toLowerCase());

      // Status filter (support multiple selections)
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(client.status);

      return matchesSearch && matchesStatus;
    });
  }, [data?.content, searchText, statusFilter]);

  return (
    <div className={styles.clientsContainer}>
      <Card className={styles.controlBar} bordered={false}>
        <div className={styles.controlsRow}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={styles.createButton}
            onClick={() => router.push("/clients/create")}
          >
            CREATE CLIENT
          </Button>

          <Space size="middle" className={styles.rightControls}>
            <Input
              placeholder="Type here for a quick search..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={styles.searchInput}
              allowClear
            />
            <Button
              icon={<FilterOutlined />}
              type="default"
              className={styles.actionButton}
            >
              FILTERS
            </Button>
            <Button
              type="default"
              icon={<ExportOutlined />}
              className={styles.actionButton}
            >
              EXPORT DATA
            </Button>
          </Space>
        </div>
      </Card>

      <Card className={styles.tableCard} bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage + 1,
            pageSize: pageSize,
            total: data?.totalElements || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} entries`,
            pageSizeOptions: ["10", "25", "50", "100"],
          }}
          scroll={{ x: 1500 }}
          size="small"
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
    </div>
  );
}
