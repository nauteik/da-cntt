"use client";

import React, { useState, useCallback, useMemo } from "react";
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
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutComponent({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpenKeys, setMenuOpenKeys] = useState<string[]>([]);
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Derive active menu item directly from pathname
  const activeMenuItem = useMemo(() => {
    if (pathname === "/") return "dashboard";
    if (pathname.startsWith("/clients")) return "client-management";
    if (pathname.startsWith("/employees")) return "employees";
    if (pathname.startsWith("/offices")) return "offices";
    if (pathname.startsWith("/scheduling")) return "scheduling";
    if (pathname.startsWith("/visit-maintenance")) return "visit-maintenance";
    if (pathname.startsWith("/reports")) return "reports";
    if (pathname.startsWith("/authorizations")) return "authorizations";
    if (pathname.startsWith("/security")) return "security";
    return "dashboard";
  }, [pathname]);

  // Derive open keys based on active menu item and user-controlled state
  const openKeys = useMemo(() => {
    // When sidebar is collapsed, don't show any open submenus
    if (collapsed) return [];
    
    const keys: string[] = [...menuOpenKeys];

    if (activeMenuItem === "client-management" && !keys.includes("clients")) {
      keys.push("clients");
    }

    return keys;
  }, [activeMenuItem, menuOpenKeys, collapsed]); // Add collapsed dependency

  // Memoize navigation handler to prevent recreation on every render
  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  // Memoize menu items to prevent recreation
  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        onClick: () => handleNavigate("/"),
      },
      {
        key: "clients",
        icon: <UserOutlined />,
        label: "Clients",
        children: [
          {
            key: "client-management",
            label: "Client Management",
            onClick: () => handleNavigate("/clients"),
          },
        ],
      },
      {
        key: "employees",
        icon: <TeamOutlined />,
        label: "Employees",
        onClick: () => handleNavigate("/employees"),
      },
      {
        key: "offices",
        icon: <EnvironmentOutlined />,
        label: "Offices",
        onClick: () => handleNavigate("/offices"),
      },
      {
        key: "scheduling",
        icon: <CalendarOutlined />,
        label: "Scheduling",
        onClick: () => handleNavigate("/scheduling"),
      },
      {
        key: "visit-maintenance",
        icon: <ToolOutlined />,
        label: "Visit Maintenance",
        onClick: () => handleNavigate("/visit-maintenance"),
      },
      {
        key: "reports",
        icon: <BarChartOutlined />,
        label: "Reports",
        onClick: () => handleNavigate("/reports"),
      },
      {
        key: "authorizations",
        icon: <CheckCircleOutlined />,
        label: "Authorizations",
        onClick: () => handleNavigate("/authorizations"),
      },
      {
        key: "security",
        icon: <SafetyOutlined />,
        label: "Security",
        onClick: () => handleNavigate("/security"),
      },
    ],
    [handleNavigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  // Memoize user menu items
  const userMenuItems = useMemo(
    () => [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
        onClick: () => handleLogout,
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
    ],
    [handleLogout]
  );

  const onOpenChange = (keys: string[]) => {
    // Only update openKeys when sidebar is not collapsed
    if (!collapsed) {
      setMenuOpenKeys(keys);
    }
  };

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
          selectedKeys={[activeMenuItem]}
          openKeys={openKeys} // Use the state for openKeys
          onOpenChange={onOpenChange} // Handle open change event
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

// Memoize the entire component to prevent unnecessary re-renders
const AdminLayout = React.memo(AdminLayoutComponent);

export default AdminLayout;
