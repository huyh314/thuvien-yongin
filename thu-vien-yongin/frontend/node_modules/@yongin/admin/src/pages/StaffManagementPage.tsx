import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Typography, message, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const StaffManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => apiClient.get('/admin/staff').then(r => r.data),
  });

  const handleSave = async (values: any) => {
    if (editItem) {
      await apiClient.put(`/admin/staff/${editItem.id}`, values);
      message.success('Đã cập nhật');
    } else {
      await apiClient.post('/admin/staff', values);
      message.success('Đã thêm');
    }
    setModalOpen(false);
    setEditItem(null);
    form.resetFields();
  };

  return (
    <Card title="👤 Quản lý nhân sự" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditItem(null); form.resetFields(); setModalOpen(true); }}>Thêm nhân viên</Button>}>
      <Table dataSource={staff} rowKey="id" loading={isLoading}
        columns={[
          { title: 'Họ tên', dataIndex: 'full_name' },
          { title: 'Username', dataIndex: 'username' },
          { title: 'Vai trò', render: (_: any, r: any) => <Tag color={r.role_name === 'admin' ? 'red' : 'blue'}>{r.role_name}</Tag> },
          { title: 'Trạng thái', render: (_: any, r: any) => <Tag color={r.status === 'active' ? 'green' : 'red'}>{r.status === 'active' ? 'Hoạt động' : 'Khóa'}</Tag> },
          { title: 'Đăng nhập cuối', dataIndex: 'last_login', render: (v: string) => v ? new Date(v).toLocaleString('vi-VN') : '-' },
          { title: 'Hành động', render: (_: any, r: any) => <Button size="small" onClick={() => { setEditItem(r); form.setFieldsValue(r); setModalOpen(true); }}>Sửa</Button> },
        ]} pagination={false} size="small" />

      <Modal title={editItem ? 'Sửa nhân viên' : 'Thêm nhân viên'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="roleId" label="Vai trò" initialValue={2}>
            <Select options={[{ value: 1, label: 'Admin' }, { value: 2, label: 'Thủ thư' }]} />
          </Form.Item>
          {!editItem && <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>}
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffManagementPage;
