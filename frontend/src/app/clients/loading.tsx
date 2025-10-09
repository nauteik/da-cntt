"use client";

import React from "react";
import { Card, Skeleton, Space } from "antd";
import layoutStyles from "@/styles/table-layout.module.css";
import AdminLayout from "@/components/AdminLayout";

export default function ClientsLoading() {
  return (
    <AdminLayout>
      <div className={layoutStyles.pageContainer}>
        <Card className={layoutStyles.controlBar} variant="borderless">
          <div className={layoutStyles.controlsRow}>
            <Skeleton.Button active size="large" style={{ width: 160 }} />
            <Space size="middle" className={layoutStyles.rightControls}>
              <Skeleton.Input active style={{ width: 240 }} />
              <Skeleton.Button active />
              <Skeleton.Button active />
            </Space>
          </div>
        </Card>

        <Card className={layoutStyles.tableCard} variant="borderless">
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 12, width: "100%" }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
