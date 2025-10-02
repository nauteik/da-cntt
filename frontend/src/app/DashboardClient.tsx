"use client";

import React from "react";
import { Row, Col, Card, Progress, Table, Tag, Timeline, Alert } from "antd";
import {
  TeamOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/AdminLayout";
import StatusCard from "@/components/common/StatusCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import styles from "./dashboard.module.css";

const revenueData = [
  { month: "Jan", revenue: 45000, claims: 120 },
  { month: "Feb", revenue: 52000, claims: 135 },
  { month: "Mar", revenue: 48000, claims: 128 },
  { month: "Apr", revenue: 58000, claims: 145 },
  { month: "May", revenue: 55000, claims: 142 },
  { month: "Jun", revenue: 62000, claims: 158 },
];

const recentActivities = [
  {
    key: "1",
    time: "10:30 AM",
    activity: "Nhân viên John Doe đã check-in ca làm việc",
    status: "success",
    patient: "Mary Johnson",
  },
  {
    key: "2",
    time: "9:45 AM",
    activity: "Yêu cầu thanh toán mới được tạo",
    status: "processing",
    amount: "$2,450",
  },
  {
    key: "3",
    time: "9:15 AM",
    activity: "Cảnh báo: Chứng chỉ CPR sắp hết hạn",
    status: "warning",
    employee: "Sarah Wilson",
  },
  {
    key: "4",
    time: "8:30 AM",
    activity: "ISP mới được phê duyệt",
    status: "success",
    patient: "Robert Brown",
  },
];

const upcomingTasks = [
  {
    key: "1",
    task: "Diễn tập phòng cháy chữa cháy",
    dueDate: "2025-09-25",
    priority: "high",
    office: "Philadelphia Office",
  },
  {
    key: "2",
    task: "Gia hạn chứng chỉ First Aid",
    dueDate: "2025-09-30",
    priority: "medium",
    employee: "Mike Davis",
  },
  {
    key: "3",
    task: "Đánh giá ISP định kỳ",
    dueDate: "2025-10-05",
    priority: "medium",
    patient: "Lisa Anderson",
  },
];

const activityColumns = [
  {
    title: "Thời gian",
    dataIndex: "time",
    key: "time",
    width: 100,
  },
  {
    title: "Hoạt động",
    dataIndex: "activity",
    key: "activity",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const statusConfig = {
        success: { color: "success", text: "Hoàn thành" },
        processing: { color: "processing", text: "Đang xử lý" },
        warning: { color: "warning", text: "Cảnh báo" },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
];

const taskColumns = [
  {
    title: "Công việc",
    dataIndex: "task",
    key: "task",
  },
  {
    title: "Hạn chót",
    dataIndex: "dueDate",
    key: "dueDate",
  },
  {
    title: "Ưu tiên",
    dataIndex: "priority",
    key: "priority",
    render: (priority: string) => {
      const colorMap = {
        high: "red",
        medium: "orange",
        low: "green",
      };
      const textMap = {
        high: "Cao",
        medium: "Trung bình",
        low: "Thấp",
      };
      return (
        <Tag color={colorMap[priority as keyof typeof colorMap]}>
          {textMap[priority as keyof typeof textMap]}
        </Tag>
      );
    },
  },
];

export default function DashboardClient() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Alert Section */}
          <Alert
            message="Chào mừng đến với BAC Health Management System"
            description="Hệ thống đang hoạt động bình thường. Có 3 cảnh báo cần xử lý và 12 ca làm việc đang diễn ra."
            type="info"
            showIcon
            closable
          />

          {/* Statistics Cards */}
          <Row gutter={16}>
            <Col span={6}>
              <StatusCard
                title="Tổng số Bệnh nhân"
                value={187}
                prefix={<MedicineBoxOutlined />}
                variant="success"
              />
            </Col>
            <Col span={6}>
              <StatusCard
                title="Nhân viên Hoạt động"
                value={45}
                prefix={<TeamOutlined />}
                variant="primary"
              />
            </Col>
            <Col span={6}>
              <StatusCard
                title="Ca làm việc Hôm nay"
                value={28}
                prefix={<CalendarOutlined />}
                variant="accent"
              />
            </Col>
            <Col span={6}>
              <StatusCard
                title="Doanh thu Tháng này"
                value="$58,000"
                prefix={<DollarOutlined />}
                variant="warning"
              />
            </Col>
          </Row>

          {/* Progress Cards */}
          <Row gutter={16}>
            <Col span={8}>
              <Card
                title={
                  <span className={styles.progressTitle}>Tiến độ ISP</span>
                }
                extra={<CheckCircleOutlined className="text-theme-accent" />}
                className={styles.progressCard}
              >
                <div className="space-y-4">
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>
                        ISP đã hoàn thành
                      </span>
                      <span className={styles.progressValue}>85%</span>
                    </div>
                    <Progress percent={85} status="active" />
                  </div>
                  <div className={styles.progressItem}>
                    <div className="flex justify-between mb-1">
                      <span className={styles.progressLabel}>
                        ISP chờ duyệt
                      </span>
                      <span className={styles.progressValue}>12%</span>
                    </div>
                    <Progress percent={12} status="normal" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={
                  <span className={styles.progressTitle}>
                    Tuân thủ Chứng chỉ
                  </span>
                }
                extra={
                  <ExclamationCircleOutlined className="text-yellow-500" />
                }
                className={styles.progressCard}
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-theme-secondary">
                        Chứng chỉ còn hiệu lực
                      </span>
                      <span className="text-theme-primary font-semibold">
                        92%
                      </span>
                    </div>
                    <Progress percent={92} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-theme-secondary">
                        Sắp hết hạn (30 ngày)
                      </span>
                      <span className="text-theme-primary font-semibold">
                        8%
                      </span>
                    </div>
                    <Progress percent={8} status="exception" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={
                  <span className="heading-secondary">Thanh toán Claims</span>
                }
                extra={<DollarOutlined className="text-green-500" />}
                className="card"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-theme-secondary">
                        Đã thanh toán
                      </span>
                      <span className="text-theme-primary font-semibold">
                        78%
                      </span>
                    </div>
                    <Progress percent={78} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-theme-secondary">
                        Đang chờ xử lý
                      </span>
                      <span className="text-theme-primary font-semibold">
                        22%
                      </span>
                    </div>
                    <Progress percent={22} status="active" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={
                  <span className="heading-secondary">
                    Doanh thu theo Tháng
                  </span>
                }
                className="card"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1890ff"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <span className="heading-secondary">
                    Số lượng Claims theo Tháng
                  </span>
                }
                className="card"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="claims" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Activities and Tasks */}
          <Row gutter={16}>
            <Col span={14}>
              <Card
                title={
                  <span className="heading-secondary">Hoạt động Gần đây</span>
                }
                extra={<ClockCircleOutlined className="text-theme-accent" />}
                className="card"
              >
                <Table
                  dataSource={recentActivities}
                  columns={activityColumns}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col span={10}>
              <Card
                title={
                  <span className="heading-secondary">Công việc Sắp tới</span>
                }
                extra={
                  <ExclamationCircleOutlined className="text-yellow-500" />
                }
                className="card"
              >
                <Table
                  dataSource={upcomingTasks}
                  columns={taskColumns}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Timeline */}
          <Row>
            <Col span={24}>
              <Card
                title={
                  <span className="heading-secondary">Timeline Hôm nay</span>
                }
                className="card"
              >
                <Timeline
                  items={[
                    {
                      color: "green",
                      children: (
                        <div>
                          <p className="text-theme-primary font-semibold">
                            08:00 AM - Ca đầu tiên bắt đầu
                          </p>
                          <p className="text-theme-secondary">
                            12 nhân viên DSP bắt đầu ca làm việc buổi sáng
                          </p>
                        </div>
                      ),
                    },
                    {
                      color: "blue",
                      children: (
                        <div>
                          <p className="text-theme-primary font-semibold">
                            10:30 AM - Báo cáo Daily Note
                          </p>
                          <p className="text-theme-secondary">
                            5 báo cáo đã được gửi và ký xác nhận
                          </p>
                        </div>
                      ),
                    },
                    {
                      color: "red",
                      children: (
                        <div>
                          <p className="text-theme-primary font-semibold">
                            11:15 AM - Cảnh báo Medication
                          </p>
                          <p className="text-theme-secondary">
                            2 bệnh nhân cần được nhắc nhở uống thuốc PRN
                          </p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <p className="text-theme-primary font-semibold">
                            02:00 PM - Ca chiều bắt đầu
                          </p>
                          <p className="text-theme-secondary">
                            8 nhân viên DSP sẽ bắt đầu ca làm việc buổi chiều
                          </p>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
