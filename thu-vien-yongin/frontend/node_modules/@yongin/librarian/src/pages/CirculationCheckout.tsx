import React, { useState } from 'react';
import { Card, Form, Input, Button, List, Tag, Typography, message, Descriptions, Row, Col } from 'antd';
import { BarcodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const CirculationCheckout: React.FC = () => {
  const [patron, setPatron] = useState<any>(null);
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScanPatron = async (barcode: string) => {
    try {
      const { data } = await apiClient.get(`/patron/search?q=${barcode}`);
      if (data && data.length > 0) {
        setPatron(data[0]);
        message.success(`Bạn đọc: ${data[0].full_name}`);
      } else {
        message.error('Không tìm thấy bạn đọc');
      }
    } catch { message.error('Lỗi tìm bạn đọc'); }
  };

  const handleCheckout = async () => {
    if (!patron) return message.warning('Quét thẻ bạn đọc trước');
    if (items.length === 0) return message.warning('Quét ít nhất 1 sách');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/circulation/checkout', {
        patronBarcode: patron.card_barcode,
        itemBarcodes: items,
        checkoutDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        librarianId: 1,
      });
      message.success(data.message);
      setItems([]);
    } catch (e: any) { message.error(e?.response?.data?.message || 'Lỗi mượn sách'); }
    finally { setLoading(false); }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Card title="👤 Bạn đọc">
          <Form.Item><Input.Search prefix={<BarcodeOutlined />} placeholder="Quét mã thẻ" onSearch={handleScanPatron} /></Form.Item>
          {patron && (
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Tên">{patron.full_name}</Descriptions.Item>
              <Descriptions.Item label="Thẻ">{patron.card_barcode}</Descriptions.Item>
              <Descriptions.Item label="Hạn mức">{patron.max_checkouts} cuốn</Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="📤 Mượn sách" extra={items.length > 0 && <Tag color="blue">{items.length} cuốn</Tag>}>
          <Form.Item><Input.Search prefix={<BarcodeOutlined />} placeholder="Quét mã ĐKCB sách" onSearch={(v) => { if (v && !items.includes(v)) setItems([...items, v]); }} /></Form.Item>
          <List dataSource={items} renderItem={(item) => <List.Item extra={<Tag color="green">OK</Tag>}>{item}</List.Item>} locale={{ emptyText: 'Chưa quét sách nào' }} />
          <Button type="primary" icon={<CheckCircleOutlined />} block size="large" onClick={handleCheckout} loading={loading} disabled={!patron || items.length === 0}>
            ✅ Xác nhận mượn ({items.length} cuốn)
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default CirculationCheckout;
