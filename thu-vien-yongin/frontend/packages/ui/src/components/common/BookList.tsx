import React from 'react';
import { Row, Col, Typography, Skeleton } from 'antd';
import { BookCard } from './BookCard';
import type { Book } from '@yongin/types';
import { useMediaQuery } from '../../hooks';

interface BookListProps {
  title?: string;
  books?: Book[];
  loading?: boolean;
  onBookClick?: (id: number) => void;
}

export const BookList: React.FC<BookListProps> = ({ title, books, loading, onBookClick }) => {
  const isMobile = useMediaQuery('(max-width: 576px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const cols = isMobile ? 1 : isTablet ? 2 : 4;

  if (loading) {
    return (
      <div style={{ marginTop: 24 }}>
        {title && <Typography.Title level={4}>{title}</Typography.Title>}
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Col key={i} span={24 / cols}>
              <Skeleton active style={{ padding: 16 }} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (!books || books.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      {title && <Typography.Title level={4}>{title}</Typography.Title>}
      <Row gutter={[16, 16]}>
        {books.map((book) => (
          <Col key={book.id} span={24 / cols}>
            <BookCard book={book} onClick={onBookClick} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
