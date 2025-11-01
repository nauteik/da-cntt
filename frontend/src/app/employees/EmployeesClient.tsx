"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useEmployees } from "@/hooks/useEmployees";
import CreateStaffForm from "@/components/employees/CreateStaffForm";
import type {
  PaginatedStaff,
  StaffStatus,
  StaffSummary,
} from "@/types/staff";
import type { OfficeDTO } from "@/types/office";
import type { RoleDTO } from "@/types/role";
import layoutStyles from "@/styles/table-layout.module.css";
import buttonStyles from "@/styles/buttons.module.css";

interface EmployeesClientProps {
  initialData: PaginatedStaff;
  offices: OfficeDTO[];
  roles: RoleDTO[];
}

export default function EmployeesClient({
  initialData,
  offices,
  roles,
}: EmployeesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive all state from URL - single source of truth
  // URL uses 1-based pagination (page=1 is first page, matching UI)
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("size") || "25", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  const searchText = searchParams.get("search") || "";
  const statusFilter = searchParams.getAll("status") as StaffStatus[];
  const roleFilter = searchParams.getAll("role") as string[];

  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = React.useState(searchText);
  
  // State for create modal
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

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
      router.push(`/employees?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, searchText, searchParams, router]);

  // Use React Query with URL-derived state
  // Convert 1-based URL page to 0-based backend page
  const { data, isLoading, error, refetch } = useEmployees(
    {
      page: currentPage - 1, // Backend uses 0-based indexing
      size: pageSize,
      sortBy,
      sortDir,
      search: searchText, // Use URL search param for API call
      status: statusFilter.length > 0 ? statusFilter : undefined,
      role: roleFilter.length > 0 ? roleFilter : undefined,
    },
    {
      initialData, // Use server-rendered data as initial data
      // Don't use placeholderData here - it can cause unnecessary refetches
      // React Query will use cached data automatically if it's still fresh (within staleTime)
    }
  );

  // Handle create success
  const handleCreateSuccess = () => {
    refetch(); // Refetch the employee list
  };

  // Define table columns
  const columns: ColumnsType<StaffSummary> = [
    {
      title: "EMPLOYEE",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        sortBy === "name"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      width: 180,
      fixed: "left",
      render: (name: string, record: StaffSummary) => (
        <span
          className="cursor-pointer font-medium transition-colors"
          style={{
            color: 'var(--primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary-hover)';
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.textDecoration = 'none';
          }}
          onClick={() => router.push(`/employees/${record.id}`)}
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
      ],
      filteredValue: statusFilter.length > 0 ? statusFilter : null,
      render: (status: StaffStatus) => {
        const colorMap: Record<StaffStatus, string> = {
          ACTIVE: "green",
          INACTIVE: "red",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "EMPLOYEE ID",
      dataIndex: "employeeId",
      key: "employeeId",
      width: 130,
      sorter: true,
      sortOrder:
        sortBy === "employeeId"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (id: string) => id || "—",
    },
    {
      title: "POSITION",
      dataIndex: "position",
      key: "position",
      width: 120,
      sorter: true,
      sortOrder:
        sortBy === "position"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      filters: roles.map((role) => ({
        text: role.name,
        value: role.name,
      })),
      filteredValue: roleFilter.length > 0 ? roleFilter : null,
      render: (position: string) => position || "—",
    },
    {
      title: "HIRE DATE",
      dataIndex: "hireDate",
      key: "hireDate",
      width: 120,
      sorter: true,
      sortOrder:
        sortBy === "hireDate"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "RELEASE DATE",
      dataIndex: "releaseDate",
      key: "releaseDate",
      width: 130,
      sorter: true,
      sortOrder:
        sortBy === "releaseDate"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "UPDATE AS OF",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 130,
      sorter: true,
      sortOrder:
        sortBy === "updatedAt"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "—",
    },
  ];

  // Handle table change via URL navigation
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<StaffSummary> | SorterResult<StaffSummary>[]
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

    // Handle role filter changes
    const currentRoleFilters = searchParams.getAll("role");
    const newRoleFilters = filters.position ? (filters.position as string[]) : [];

    // Compare current and new role filters
    const roleChanged =
      currentRoleFilters.length !== newRoleFilters.length ||
      !currentRoleFilters.every((r) => newRoleFilters.includes(r));

    if (roleChanged) {
      // Remove all existing role parameters
      params.delete("role");

      // Add new role filters
      if (newRoleFilters.length > 0) {
        newRoleFilters.forEach((role) => params.append("role", role));
      }

      params.set("page", "1"); // Reset to first page on filter change (1-based)
      shouldUpdate = true;
    }

    // Only navigate if something actually changed
    if (shouldUpdate) {
      router.push(`/employees?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <Card className={layoutStyles.controlBar} variant="borderless">
        <div className={layoutStyles.controlsRow}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={buttonStyles.btnPrimary}
            onClick={() => setCreateModalOpen(true)}
          >
            CREATE EMPLOYEE
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
            x: 1200,
            y: "calc(100vh - 280px)", // Dynamic height: viewport - (header + controls + pagination)
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </Card>

      {/* Create Staff Modal */}
      <CreateStaffForm
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        offices={offices}
        roles={roles}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
}
