import React, { useState } from 'react';
import { Card, Tabs, Table, DatePicker, Typography, Space, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const { RangePicker } = DatePicker;

const ReportsPage: React.FC = () => {
  const [from, setFrom] = useState('2026-01-01');
  const [to, setTo] = useState('2026-12-31');

  const tabs = [
    { key: 'overview', label: '📊 Tổng quan', api: '/admin/reports/overview' },
    { key: 'circulation', label: '🔄 Mượn/trả', api: '/admin/reports/circulation' },
    { key: 'acquisitions', label: '📥 Bổ sung', api: '/admin/reports/new-acquisitions' },
    { key: 'cataloging', label: '📝 Biên mục', api: '/admin/reports/cataloging-stats' },
  ];

  return (
    <Card title="📋 Báo cáo thống kê" extra={
      <Space>
        <RangePicker onChange={(_, ds) => { if (ds[0]) setFrom(ds[0]); if (ds[1]) setTo(ds[1]); }} />
        <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
      </Space>
    }>
      <Tabs items={tabs.map(tab => ({
        key: tab.key,
        label: tab.label,
        children: <ReportContent api={tab.api} from={from} to={to} />,
      }))} />
    </Card>
  );
};

const ReportContent: React.FC<{ api: string; from: string; to: string }> = ({ api, from, to }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    apiClient.get(`${api}?from=${from}&to=${to}`).then(r => setData(r.data.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [api, from, to]);

  if (loading) return <Typography.Text type="secondary">Đang tải...</Typography.Text>;
  if (!data) return <Typography.Text type="secondary">Không có dữ liệu</Typography.Text>;

  return <pre style={{ fontSize: 12, background: '#f8f9fc', padding: 16, borderRadius: 8, maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>;
};

export default ReportsPage;
