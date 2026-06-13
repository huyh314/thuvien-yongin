import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Table, Tag, Typography } from 'antd';
import { BookOutlined, UserOutlined, SwapOutlined, WarningOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const DashboardPage: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['librarian-dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard').then(r => r.data),
  });

  const { data: overdue } = useQuery({
    queryKey: ['overdue'],
    queryFn: () => apiClient.get('/circulation/overdue').then(r => r.data),
  });

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Đầu sách" value={stats?.totalTitles || 0} prefix={<BookOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Bạn đọc" value={stats?.totalPatrons || 0} prefix={<UserOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Đang mượn" value={stats?.activeCheckouts || 0} prefix={<SwapOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Quá hạn" value={stats?.overdueCount || 0} prefix={<WarningOutlined />} valueStyle={{ color: (stats?.overdueCount || 0) > 0 ? '#e74c3c' : undefined }} /></Card>
        </Col>
      </Row>

      {overdue && overdue.length > 0 && (
        <Card title="⏰ Sách quá hạn" style={{ marginTop: 24 }}>
          <Table
            dataSource={overdue}
            rowKey="id"
            columns={[
              { title: 'ĐKCB', dataIndex: 'dkcb' },
              { title: 'Bạn đọc', dataIndex: 'patronName' },
              { title: 'Quá hạn', render: () => <Tag color="red">Quá hạn</Tag> },
              { title: 'Ngày mượn', dataIndex: 'checkoutDate' },
              { title: 'Hạn trả', dataIndex: 'dueDate' },
            ]}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
