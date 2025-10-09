"use client";

import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Alert,
  Space,
  Divider,
  Typography,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { getRememberedCredentials } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/types/auth";

const { Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onLogin: (values: LoginCredentials) => void;
  onValuesChange: () => void;
  isPending: boolean;
  error: Error | null;
  onResetError: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onValuesChange,
  isPending,
  error,
  onResetError,
}) => {
  const [form] = Form.useForm<LoginFormValues>();

  useEffect(() => {
    const remembered = getRememberedCredentials();
    if (remembered) {
      form.setFieldsValue({
        email: remembered.email,
        rememberMe: remembered.rememberMe,
      });
    }
  }, [form]);

  const handleFinish = (values: LoginFormValues) => {
    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe || false,
    };
    onLogin(credentials);
  };

  return (
    <>
      <Form
        form={form}
        name="login"
        onFinish={handleFinish}
        onValuesChange={onValuesChange}
        layout="vertical"
        size="large"
        className="!mt-0"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={<span className="text-theme-primary font-medium">Email</span>}
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
          validateTrigger={["onBlur"]}
        >
          <Input
            prefix={
              <MailOutlined className="mr-1 text-theme-secondary opacity-70" />
            }
            placeholder="Nhập email"
            autoComplete="email"
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

        {error && (
          <Form.Item className="mb-6">
            <Alert
              message={error.message}
              type="error"
              showIcon
              closable
              onClose={onResetError}
              className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-shadow"
            loading={isPending}
            disabled={isPending}
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
              Admin Email:
            </Text>
            <Text className="text-sm font-mono font-bold text-theme-accent">
              admin1@blueangelscare.com
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="text-sm font-mono text-theme-secondary">
              Password:
            </Text>
            <Text className="text-sm font-mono font-bold text-theme-accent">
              password123
            </Text>
          </div>
        </Space>
        <Button
          size="small"
          type="link"
          className="text-sm mt-3 p-2 h-auto font-medium text-theme-accent hover:text-blue-500 transition-colors duration-200"
          onClick={() => {
            form.setFieldsValue({
              email: "admin1@blueangelscare.com",
              password: "password123",
              rememberMe: true,
            });
          }}
        >
          ✨ Điền tự động
        </Button>
      </div>
    </>
  );
};

export default LoginForm;
