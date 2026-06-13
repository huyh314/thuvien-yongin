import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReaderLayout } from '@yongin/ui';
import { login } from '@yongin/api';
import { useAuthStore } from '@yongin/utils';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const store = useAuthStore();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      store.login(result.user, result.accessToken, result.refreshToken);
      message.success('Đăng nhập thành công!');
      navigate('/profile');
    } catch {
      message.error('Sai tên đăng nhập hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReaderLayout>
      <div style={{ maxWidth: 400, margin: '40px auto' }}>
        <Card>
          <Typography.Title level={3} style={{ textAlign: 'center' }}>🔐 Đăng nhập</Typography.Title>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item name="username" rules={[{ required: true, message: 'Nhập tên đăng nhập' }]}>
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>Đăng nhập</Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Typography.Text>Chưa có tài khoản? </Typography.Text>
              <a onClick={() => navigate('/register')}>Đăng ký ngay</a>
            </div>
          </Form>
        </Card>
      </div>
    </ReaderLayout>
  );
};

export default LoginPage;
