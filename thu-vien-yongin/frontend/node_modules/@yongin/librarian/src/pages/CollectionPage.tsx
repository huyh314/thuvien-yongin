import React, { useState } from 'react';
import { Card, Table, Tag, Select, Space, Button, Input, message, Tabs } from 'antd';
import { SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const CollectionPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferDkcb, setTransferDkcb] = useState('');
  const [toSection, setToSection] = useState('Kho Đọc');
  const [discardDkcb, setDiscardDkcb] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/collection/items?limit=50');
      setItems(data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const handleTransfer = async () => {
    if (!transferDkcb) return;
    try {
      await apiClient.post('/collection/transfer', { dkcb: transferDkcb, toSection, reason: 'Chuyển kho' });
      message.success('Chuyển kho thành công');
      loadItems();
    } catch { message.error('Lỗi chuyển kho'); }
  };

  const handleDiscard = async () => {
    if (!discardDkcb) return;
    try {
      await apiClient.post('/collection/discard', { dkcb: discardDkcb, reason: 'Thanh lý' });
      message.success('Thanh lý thành công');
      loadItems();
    } catch { message.error('Lỗi thanh lý'); }
  };

  return (
    <div>
      <Tabs defaultActiveKey="inventory" items={[
        {
          key: 'inventory', label: '📦 Tồn kho',
          children: <Card><Button onClick={loadItems} loading={loading} style={{ marginBottom: 16 }}>Tải danh sách</Button>
            <Table dataSource={items} rowKey="id" pagination={false} size="small"
              columns={[
                { title: 'ĐKCB', dataIndex: 'dkcb' },
                { title: 'Tên sách', dataIndex: 'title' },
                { title: 'Kho', dataIndex: 'shelf_section' },
                { title: 'Trạng thái', render: (_: any, r: any) => <Tag color={r.status === 'available' ? 'green' : 'red'}>{r.status === 'available' ? 'Còn' : 'Đã mượn'}</Tag> },
              ]} />
          </Card>
        },
        {
          key: 'transfer', label: '🏪 Chuyển kho',
          children: <Card><Space direction="vertical" style={{ width: '100%' }}>
            <Input placeholder="Mã ĐKCB" value={transferDkcb} onChange={e => setTransferDkcb(e.target.value)} />
            <Select value={toSection} onChange={setToSection} options={[{ value: 'Kho Mượn', label: 'Kho Mượn' }, { value: 'Kho Đọc', label: 'Kho Đọc' }, { value: 'Kho Thiếu nhi', label: 'Kho Thiếu nhi' }, { value: 'Kho Người lớn', label: 'Kho Người lớn' }]} style={{ width: '100%' }} />
            <Button type="primary" icon={<SwapOutlined />} onClick={handleTransfer} block>Chuyển</Button>
          </Space></Card>
        },
        {
          key: 'discard', label: '🗑️ Thanh lý',
          children: <Card><Space direction="vertical" style={{ width: '100%' }}>
            <Input placeholder="Mã ĐKCB" value={discardDkcb} onChange={e => setDiscardDkcb(e.target.value)} />
            <Button danger icon={<DeleteOutlined />} onClick={handleDiscard} block>Thanh lý</Button>
          </Space></Card>
        },
      ]} />
    </div>
  );
};

export default CollectionPage;
