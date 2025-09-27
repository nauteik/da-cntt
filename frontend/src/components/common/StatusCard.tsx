import React from 'react';
import { Card, Statistic } from 'antd';
import { ReactNode } from 'react';

interface StatusCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

export default function StatusCard({
  title,
  value,
  prefix,
  suffix,
  variant = 'primary',
  loading = false
}: StatusCardProps) {
  const getVariantStyles = (variant: string) => {
    const styles = {
      primary: 'border-l-primary text-primary',
      accent: 'border-l-accent text-accent',
      success: 'border-l-green-500 text-green-600',
      warning: 'border-l-yellow-500 text-yellow-600',
      danger: 'border-l-red-500 text-red-600',
    };
    return styles[variant as keyof typeof styles] || styles.primary;
  };

  return (
    <Card 
      loading={loading} 
      className={`card border-l-4 ${getVariantStyles(variant)}`}
    >
      <Statistic
        title={<span className="text-theme-secondary">{title}</span>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ 
          color: 'var(--primary)',
          fontSize: '1.5rem',
          fontWeight: 600 
        }}
      />
    </Card>
  );
}