import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReaderLayout } from '@yongin/ui';
import { Card, Form, Input, Button, Typography, message, Select, DatePicker } from 'antd';

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/patron/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, password: values.password }),
      });
      if (res.ok) {
        message.success('Đăng ký thành công! Mã thẻ: ' + (await res.json()).cardBarcode);
        navigate('/login');
      } else {
        const err = await res.json();
        message.error(err.message || 'Đăng ký thất bại');
      }
    } catch {
      message.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReaderLayout>
      <div style={{ maxWidth: 500, margin: '40px auto' }}>
        <Card>
          <Typography.Title level={3} style={{ textAlign: 'center' }}>📝 Đăng ký thẻ thư viện</Typography.Title>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="email@example.com" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
              <Input placeholder="090xxxxxxx" />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Ít nhất 6 ký tự" />
            </Form.Item>
            <Form.Item name="patronType" label="Đối tượng" initialValue="adult">
              <Select options={[{ value: 'adult', label: 'Người lớn' }, { value: 'child', label: 'Thiếu nhi' }]} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>Đăng ký</Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Typography.Text>Đã có tài khoản? </Typography.Text>
              <a onClick={() => navigate('/login')}>Đăng nhập</a>
            </div>
          </Form>
        </Card>
      </div>
    </ReaderLayout>
  );
};

export default RegisterPage;
