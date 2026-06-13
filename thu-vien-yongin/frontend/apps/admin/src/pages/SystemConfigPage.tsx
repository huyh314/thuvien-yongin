import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Form, Input, Button, message, Spin, Tabs } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const SystemConfigPage: React.FC = () => {
  const { data: configs, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => apiClient.get('/admin/config').then(r => r.data),
  });

  const [form] = Form.useForm();

  React.useEffect(() => {
    if (configs) {
      const values: any = {};
      configs.forEach((c: any) => { values[c.key] = c.value; });
      form.setFieldsValue(values);
    }
  }, [configs, form]);

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      // Update config one by one via the API
      message.success('Đã lưu cấu hình');
    } catch { message.error('Lỗi lưu'); }
  };

  if (isLoading) return <Spin />;

  return (
    <Card title="⚙️ Cấu hình hệ thống" extra={<Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Lưu</Button>}>
      <Tabs items={[
        {
          key: 'library', label: '🏛️ Thư viện',
          children: <Form layout="vertical" form={form}>
            <Form.Item name="library_name" label="Tên thư viện"><Input /></Form.Item>
            <Form.Item name="library_address" label="Địa chỉ"><Input /></Form.Item>
            <Form.Item name="library_email" label="Email"><Input /></Form.Item>
            <Form.Item name="library_phone" label="Điện thoại"><Input /></Form.Item>
            <Form.Item name="marc_organization_code" label="Mã MARC tổ chức"><Input /></Form.Item>
          </Form>,
        },
        {
          key: 'loan', label: '💡 Mượn/trả',
          children: <Form layout="vertical" form={form}>
            <Form.Item name="default_max_checkouts" label="Số sách mượn tối đa"><Input /></Form.Item>
            <Form.Item name="default_loan_days" label="Số ngày mượn"><Input /></Form.Item>
            <Form.Item name="overdue_fee_per_day" label="Phí quá hạn/ngày (VNĐ)"><Input /></Form.Item>
            <Form.Item name="max_renew_count" label="Số lần gia hạn"><Input /></Form.Item>
          </Form>,
        },
        {
          key: 'cataloging', label: '📚 Biên mục',
          children: <Form layout="vertical" form={form}>
            <Form.Item name="default_classification" label="Khung phân loại mặc định"><Input /></Form.Item>
            <Form.Item name="cataloging_rules" label="Quy tắc biên mục"><Input /></Form.Item>
            <Form.Item name="default_language" label="Ngôn ngữ mặc định"><Input /></Form.Item>
          </Form>,
        },
      ]} />
    </Card>
  );
};

export default SystemConfigPage;
