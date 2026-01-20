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
  Select,
  Popconfirm,
  App,
  type TablePaginationConfig,
} from "antd";
import {
  ExportOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType, SorterResult } from "antd/es/table/interface";
import type { FilterValue } from "antd/es/table/interface";
import { useDebounce } from "@/hooks/useDebounce";
import { useHouses, useDeleteHouse } from "@/hooks/useHouses";
import type { PaginatedHouses, HouseDTO } from "@/types/house";
import type { OfficeDTO } from "@/types/office";
import layoutStyles from "@/styles/table-layout.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import EditHouseModal from "@/components/housing/EditHouseModal";
import AssignPatientModal from "@/components/housing/AssignPatientModal";
import UnassignPatientModal from "@/components/housing/UnassignPatientModal";
import { exportApi } from "@/lib/api/exportApi";

interface HousingClientProps {
  initialData: PaginatedHouses;
  offices: OfficeDTO[];
}

export default function HousingClient({
  initialData,
  offices,
}: HousingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Derive all state from URL - single source of truth
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("size") || "25", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  const searchText = searchParams.get("search") || "";
  const officeFilter = searchParams.get("office") || "";

  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = React.useState(searchText);
  const [officeFilterInput, setOfficeFilterInput] =
    React.useState(officeFilter);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingHouse, setEditingHouse] = React.useState<HouseDTO | null>(null);
  const [assigningHouse, setAssigningHouse] = React.useState<HouseDTO | null>(null);
  const [unassigningHouse, setUnassigningHouse] = React.useState<HouseDTO | null>(null);
  const [exporting, setExporting] = React.useState(false);

  // Debounce search input to prevent excessive API calls (500ms delay)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync search input with URL on mount and when URL changes
  React.useEffect(() => {
    setSearchInput(searchText);
  }, [searchText]);

  React.useEffect(() => {
    setOfficeFilterInput(officeFilter);
  }, [officeFilter]);

  // Update URL when debounced search value changes
  React.useEffect(() => {
    if (debouncedSearch !== searchText) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/housing?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, searchText, searchParams, router]);

  // Handle office filter change
  const handleOfficeFilterChange = (value: string) => {
    setOfficeFilterInput(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("office", value);
    } else {
      params.delete("office");
    }
    params.set("page", "1");
    router.push(`/housing?${params.toString()}`, { scroll: false });
  };

  // Use React Query with URL-derived state
  const { data, isLoading } = useHouses(
    {
      page: currentPage - 1, // Backend uses 0-based indexing
      size: pageSize,
      sortBy,
      sortDir,
      search: searchText,
      officeId: officeFilter || undefined,
    },
    {
      initialData,
    }
  );

  const deleteHouseMutation = useDeleteHouse({
    onSuccess: () => {
      message.success("House deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["houses"] });
    },
    onError: (error) => {
      message.error(error.message || "Failed to delete house");
    },
  });

  // Define table columns
  const columns: ColumnsType<HouseDTO> = [
    {
      title: "HOUSE CODE",
      dataIndex: "code",
      key: "code",
      sorter: true,
      sortOrder:
        sortBy === "code"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      width: 120,
      fixed: "left",
      render: (code: string, record: HouseDTO) => (
        <span
          className="cursor-pointer font-medium transition-colors"
          style={{
            color: "var(--primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary-hover)";
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.textDecoration = "none";
          }}
          onClick={() => router.push(`/housing/${record.id}`)}
        >
          {code}
        </span>
      ),
    },
    {
      title: "HOUSE NAME",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        sortBy === "name"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      width: 200,
      render: (name: string, record: HouseDTO) => (
        <span
          className="cursor-pointer font-medium transition-colors"
          style={{
            color: "var(--primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary-hover)";
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.textDecoration = "none";
          }}
          onClick={() => router.push(`/housing/${record.id}`)}
        >
          {name}
        </span>
      ),
    },
    {
      title: "OFFICE",
      dataIndex: "officeName",
      key: "officeName",
      width: 150,
    },
    {
      title: "ADDRESS",
      dataIndex: "fullAddress",
      key: "fullAddress",
      width: 250,
      render: (address: string | null) => address || "—",
    },
    {
      title: "CURRENT PATIENT",
      key: "currentPatient",
      width: 200,
      render: (_: unknown, record: HouseDTO) => {
        if (record.currentPatientId && record.currentPatientName) {
          return (
            <span
              className="cursor-pointer font-medium transition-colors"
              style={{
                color: "var(--primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--primary-hover)";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--primary)";
                e.currentTarget.style.textDecoration = "none";
              }}
              onClick={() => router.push(`/clients/${record.currentPatientId}`)}
            >
              {record.currentPatientName}
            </span>
          );
        }
        return <span className="text-gray-400">—</span>;
      },
    },
    {
      title: "STATUS",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_: unknown, record: HouseDTO) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => setEditingHouse(record)}
            size="small"
          >
            Edit
          </Button>
          {record.currentPatientId ? (
            <Button
              type="link"
              icon={<UserDeleteOutlined />}
              onClick={() => setUnassigningHouse(record)}
              size="small"
            >
              Unassign
            </Button>
          ) : (
            <Button
              type="link"
              icon={<UserAddOutlined />}
              onClick={() => setAssigningHouse(record)}
              size="small"
            >
              Assign
            </Button>
          )}
          <Popconfirm
            title="Are you sure you want to delete this house?"
            onConfirm={() => deleteHouseMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handle table change via URL navigation
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<HouseDTO> | SorterResult<HouseDTO>[]
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
      router.push(`/housing?${params.toString()}`, { scroll: false });
    }
  };

  // const handleCreateSuccess = () => {
  //   queryClient.invalidateQueries({ queryKey: ["houses"] });
  //   router.push("/housing");
  //   router.refresh();
  // };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportApi.exportHouses({
        officeId: officeFilter || undefined,
        search: searchText || undefined,
      });
      message.success("Houses exported successfully");
    } catch (error) {
      console.error("Error exporting houses:", error);
      message.error("Failed to export houses");
    } finally {
      setExporting(false);
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
            onClick={() => setIsCreateModalOpen(true)}
          >
            CREATE HOUSE
          </Button>

          <Space size="middle" className={layoutStyles.rightControls}>
            <Select
              placeholder="Filter by Office"
              style={{ width: 200 }}
              value={officeFilterInput || undefined}
              onChange={handleOfficeFilterChange}
              allowClear
              options={offices.map((office) => ({
                label: office.name,
                value: office.id,
              }))}
            />
            <Input
              placeholder="Search by code or name..."
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
              onClick={handleExport}
              loading={exporting}
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
            current: currentPage,
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
            y: "calc(100vh - 280px)",
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </Card>

      {/* Modals */}
      {isCreateModalOpen && (
        <div>{/* CreateHouseModal will be implemented */}</div>
      )}
      {editingHouse && (
        <EditHouseModal
          open={!!editingHouse}
          onClose={() => setEditingHouse(null)}
          house={editingHouse}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["houses"] });
          }}
        />
      )}
      {assigningHouse && (
        <AssignPatientModal
          open={!!assigningHouse}
          onClose={() => setAssigningHouse(null)}
          houseId={assigningHouse.id}
          houseName={assigningHouse.name}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["houses"] });
          }}
        />
      )}
      {unassigningHouse && (
        <UnassignPatientModal
          open={!!unassigningHouse}
          onClose={() => setUnassigningHouse(null)}
          house={unassigningHouse}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["houses"] });
          }}
        />
      )}
    </div>
  );
}
