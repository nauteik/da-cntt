"use client";

import React from "react";
import { Card, Skeleton, Space } from "antd";
import AdminLayout from "@/components/AdminLayout";
import styles from "./patient-detail.module.css";

export default function PatientDetailLoading() {
  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Patient Header Skeleton */}
        <Card className={styles.headerSkeleton} variant="borderless">
          <div style={{ marginBottom: 16 }}>
            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Space size="middle">
                <Skeleton.Button active size="small" style={{ width: 60 }} />
                <Skeleton.Input active style={{ width: 200, height: 24 }} />
              </Space>
              <Skeleton.Button active style={{ width: 180 }} />
            </Space>
          </div>
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 1, width: "80%" }}
          />
        </Card>

        {/* Tabs and Content Skeleton */}
        <Card className={styles.contentSkeleton} variant="borderless">
          <Space size="large" style={{ marginBottom: 24 }}>
            <Skeleton.Button active style={{ width: 140 }} />
            <Skeleton.Button active style={{ width: 140 }} />
            <Skeleton.Button active style={{ width: 140 }} />
            <Skeleton.Button active style={{ width: 100 }} />
            <Skeleton.Button active style={{ width: 120 }} />
          </Space>

          <div style={{ marginTop: 24 }}>
            <Skeleton
              active
              title={{ width: "30%" }}
              paragraph={{
                rows: 8,
                width: [
                  "100%",
                  "95%",
                  "90%",
                  "100%",
                  "85%",
                  "95%",
                  "90%",
                  "100%",
                ],
              }}
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
