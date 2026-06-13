import React, { useState } from 'react';
import { Card, Input, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const PatronSearchPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/patron/search?q=${encodeURIComponent(q)}`);
      setResults(data || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <Card title="🔍 Tìm kiếm bạn đọc">
      <Input.Search placeholder="Tìm theo tên, mã thẻ..." onSearch={handleSearch} enterButton={<SearchOutlined />} size="large" loading={loading} style={{ marginBottom: 16 }} />
      <Table dataSource={results} rowKey="id" pagination={false}
        columns={[
          { title: 'Mã thẻ', dataIndex: 'card_barcode' },
          { title: 'Họ tên', dataIndex: 'full_name' },
          { title: 'Loại', render: (_: any, r: any) => <Tag color={r.patron_type === 'adult' ? 'blue' : 'green'}>{r.patron_type === 'adult' ? 'Người lớn' : 'Thiếu nhi'}</Tag> },
          { title: 'Trạng thái', render: (_: any, r: any) => <Tag color={r.status === 'active' ? 'green' : 'red'}>{r.status === 'active' ? 'Hoạt động' : 'Khóa'}</Tag> },
          { title: 'Hạn mức', render: (_: any, r: any) => `${r.max_checkouts || 0} cuốn` },
        ]} />
    </Card>
  );
};

export default PatronSearchPage;
