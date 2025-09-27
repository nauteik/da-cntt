"use client";

import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Alert,
  Card,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth, getRememberedCredentials } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/types/auth";
import ThemeToggle from "@/components/ThemeToggle";
import ClientOnly from "@/components/ClientOnly";

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>();
  const router = useRouter();
  const { login, isAuthenticated, isInitialized } = useAuth();
  const { isPending, error, reset } = login; // Get state directly from the mutation

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Load remembered credentials
  useEffect(() => {
    const remembered = getRememberedCredentials();
    if (remembered) {
      form.setFieldsValue({
        username: remembered.username,
        rememberMe: remembered.rememberMe,
      });
    }
  }, [form]);

  const handleSubmit = async (values: LoginFormValues) => {
    const credentials: LoginCredentials = {
      username: values.username,
      password: values.password,
      rememberMe: values.rememberMe || false,
    };
    // Just call mutate, onSuccess/onError are handled in the context
    login.mutate(credentials);
  };

  const handleFormChange = () => {
    // Reset mutation state when user starts typing
    if (error) {
      reset();
    }
  };

  // Loader skeleton for pre-hydration
  const LoginSkeleton = () => (
    <div
      className="card shadow-2xl border-theme backdrop-blur-sm rounded-xl overflow-hidden p-10"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      <div className="animate-pulse">
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6"
          style={{ backgroundColor: "var(--accent)", opacity: 0.3 }}
        ></div>
        <div
          className="h-7 rounded w-3/4 mx-auto mb-2"
          style={{ backgroundColor: "var(--accent)", opacity: 0.2 }}
        ></div>
        <div
          className="h-5 rounded w-1/2 mx-auto mb-6"
          style={{ backgroundColor: "var(--accent)", opacity: 0.1 }}
        ></div>
        <div
          className="w-16 h-1 rounded-full mx-auto mt-3 mb-8"
          style={{ backgroundColor: "var(--accent)", opacity: 0.3 }}
        ></div>
        <div
          className="h-10 rounded w-full mb-4"
          style={{ backgroundColor: "var(--accent)", opacity: 0.1 }}
        ></div>
        <div
          className="h-10 rounded w-full mb-6"
          style={{ backgroundColor: "var(--accent)", opacity: 0.1 }}
        ></div>
        <div className="flex items-center mb-6">
          <div
            className="h-5 w-5 rounded mr-2"
            style={{ backgroundColor: "var(--accent)", opacity: 0.2 }}
          ></div>
          <div
            className="h-4 rounded w-1/3"
            style={{ backgroundColor: "var(--accent)", opacity: 0.2 }}
          ></div>
        </div>
        <div
          className="h-10 rounded w-full"
          style={{ backgroundColor: "var(--accent)", opacity: 0.3 }}
        ></div>
      </div>
    </div>
  );

  // Actual login card content
  const LoginCard = () => (
    <Card
      className="card shadow-2xl border-theme backdrop-blur-sm"
      styles={{ body: { padding: "2.5rem" } }}
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-theme-accent to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <MedicineBoxOutlined className="text-white text-3xl" />
        </div>
        <Title level={2} className="!mb-2 heading-primary !text-2xl">
          Blue Angels Care
        </Title>
        <Text className="text-theme-secondary text-base font-medium">
          Health Management System
        </Text>
        <div className="w-16 h-1 bg-gradient-to-r from-theme-accent to-blue-500 rounded-full mx-auto mt-3"></div>
      </div>

      {/* Login Form */}
      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        onValuesChange={handleFormChange}
        layout="vertical"
        size="large"
        className="!mt-0"
        requiredMark={false}
      >
        <Form.Item
          name="username"
          label={
            <span className="text-theme-primary font-medium">
              Tên đăng nhập
            </span>
          }
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          validateTrigger={["onBlur"]}
        >
          <Input
            prefix={
              <UserOutlined className="mr-1 text-theme-secondary opacity-70" />
            }
            placeholder="Nhập tên đăng nhập"
            autoComplete="username"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span className="text-theme-primary font-medium">Mật khẩu</span>
          }
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          validateTrigger={["onBlur"]}
        >
          <Input.Password
            prefix={
              <LockOutlined className="mr-1 text-theme-secondary opacity-70" />
            }
            placeholder="Nhập mật khẩu"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            autoComplete="current-password"
            className="rounded-lg"
          />
        </Form.Item>

        <div className="flex justify-between items-center mb-6">
          <Form.Item name="rememberMe" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Button
            type="link"
            className="text-theme-accent hover:text-blue-500 transition-colors duration-200 p-0"
            onClick={() => {}}
          >
            Quên mật khẩu?
          </Button>
        </div>

        {/* Error Alert - Now uses the error from the mutation */}
        {error && (
          <Form.Item className="mb-6">
            <Alert
              // message="Đăng nhập thất bại"
              message={error.message} // error is now an ApiError instance
              type="error"
              showIcon
              closable
              onClose={reset} // Use reset from mutation to clear the error
              className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-shadow"
            loading={isPending} // Use isPending from mutation
            disabled={isPending} // Use isPending from mutation
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      {/* Demo Credentials */}
      <Divider plain className="!my-6">
        <span className="text-theme-secondary text-xs px-3">
          Demo Credentials
        </span>
      </Divider>

      <div className="border border-theme rounded-lg px-4 py-3 bg-theme-surface/50">
        <Space direction="vertical" size="small" className="w-full">
          <div className="flex justify-between items-center">
            <Text className="text-sm font-mono text-theme-secondary">
              Admin:
            </Text>
            <Text className="text-sm font-mono font-bold text-theme-accent">
              admin
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="text-sm font-mono text-theme-secondary">
              Password:
            </Text>
            <Text className="text-sm font-mono font-bold text-theme-accent">
              password
            </Text>
          </div>
        </Space>
        <Button
          size="small"
          type="link"
          className="text-sm mt-3 p-2 h-auto font-medium text-theme-accent hover:text-blue-500 transition-colors duration-200"
          onClick={() => {
            form.setFieldsValue({
              username: "admin1",
              password: "password123",
              rememberMe: true,
            });
          }}
        >
          ✨ Điền tự động
        </Button>
      </div>
    </Card>
  );

  // Show skeleton until auth state is initialized
  if (!isInitialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="w-full max-w-md">
          <LoginSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Theme Toggle - Top Right - Using ClientOnly wrapper */}
      <div className="absolute top-6 right-6 z-20">
        <div
          className="backdrop-blur-sm rounded-full p-1 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-surface)",
            opacity: 0.8,
            borderWidth: "1px",
            borderColor: "var(--border-color)",
          }}
        >
          <ClientOnly>
            <ThemeToggle variant="floating" />
          </ClientOnly>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--accent)" }}
        ></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div
          className="absolute bottom-20 left-1/4 w-36 h-36 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--accent)" }}
        ></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <LoginCard />

        {/* Footer */}
        <div className="text-center mt-8">
          <Text className="text-theme-secondary text-xs font-medium">
            © 2025 Blue Angels Care. All rights reserved.
          </Text>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <div className="w-2 h-2 bg-theme-accent rounded-full animate-pulse"></div>
            <Text className="text-theme-secondary text-xs">
              Secure Healthcare Management
            </Text>
            <div className="w-2 h-2 bg-theme-accent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
