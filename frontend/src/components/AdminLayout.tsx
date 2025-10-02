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
  CalendarOutlined,
  SafetyOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  ToolOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
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
  const [currentPath, setCurrentPath] = useState("/");
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const path = window.location.pathname;
    setCurrentPath(path);

    // Auto-open parent menu based on current route
    if (path.startsWith("/clients")) {
      setOpenKeys(["clients"]);
    }
  }, []);

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/"),
    },
    {
      key: "clients",
      icon: <UserOutlined />,
      label: "Clients",
      children: [
        {
          key: "client-management",
          label: "Client Management",
          onClick: () => router.push("/clients"),
        },
      ],
    },
    {
      key: "employees",
      icon: <TeamOutlined />,
      label: "Employees",
      onClick: () => router.push("/employees"),
    },
    {
      key: "scheduling",
      icon: <CalendarOutlined />,
      label: "Scheduling",
      onClick: () => router.push("/scheduling"),
    },
    {
      key: "visit-maintenance",
      icon: <ToolOutlined />,
      label: "Visit Maintenance",
      onClick: () => router.push("/visit-maintenance"),
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Reports",
      onClick: () => router.push("/reports"),
    },
    {
      key: "authorizations",
      icon: <CheckCircleOutlined />,
      label: "Authorizations",
      onClick: () => router.push("/authorizations"),
    },
    {
      key: "security",
      icon: <SafetyOutlined />,
      label: "Security",
      onClick: () => router.push("/security"),
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
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
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
        data-scrollbar-enterprise="true"
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
          selectedKeys={[
            currentPath === "/"
              ? "dashboard"
              : currentPath.startsWith("/clients")
              ? "client-management"
              : currentPath.startsWith("/employees")
              ? "employees"
              : currentPath.startsWith("/scheduling")
              ? "scheduling"
              : currentPath.startsWith("/visit-maintenance")
              ? "visit-maintenance"
              : currentPath.startsWith("/reports")
              ? "reports"
              : currentPath.startsWith("/authorizations")
              ? "authorizations"
              : currentPath.startsWith("/security")
              ? "security"
              : "dashboard",
          ]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
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
                  <div className={styles.officeName}>{user?.email}</div>
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
