"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Progress, Table, Tag, DatePicker, Spin, Alert as AntAlert } from "antd";
import {
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import StatusCard from "@/components/common/StatusCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import dayjs, { Dayjs } from "dayjs";
import styles from "./dashboard.module.css";
import {
  getDashboardStats,
  getScheduleEventStats,
  getRecentActivities,
  getAlerts,
  type DashboardStats,
  type ScheduleEventStats,
  type RecentActivity,
  type Alert,
} from "@/lib/api/dashboard";

const { RangePicker } = DatePicker;

// Colors for charts
const DELIVERY_COLORS = ["#52c41a", "#1890ff", "#faad14", "#ff7a45", "#ff4d4f"];

export default function DashboardClient() {
  // State
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scheduleStats, setScheduleStats] = useState<ScheduleEventStats[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [from, to] = dateRange;
      const fromStr = from.format("YYYY-MM-DD");
      const toStr = to.format("YYYY-MM-DD");

      const [statsData, scheduleStatsData, activitiesData, alertsData] =
        await Promise.all([
          getDashboardStats(fromStr, toStr),
          getScheduleEventStats(fromStr, toStr, "day"),
          getRecentActivities(24, 0, 10),
          getAlerts(),
        ]);

      setStats(statsData);
      setScheduleStats(scheduleStatsData);
      setActivities(activitiesData.content);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Handle date range change
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  // Prepare chart data
  const chartData = scheduleStats.map((stat) => ({
    date: dayjs(stat.date).format("MMM DD"),
    Planned: stat.planned,
    Confirmed: stat.confirmed,
    "In Progress": stat.inProgress,
    Completed: stat.completed,
    Cancelled: stat.cancelled,
  }));

  const deliveryPieData = stats
    ? [
        { name: "Completed", value: stats.completedDeliveries },
        { name: "In Progress", value: stats.inProgressDeliveries },
        { name: "Not Started", value: stats.notStartedDeliveries },
        { name: "Incomplete", value: stats.incompleteDeliveries },
        { name: "Cancelled", value: stats.cancelledDeliveries },
      ].filter((item) => item.value > 0)
    : [];

  // Activity columns
  const activityColumns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 120,
      render: (time: string) => dayjs(time).format("HH:mm:ss"),
    },
    {
      title: "Activity",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          success: { color: "success", text: "Success" },
          warning: { color: "warning", text: "Warning" },
          error: { color: "error", text: "Error" },
          info: { color: "processing", text: "Info" },
        };
        const config = statusConfig[status] || statusConfig.info;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Alert columns
  const alertColumns = [
    {
      title: "Patient",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Authorization No",
      dataIndex: "authorizationNo",
      key: "authorizationNo",
    },
    {
      title: "Service",
      dataIndex: "serviceType",
      key: "serviceType",
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Days Remaining",
      dataIndex: "daysUntilExpiry",
      key: "daysUntilExpiry",
      render: (days: number) => {
        const color = days <= 7 ? "red" : days <= 14 ? "orange" : "blue";
        return <Tag color={color}>{days} days</Tag>;
      },
    },
  ];

  if (loading && !stats) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex justify-center items-center h-screen">
            <Spin size="large" tip="Loading dashboard..." />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Date Range Picker */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-theme-secondary">Date Range:</span>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                className={styles.dateRangePicker}
              />
            </div>
          </div>

          {error && (
            <AntAlert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Statistics Cards */}
          <Row gutter={16}>
            <Col span={6}>
              <StatusCard
                title="Total Patients"
                value={stats?.totalPatients || 0}
                prefix={<MedicineBoxOutlined />}
                variant="success"
              />
            </Col>
            <Col span={6}>
              <StatusCard
                title="Active Staff"
                value={stats?.activeStaff || 0}
                prefix={<TeamOutlined />}
                variant="primary"
              />
            </Col>
            <Col span={6}>
              <StatusCard
                title="Schedule Events"
                value={stats?.totalScheduleEvents || 0}
                prefix={<CalendarOutlined />}
                variant="accent"
              />
            </Col>
            <Col span={6}>
              <StatusCard
                title="Completed Shifts"
                value={stats?.completedDeliveries || 0}
                prefix={<CheckCircleOutlined />}
                variant="warning"
              />
            </Col>
          </Row>

          {/* Progress Cards */}
          <Row gutter={16}>
            <Col span={8}>
              <Card
                title={
                  <span className={styles.progressTitle}>
                    Schedule Event Status
                  </span>
                }
                extra={<CalendarOutlined className="text-theme-accent" />}
                className={styles.progressCard}
              >
                <div className="space-y-4">
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>Planned</span>
                      <span className={styles.progressValue}>
                        {stats?.plannedEvents || 0}
                      </span>
                    </div>
                    <Progress
                      percent={
                        stats && stats.totalScheduleEvents > 0
                          ? Math.round(
                              (stats.plannedEvents / stats.totalScheduleEvents) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#1890ff"
                    />
                  </div>
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>Confirmed</span>
                      <span className={styles.progressValue}>
                        {stats?.confirmedEvents || 0}
                      </span>
                    </div>
                    <Progress
                      percent={
                        stats && stats.totalScheduleEvents > 0
                          ? Math.round(
                              (stats.confirmedEvents /
                                stats.totalScheduleEvents) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#52c41a"
                    />
                  </div>
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>Completed</span>
                      <span className={styles.progressValue}>
                        {stats?.completedEvents || 0}
                      </span>
                    </div>
                    <Progress
                      percent={
                        stats && stats.totalScheduleEvents > 0
                          ? Math.round(
                              (stats.completedEvents /
                                stats.totalScheduleEvents) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#52c41a"
                    />
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={
                  <span className={styles.progressTitle}>
                    Service Delivery Status
                  </span>
                }
                extra={<ClockCircleOutlined className="text-theme-primary" />}
                className={styles.progressCard}
              >
                <div className="space-y-4">
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>Completed</span>
                      <span className={styles.progressValue}>
                        {stats?.completedDeliveries || 0}
                      </span>
                    </div>
                    <Progress
                      percent={
                        stats && stats.totalServiceDeliveries > 0
                          ? Math.round(
                              (stats.completedDeliveries /
                                stats.totalServiceDeliveries) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#52c41a"
                    />
                  </div>
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>In Progress</span>
                      <span className={styles.progressValue}>
                        {stats?.inProgressDeliveries || 0}
                      </span>
                    </div>
                    <Progress
                      percent={
                        stats && stats.totalServiceDeliveries > 0
                          ? Math.round(
                              (stats.inProgressDeliveries /
                                stats.totalServiceDeliveries) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#1890ff"
                      status="active"
                    />
                  </div>
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>
                        Incomplete ⚠️
                      </span>
                      <span className={styles.progressValue}>
                        {stats?.incompleteDeliveries || 0}
                      </span>
                    </div>
                    <Progress
                      percent={
                        stats && stats.totalServiceDeliveries > 0
                          ? Math.round(
                              (stats.incompleteDeliveries /
                                stats.totalServiceDeliveries) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#ff7a45"
                      status="exception"
                    />
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={
                  <span className={styles.progressTitle}>
                    Authorization Alerts
                  </span>
                }
                extra={<WarningOutlined className="text-yellow-500" />}
                className={styles.progressCard}
              >
                <div className="space-y-2">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 3).map((alert) => {
                      const severityStyles = {
                        high: {
                          borderColor: "rgba(239, 68, 68, 0.3)",
                          tagColor: "red"
                        },
                        medium: {
                          borderColor: "rgba(251, 146, 60, 0.3)",
                          tagColor: "orange"
                        },
                        low: {
                          borderColor: "rgba(59, 130, 246, 0.3)",
                          tagColor: "blue"
                        }
                      };
                      const style = severityStyles[alert.severity] || severityStyles.low;
                      
                      return (
                        <div
                          key={alert.id}
                          className="p-3 rounded-lg border transition-all hover:shadow-sm"
                          style={{ 
                            borderColor: style.borderColor,
                            borderWidth: '1.5px'
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-theme-primary">
                              {alert.patientName}
                            </span>
                            <Tag color={style.tagColor} className="font-medium">
                              {alert.daysUntilExpiry} days
                            </Tag>
                          </div>
                          <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
                            {alert.authorizationNo} - {alert.serviceType}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-theme-secondary py-4">
                      No alerts
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row gutter={16}>
            <Col span={16}>
              <Card
                title={
                  <span className="heading-secondary">
                    Schedule Events Over Time
                  </span>
                }
                className="card"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Planned" stackId="a" fill="#1890ff" />
                    <Bar dataKey="Confirmed" stackId="a" fill="#52c41a" />
                    <Bar dataKey="In Progress" stackId="a" fill="#faad14" />
                    <Bar dataKey="Completed" stackId="a" fill="#52c41a" />
                    <Bar dataKey="Cancelled" stackId="a" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={
                  <span className="heading-secondary">
                    Service Delivery Distribution
                  </span>
                }
                className="card"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deliveryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deliveryPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DELIVERY_COLORS[index % DELIVERY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Activities and Alerts */}
          <Row gutter={16}>
            <Col span={14}>
              <Card
                title={
                  <span className="heading-secondary">Recent Activities</span>
                }
                extra={<ClockCircleOutlined className="text-theme-accent" />}
                className="card"
              >
                <Table
                  dataSource={activities}
                  columns={activityColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>
            <Col span={10}>
              <Card
                title={
                  <span className="heading-secondary">
                    Expiring Authorizations
                  </span>
                }
                extra={
                  <ExclamationCircleOutlined className="text-yellow-500" />
                }
                className="card"
              >
                <Table
                  dataSource={alerts}
                  columns={alertColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
