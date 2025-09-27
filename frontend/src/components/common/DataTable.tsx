import React from 'react';
import { Table, Card, TableProps } from 'antd';

interface DataTableProps<T = unknown> extends Omit<TableProps<T>, 'title'> {
  title?: string;
  extra?: React.ReactNode;
  showCard?: boolean;
  cardProps?: {
    bordered?: boolean;
    size?: 'default' | 'small';
  };
}

export default function DataTable<T = unknown>({
  title,
  extra,
  showCard = true,
  cardProps = { bordered: true },
  ...tableProps
}: DataTableProps<T>) {
  const tableElement = (
    <Table
      {...tableProps}
      scroll={{ x: 'max-content' }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} của ${total} bản ghi`,
        ...tableProps.pagination,
      }}
    />
  );

  if (!showCard) {
    return tableElement;
  }

  return (
    <Card 
      title={title && <span className="heading-secondary">{title}</span>}
      extra={extra}
      className="card"
      {...cardProps}
    >
      {tableElement}
    </Card>
  );
}