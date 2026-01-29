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
  Breadcrumb,
} from "antd";
import styles from "./AdminLayout.module.css";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  ToolOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import ChangePasswordModal from "./auth/ChangePasswordModal";
const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutComponent({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpenKeys, setMenuOpenKeys] = useState<string[]>([]);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Memoize navigation handler to prevent recreation on every render
  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  // Derive active menu item directly from pathname
  const activeMenuItem = useMemo(() => {
    if (pathname === "/") return "dashboard";
    if (pathname.startsWith("/clients")) return "client-management";
    if (pathname.startsWith("/employees")) return "employees";
    if (pathname.startsWith("/offices")) return "offices";
    if (pathname.startsWith("/schedule")) return "schedule";
    if (pathname.startsWith("/visit-maintenance")) return "visit-maintenance";
    if (pathname.startsWith("/housing")) return "housing";
    if (pathname.startsWith("/reports")) return "reports";
    if (pathname.startsWith("/authorizations")) return "authorizations";
    return "dashboard";
  }, [pathname]);

  // Generate breadcrumb items based on pathname
  const breadcrumbItems = useMemo(() => {
    // Helper function to check if a segment looks like a UUID/ID
    const isLikelyId = (segment: string): boolean => {
      // Check if it's a long alphanumeric string (UUID pattern or similar)
      // UUIDs are typically 32+ characters, but we'll be more lenient
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const longAlphanumeric = /^[0-9a-f-]{20,}$/i; // 20+ chars of hex/alphanumeric
      return uuidPattern.test(segment) || (longAlphanumeric.test(segment) && segment.length >= 20);
    };

    // Map parent segments to their detail page labels
    const detailLabelMap: Record<string, string> = {
      clients: "Patient Detail",
      employees: "Employee Detail",
      offices: "Office Detail",
      schedule: "Schedule Detail",
      "visit-maintenance": "Visit Detail",
      housing: "Housing Detail",
      reports: "Report Detail",
      authorizations: "Authorization Detail",
    };

    const items: { title: React.ReactNode }[] = [
      {
        title: (
          <a onClick={() => handleNavigate("/")} className="flex items-center gap-1">
            <span>Home</span>
          </a>
        ),
      },
    ];

    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) {
      items.push({ title: <span>Dashboard</span> });
      return items;
    }

    const breadcrumbMap: Record<string, { title: string; icon?: React.ReactNode }> = {
      clients: { title: "Clients" },
      employees: { title: "Employees", },
      offices: { title: "Offices",  },
      schedule: { title: "Scheduling"},
      "visit-maintenance": { title: "Visit Maintenance"},
      housing: { title: "Housing"},
      reports: { title: "Reports"},
      authorizations: { title: "Authorizations"},
    };

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const config = breadcrumbMap[segment];

      if (config) {
        if (isLast) {
          items.push({
            title: (
              <span className="flex items-center gap-1">
                {config.icon}
                <span>{config.title}</span>
              </span>
            ),
          });
        } else {
          const path = currentPath;
          items.push({
            title: (
              <a onClick={() => handleNavigate(path)} className="flex items-center gap-1">
                {config.icon}
                <span>{config.title}</span>
              </a>
            ),
          });
        }
      } else {
        // For dynamic segments (like IDs), replace with appropriate detail label
        let title: string;
        if (isLikelyId(segment)) {
          // Get the previous segment to determine the context
          const previousSegment = index > 0 ? pathSegments[index - 1] : "";
          title = detailLabelMap[previousSegment] || "Detail";
        } else {
          // For non-ID segments, capitalize first letter
          title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        }
        
        if (isLast) {
          items.push({ title: <span>{title}</span> });
        } else {
          const path = currentPath;
          items.push({
            title: <a onClick={() => handleNavigate(path)}>{title}</a>,
          });
        }
      }
    });

    return items;
  }, [pathname, handleNavigate]);

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
        key: "schedule",
        icon: <CalendarOutlined />,
        label: "Scheduling",
        onClick: () => handleNavigate("/schedule"),
      },
      {
        key: "visit-maintenance",
        icon: <ToolOutlined />,
        label: "Visit Maintenance",
        onClick: () => handleNavigate("/visit-maintenance"),
      },
      {
        key: "housing",
        icon: <HomeOutlined />,
        label: "Housing",
        onClick: () => handleNavigate("/housing"),
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
        key: "change-password",
        icon: <KeyOutlined />,
        label: "Change Password",
        onClick: () => setIsChangePasswordModalOpen(true),
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
            <Breadcrumb items={breadcrumbItems} className={styles.breadcrumb} />
          </div>

          <Space size="middle">
            <ThemeToggle />
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </Layout>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
const AdminLayout = React.memo(AdminLayoutComponent);

export default AdminLayout;
