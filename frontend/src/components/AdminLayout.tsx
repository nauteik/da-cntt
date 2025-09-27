"use client";

import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
} from "antd";
import styles from "./AdminLayout.module.css";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  SafetyOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản lý Người dùng",
      children: [
        { key: "users-list", label: "Danh sách Người dùng" },
        { key: "roles", label: "Phân quyền" },
      ],
    },
    {
      key: "employees",
      icon: <TeamOutlined />,
      label: "Quản lý Nhân viên",
      children: [
        { key: "employees-list", label: "Danh sách Nhân viên" },
        { key: "documents", label: "Tài liệu & Chứng chỉ" },
        { key: "schedules", label: "Lịch Khả dụng" },
      ],
    },
    {
      key: "patients",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý Bệnh nhân",
      children: [
        { key: "patients-list", label: "Danh sách Bệnh nhân" },
        { key: "medical-records", label: "Hồ sơ Y tế" },
        { key: "incidents", label: "Báo cáo Sự cố" },
      ],
    },
    {
      key: "isp",
      icon: <FileTextOutlined />,
      label: "Kế hoạch ISP",
      children: [
        { key: "isp-list", label: "Danh sách ISP" },
        { key: "isp-tracking", label: "Theo dõi Units" },
      ],
    },
    {
      key: "scheduling",
      icon: <CalendarOutlined />,
      label: "Quản lý Lịch",
      children: [
        { key: "calendar", label: "Lịch Tổng quan" },
        { key: "assignments", label: "Phân công Ca làm" },
        { key: "conflicts", label: "Xử lý Xung đột" },
      ],
    },
    {
      key: "medications",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý Thuốc",
      children: [
        { key: "medication-orders", label: "Y lệnh Thuốc" },
        { key: "emar", label: "Bảng ghi eMAR" },
        { key: "medication-alerts", label: "Cảnh báo Thuốc" },
      ],
    },
    {
      key: "billing",
      icon: <DollarOutlined />,
      label: "Thanh toán",
      children: [
        { key: "claims", label: "Yêu cầu Thanh toán" },
        { key: "payments", label: "Theo dõi Thanh toán" },
        { key: "reports", label: "Báo cáo Tài chính" },
      ],
    },
    {
      key: "compliance",
      icon: <SafetyOutlined />,
      label: "Tuân thủ & Pháp lý",
      children: [
        { key: "fire-drills", label: "Diễn tập PCCC" },
        { key: "legal-docs", label: "Tài liệu Pháp lý" },
        { key: "audit-logs", label: "Nhật ký Kiểm tra" },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-theme-primary">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className={`${styles.sidebar} ${
          isDarkMode ? styles.sidebarDark : styles.sidebarLight
        }`}
        theme={isDarkMode ? "dark" : "light"}
      >
        <div
          className={`${styles.brandHeader} ${
            isDarkMode ? styles.brandHeaderDark : styles.brandHeaderLight
          }`}
        >
          {collapsed ? (
            <Title
              level={4}
              className={`${styles.brandTitle} ${
                isDarkMode ? styles.brandTitleDark : styles.brandTitleLight
              }`}
            >
              BAC
            </Title>
          ) : (
            <Title
              level={4}
              className={`${styles.brandTitle} ${
                isDarkMode ? styles.brandTitleDark : styles.brandTitleLight
              }`}
            >
              Blue Angels Care
            </Title>
          )}
          {!collapsed && (
            <div
              className={`${styles.brandSubtitle} ${
                isDarkMode
                  ? styles.brandSubtitleDark
                  : styles.brandSubtitleLight
              }`}
            >
              Health Management System
            </div>
          )}
        </div>
        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          className={isDarkMode ? styles.menuDark : styles.menuLight}
        />
      </Sider>

      <Layout
        className={`${styles.layoutContent} ${
          collapsed
            ? styles.layoutContentCollapsed
            : styles.layoutContentExpanded
        }`}
      >
        <Header className={`${styles.header} bg-theme-surface`}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.menuToggle}
            />
            <Title level={4} className={styles.headerTitle}>
              Dashboard
            </Title>
          </div>

          <Space size="middle">
            <ThemeToggle />
            <Button type="text" icon={<BellOutlined />} size="large" />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Avatar size="default" icon={<UserOutlined />} />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user?.displayName}</div>
                  <div className={styles.officeName}>@{user?.username}</div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content className={styles.contentArea}>{children}</Content>
      </Layout>
    </Layout>
  );
}
