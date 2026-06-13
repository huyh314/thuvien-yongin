import React from 'react';
import { Card, Typography, List, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const news = [
  { date: '02/05/2026', title: 'Ngày hội Sách Đà Nẵng 2026 tại xã Sơn Cẩm Hà' },
  { date: '16/05/2026', title: 'Hội thi Kể chuyện theo sách lần 1 — Công viên APEC' },
  { date: '19/05/2026', title: 'Trưng bày tài liệu kỷ niệm 136 năm ngày sinh Chủ tịch Hồ Chí Minh' },
  { date: '30/05/2026', title: 'Ngày hội Sách Đà Nẵng 2026 tại xã Trà My' },
];

export const NewsList: React.FC = () => (
  <Card title="📰 Tin tức & Sự kiện" style={{ marginTop: 24 }}>
    <List
      dataSource={news}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<CalendarOutlined style={{ fontSize: 18, color: '#0f3460' }} />}
            title={<Typography.Text strong>{item.date}</Typography.Text>}
            description={item.title}
          />
        </List.Item>
      )}
    />
  </Card>
);
