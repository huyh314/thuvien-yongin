import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ReaderLayout, BookCard } from '@yongin/ui';
import { searchBooks, bookKeys } from '@yongin/api';
import { Row, Col, Typography, Pagination, Spin, Empty, Tag } from 'antd';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  const { data, isLoading } = useQuery({
    queryKey: bookKeys.search(q, type),
    queryFn: () => searchBooks(q, type),
    enabled: !!q,
  });

  return (
    <ReaderLayout>
      <Typography.Title level={4}>
        🔍 Kết quả tìm kiếm: "{q}"
        {data && <Typography.Text style={{ fontWeight: 400, fontSize: 14, color: '#888', marginLeft: 8 }}>
          ({data.total} kết quả)
        </Typography.Text>}
      </Typography.Title>

      {isLoading && <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>}

      {data && data.results.length === 0 && <Empty description="Không tìm thấy kết quả" />}

      {data && data.results.length > 0 && (
        <>
          <Row gutter={[12, 12]}>
            {data.results.map((book) => (
              <Col key={book.id} xs={24} sm={12} lg={8}>
                <BookCard book={book} onClick={(id) => window.location.href = `/works/${id}`} />
              </Col>
            ))}
          </Row>
          {data.totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination current={data.page} total={data.total} pageSize={data.limit} showSizeChanger={false} />
            </div>
          )}
        </>
      )}
    </ReaderLayout>
  );
};

export default SearchResultsPage;
