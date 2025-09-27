import React from 'react';
import { Input, Select, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'input' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface SearchFilterProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onReset?: () => void;
  showReset?: boolean;
}

export default function SearchFilter({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters = [],
  onReset,
  showReset = true
}: SearchFilterProps) {
  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={filter.value}
            onChange={filter.onChange}
            allowClear
            style={{ minWidth: 150 }}
            className="input"
          >
            {filter.options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      case 'date':
        return (
          <RangePicker
            key={filter.key}
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ minWidth: 200 }}
            className="input"
          />
        );
      case 'input':
      default:
        return (
          <Input
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={filter.value}
            onChange={(e) => filter.onChange?.(e.target.value)}
            style={{ minWidth: 150 }}
            className="input"
          />
        );
    }
  };

  return (
    <div className="card p-4 mb-4">
      <Space wrap size="middle">
        <Input
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="input min-w-[250px]"
        />
        
        {filters.length > 0 && (
          <>
            <div className="flex items-center text-theme-secondary">
              <FilterOutlined className="mr-1" />
              <span>Bộ lọc:</span>
            </div>
            {filters.map(renderFilter)}
          </>
        )}
        
        {showReset && (
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            className="btn-secondary"
          >
            Đặt lại
          </Button>
        )}
      </Space>
    </div>
  );
}