import React from 'react';
import { Card, Typography, Tag, Rate } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import type { Book } from '@yongin/types';

interface BookCardProps {
  book: Book;
  onClick?: (id: number) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => (
  <Card
    hoverable
    onClick={() => onClick?.(book.id)}
    style={{ borderRadius: 10, height: '100%' }}
    cover={
      <div style={{ height: 200, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <BookOutlined style={{ fontSize: 64, color: '#bbb' }} />
        )}
      </div>
    }
  >
    <Card.Meta
      title={<Typography.Text ellipsis style={{ maxWidth: 160 }}>{book.title}</Typography.Text>}
      description={
        <div>
          <Typography.Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0, fontSize: 12, color: '#888' }}>
            {book.authorMain}
          </Typography.Paragraph>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Rate disabled value={book.rating || 0} style={{ fontSize: 12 }} />
            <Tag color={book.isAvailable ? 'green' : 'red'}>
              {book.isAvailable ? `Còn ${book.availableCopies}` : 'Hết'}
            </Tag>
          </div>
        </div>
      }
    />
  </Card>
);
