import React, { useState } from 'react';
import { Card, Tabs, Table, Typography, Spin, Input } from 'antd';
import apiClient from '@yongin/api/src/client';

const StandardsPage: React.FC = () => {
  const [cutter, setCutter] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [shelves, setShelves] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const loadTab = (key: string, api: string, setter: (d: any[]) => void) => {
    if (setter.name.includes(key)) return;
    setLoading(key);
    apiClient.get(api).then(r => setter(r.data || [])).catch(() => setter([])).finally(() => setLoading(null));
  };

  return (
    <Card title="📚 Danh mục chuẩn">
      <Tabs onChange={(key) => {
        if (key === 'cutter') loadTab('cutter', '/admin/standards/cutter', setCutter);
        if (key === 'languages') loadTab('languages', '/admin/standards/languages', setLanguages);
        if (key === 'shelves') loadTab('shelves', '/admin/standards/shelves', setShelves);
      }} items={[
        {
          key: 'cutter', label: '📖 Bảng Cutter',
          children: loading === 'cutter' ? <Spin /> : (
            <div>
              <Input.Search placeholder="Tìm vần Cutter..." style={{ marginBottom: 16, maxWidth: 300 }} />
              <Table dataSource={cutter} rowKey="id" size="small" columns={[
                { title: 'Vần', dataIndex: 'vowel' },
                { title: 'Mã số', dataIndex: 'code' },
              ]} pagination={{ pageSize: 20 }} />
            </div>
          ),
        },
        {
          key: 'languages', label: '🌐 Mã ngôn ngữ',
          children: loading === 'languages' ? <Spin /> : (
            <Table dataSource={languages} rowKey="id" size="small" columns={[
              { title: 'Mã', dataIndex: 'code' },
              { title: 'Tên', dataIndex: 'name' },
              { title: 'Tên gốc', dataIndex: 'name_native' },
            ]} pagination={{ pageSize: 20 }} />
          ),
        },
        {
          key: 'shelves', label: '🏪 Kho',
          children: loading === 'shelves' ? <Spin /> : (
            <Table dataSource={shelves} rowKey="id" size="small" columns={[
              { title: 'Kho', dataIndex: 'section' },
              { title: 'Giá', dataIndex: 'row' },
              { title: 'Vị trí', dataIndex: 'position' },
              { title: 'Trạng thái', dataIndex: 'status', render: (v: string) => <span style={{ color: v === 'active' ? 'green' : 'red' }}>{v}</span> },
            ]} pagination={{ pageSize: 20 }} />
          ),
        },
      ]} />
    </Card>
  );
};

export default StandardsPage;
