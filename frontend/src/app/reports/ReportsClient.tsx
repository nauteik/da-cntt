"use client";

import React, { useState, useMemo } from 'react';
import { Card, Button, Space, Collapse, Typography } from 'antd';
import {
  FilterOutlined,
  MenuOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import buttonStyles from '@/styles/buttons.module.css';
import layoutStyles from '@/styles/table-layout.module.css';
import ReportFilterModal from '@/components/ReportFilterModal';
import type { ReportMetadata, ReportType } from '@/types/report';

const { Panel } = Collapse;
const { Title } = Typography;

interface ReportItem {
  key: string;
  name: string;
}

interface ReportCategory {
  key: string;
  title: string;
  reports: ReportItem[];
}

// Report categories data
const reportCategories: ReportCategory[] = [
  {
    key: 'authorizations',
    title: 'Authorizations',
    reports: [
      { key: 'auth-vs-actual', name: 'Authorization vs Actual Used by Client' },
      { key: 'authorizations', name: 'Authorizations' },
      { key: 'clients-without-auth', name: 'Clients Without Authorizations' },
      { key: 'expiring-auth', name: 'Expiring Authorizations' },
    ],
  },
  {
    key: 'daily-reports',
    title: 'Daily Reports',
    reports: [
      { key: 'active-client-contacts', name: 'Active Client Contacts' },
      { key: 'active-clients', name: 'Active Clients' },
      { key: 'active-employees', name: 'Active Employees' },
      { key: 'call-listing', name: 'Call Listing' },
      { key: 'call-summary', name: 'Call Summary' },
      { key: 'client-address-listing', name: 'Client Address Listing' },
      { key: 'employee-attributes', name: 'Employee Attributes' },
      { key: 'gps-distance-exception', name: 'GPS Distance Exception' },
      { key: 'payer-program-service-listing', name: 'Payer-Program-Service Listing' },
      { key: 'visit-listing', name: 'Visit Listing' },
    ],
  },
];

export default function ReportsClient() {
  // Get all category keys
  const allCategoryKeys = useMemo(() => {
    return reportCategories.map(cat => cat.key);
  }, []);

  // activeKeys represents expanded panels (all expanded by default)
  const [activeKeys, setActiveKeys] = useState<string[]>(allCategoryKeys);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportMetadata | null>(null);

  // Handle individual category collapse/expand
  const handleCategoryChange = (keys: string | string[]) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    setActiveKeys(keysArray);
    // Update allCollapsed state based on whether all are collapsed
    setAllCollapsed(keysArray.length === 0);
  };

  // Handle collapse all button
  const handleCollapseAll = () => {
    if (allCollapsed) {
      // Expand all
      setActiveKeys(allCategoryKeys);
      setAllCollapsed(false);
    } else {
      // Collapse all
      setActiveKeys([]);
      setAllCollapsed(true);
    }
  };

  // Handle report click - opens filter modal
  const handleReportClick = (reportKey: string, categoryKey: string) => {
    const category = reportCategories.find(cat => cat.key === categoryKey);
    const report = category?.reports.find(r => r.key === reportKey);
    
    if (report) {
      setSelectedReport({
        key: reportKey as ReportType,
        name: report.name,
        categoryKey,
      });
      setFilterModalOpen(true);
    }
  };

  const handleCloseFilterModal = () => {
    setFilterModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className={layoutStyles.pageContainer}>
      {/* Header Card */}
      <Card className={layoutStyles.controlBar} variant="borderless">
        <div className={layoutStyles.controlsRow}>
          <Title 
            level={4} 
            className="text-theme-primary"
            style={{ 
              margin: 0,
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            Reports
          </Title>
          <Space size="middle">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              className={buttonStyles.btnSecondary}
            >
              FILTERS
            </Button>
            <Button
              icon={<MenuOutlined />}
              onClick={handleCollapseAll}
              className={buttonStyles.btnSecondary}
            >
              COLLAPSE
            </Button>
          </Space>
        </div>
      </Card>

      {/* Reports Categories */}
      <Card className={layoutStyles.tableCard} variant="borderless">
        <div style={{ padding: '16px' }}>
          <Collapse
            activeKey={activeKeys}
            onChange={handleCategoryChange}
            expandIcon={({ isActive }) => (
              <span style={{ fontSize: '12px' }} className="text-theme-secondary">
                {isActive ? <UpOutlined /> : <DownOutlined />}
              </span>
            )}
            expandIconPosition="end"
            ghost
            style={{ background: 'transparent' }}
          >
            {reportCategories.map((category) => (
              <Panel
                key={category.key}
                header={
                  <span 
                    className="text-theme-primary"
                    style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                    }}
                  >
                    {category.title}
                  </span>
                }
                style={{
                  marginBottom: '8px',
                  borderRadius: '4px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {category.reports.map((report, index) => (
                    <div
                      key={report.key}
                      onClick={() => handleReportClick(report.key, category.key)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < category.reports.length - 1 
                          ? '1px solid var(--border-color)' 
                          : 'none',
                        transition: 'background-color 0.2s',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {report.name}
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>
        </div>
      </Card>

      {/* Report Filter Modal */}
      <ReportFilterModal
        open={filterModalOpen}
        reportMetadata={selectedReport}
        onClose={handleCloseFilterModal}
      />
    </div>
  );
}

