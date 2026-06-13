import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

export const FeaturedCategories: React.FC = () => {
  const categories = [
    { name: 'Sách mới', slug: 'newest', color: '#e74c3c' },
    { name: 'Bán chạy', slug: 'popular', color: '#f39c12' },
    { name: 'Thiếu nhi', slug: 'thieu-nhi', color: '#2ecc71' },
    { name: 'Khoa học', slug: 'khoa-hoc', color: '#3498db' },
    { name: 'Văn học', slug: 'van-hoc', color: '#9b59b6' },
  ];

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
      {categories.map((cat) => (
        <Col key={cat.slug} xs={12} sm={8} md={4}>
          <Card
            hoverable
            style={{ textAlign: 'center', background: cat.color, border: 'none', borderRadius: 10 }}
            bodyStyle={{ padding: '16px 8px' }}
          >
            <Typography.Text strong style={{ color: '#fff', fontSize: 14 }}>{cat.name}</Typography.Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
