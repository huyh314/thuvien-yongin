import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ReaderLayout } from '@yongin/ui';
import { useAuthStore } from '@yongin/utils';
import { Card, Row, Col, Typography, Button, Descriptions, List, Tag, Empty } from 'antd';
import { BookOutlined, HistoryOutlined, HeartOutlined, BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

const ProfileOverview: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <ReaderLayout>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Empty description="Vui lòng đăng nhập" />
          <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>Đăng nhập</Button>
        </div>
      </ReaderLayout>
    );
  }

  return (
    <ReaderLayout>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#0f3460', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff' }}><UserOutlined /></div>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>{user.fullName}</Typography.Title>
            <Tag color="blue">{user.roleName}</Tag>
          </div>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            { icon: <BookOutlined />, label: 'Đang mượn', count: 0, color: '#3498db', onClick: () => {} },
            { icon: <HistoryOutlined />, label: 'Đã trả', count: 0, color: '#2ecc71', onClick: () => {} },
            { icon: <HeartOutlined />, label: 'Yêu thích', count: 0, color: '#e74c3c', onClick: () => {} },
            { icon: <BellOutlined />, label: 'Thông báo', count: 0, color: '#f39c12', onClick: () => {} },
          ].map((item) => (
            <Col xs={12} sm={6} key={item.label}>
              <Card hoverable onClick={item.onClick} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, color: item.color }}>{item.icon}</div>
                <Typography.Title level={3} style={{ margin: '4px 0' }}>{item.count}</Typography.Title>
                <Typography.Text type="secondary">{item.label}</Typography.Text>
              </Card>
            </Col>
          ))}
        </Row>

        <Button danger icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/'); }}>Đăng xuất</Button>
      </Card>
    </ReaderLayout>
  );
};

const ProfilePage: React.FC = () => (
  <Routes>
    <Route index element={<ProfileOverview />} />
  </Routes>
);

export default ProfilePage;
