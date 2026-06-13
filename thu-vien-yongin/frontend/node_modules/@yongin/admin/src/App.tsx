import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppLayout } from '@yongin/ui';
import { useAuthStore } from '@yongin/utils';
import { login as apiLogin } from '@yongin/api';
import {
  DashboardOutlined, TeamOutlined, FileTextOutlined,
  SettingOutlined, BookOutlined,
} from '@ant-design/icons';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import DashboardPage from './pages/DashboardPage';
import StaffManagementPage from './pages/StaffManagementPage';
import ReportsPage from './pages/ReportsPage';
import SystemConfigPage from './pages/SystemConfigPage';
import StandardsPage from './pages/StandardsPage';

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/staff', icon: <TeamOutlined />, label: 'Nhân sự' },
  { key: '/admin/reports', icon: <FileTextOutlined />, label: 'Báo cáo' },
  { key: '/admin/config', icon: <SettingOutlined />, label: 'Cấu hình' },
  { key: '/admin/standards', icon: <BookOutlined />, label: 'DM chuẩn' },
];

const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await apiLogin(values.username, values.password);
      useAuthStore.getState().login(result.user, result.accessToken, result.refreshToken);
      message.success('Đăng nhập thành công!');
      onLogin();
    } catch { message.error('Sai tên đăng nhập hoặc mật khẩu'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <Card>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>🔐 Đăng nhập Quản trị</Typography.Title>
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item name="username" rules={[{ required: true }]}><Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block size="large" loading={loading}>Đăng nhập</Button></Form.Item>
          <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>Admin: admin/admin123</Typography.Text>
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
    <AppLayout title="🏛️ Quản trị" user={user} onLogout={() => { logout(); navigate('/admin'); }} menuItems={menuItems}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="config" element={<SystemConfigPage />} />
        <Route path="standards" element={<StandardsPage />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
