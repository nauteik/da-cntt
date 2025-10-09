"use client";

import React, { useEffect } from "react";
import { Card, Typography } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "./LoginForm";
import { LoginCredentials } from "@/types/auth";
import ThemeToggle from "@/components/ThemeToggle";
import ClientOnly from "@/components/ClientOnly";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized, isNavigating } = useAuth();
  const { isPending, error, reset } = login;

  // Combined loading state: either mutation is pending or navigation is in progress
  const isLoading = isPending || isNavigating;

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  const handleSubmit = (credentials: LoginCredentials) => {
    login.mutate(credentials);
  };

  const handleFormChange = () => {
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
      <LoginForm
        onLogin={handleSubmit}
        onValuesChange={handleFormChange}
        isPending={isLoading}
        error={error}
        onResetError={reset}
      />
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
