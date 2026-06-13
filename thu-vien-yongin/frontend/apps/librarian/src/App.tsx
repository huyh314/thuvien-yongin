import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppLayout } from '@yongin/ui';
import { useAuthStore } from '@yongin/utils';
import { login as apiLogin } from '@yongin/api';
import {
  DashboardOutlined, BookOutlined, SwapOutlined, TeamOutlined,
  ShoppingCartOutlined, FileTextOutlined, SettingOutlined,
} from '@ant-design/icons';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import DashboardPage from './pages/DashboardPage';
import CatalogingPage from './pages/CatalogingPage';
import CirculationCheckout from './pages/CirculationCheckout';
import CirculationCheckin from './pages/CirculationCheckin';
import PatronSearchPage from './pages/PatronSearchPage';
import CollectionPage from './pages/CollectionPage';

const menuItems = [
  { key: '/librarian', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/librarian/cataloging', icon: <BookOutlined />, label: 'Biên mục' },
  { key: '/librarian/checkout', icon: <SwapOutlined />, label: 'Mượn sách' },
  { key: '/librarian/checkin', icon: <SwapOutlined />, label: 'Trả sách' },
  { key: '/librarian/patrons', icon: <TeamOutlined />, label: 'Bạn đọc' },
  { key: '/librarian/collection', icon: <ShoppingCartOutlined />, label: 'Kho' },
];

const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await apiLogin(values.username, values.password);
      useAuthStore.getState().login(result.user, result.accessToken, result.refreshToken);
      message.success('Đăng nhập thành công!');
      onLogin();
    } catch {
      message.error('Sai tên đăng nhập hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <Card>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>🔐 Đăng nhập Thủ thư</Typography.Title>
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>Đăng nhập</Button>
          </Form.Item>
          <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>
            Admin: admin/admin123 · Thủ thư: librarian/lib123
          </Typography.Text>
        </Form>
      </Card>
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) return <LoginView onLogin={() => {}} />;

  return (
    <AppLayout title="🧑‍🏫 Thủ thư" user={user} onLogout={() => { logout(); navigate('/librarian'); }} menuItems={menuItems}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="cataloging" element={<CatalogingPage />} />
        <Route path="checkout" element={<CirculationCheckout />} />
        <Route path="checkin" element={<CirculationCheckin />} />
        <Route path="patrons" element={<PatronSearchPage />} />
        <Route path="collection" element={<CollectionPage />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
