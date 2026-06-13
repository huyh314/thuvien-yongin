import React, { useState } from 'react';
import { Card, Input, Button, List, Tag, Typography, message, Space } from 'antd';
import { BarcodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const CirculationCheckin: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheckin = async () => {
    if (items.length === 0) return message.warning('Quét ít nhất 1 sách');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/circulation/checkin', {
        itemBarcodes: items, checkinDate: new Date().toISOString().split('T')[0], librarianId: 1,
      });
      message.success(data.message);
      setResults(data.items || []);
      setItems([]);
    } catch (e: any) { message.error(e?.response?.data?.message || 'Lỗi trả sách'); }
    finally { setLoading(false); }
  };

  return (
    <Card title="📥 Trả sách">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.Search prefix={<BarcodeOutlined />} placeholder="Quét mã ĐKCB để trả" enterButton="Thêm" onSearch={(v) => { if (v && !items.includes(v)) setItems([...items, v]); }} />
        <List dataSource={items} renderItem={(item) => <List.Item extra={<Tag color="orange">Sẵn sàng trả</Tag>}>{item}</List.Item>} locale={{ emptyText: 'Quét mã ĐKCB sách cần trả' }} />
        {results.length > 0 && (
          <List style={{ marginTop: 16 }} header={<Typography.Text strong>✅ Đã trả thành công:</Typography.Text>}
            dataSource={results} renderItem={(r) => (
              <List.Item extra={<Tag color={r.overdueDays > 0 ? 'red' : 'green'}>{r.overdueDays > 0 ? `Phí: ${r.feeAmount?.toLocaleString()}đ` : 'Đúng hạn'}</Tag>}>{r.dkcb}</List.Item>
            )} />
        )}
        <Button type="primary" icon={<CheckCircleOutlined />} block size="large" onClick={handleCheckin} loading={loading} disabled={items.length === 0}>✅ Xác nhận trả ({items.length} cuốn)</Button>
      </Space>
    </Card>
  );
};

export default CirculationCheckin;
