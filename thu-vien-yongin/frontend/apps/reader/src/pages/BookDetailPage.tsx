import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ReaderLayout } from '@yongin/ui';
import { getBookDetail, searchBooks, bookKeys } from '@yongin/api';
import apiClient from '@yongin/api/src/client';
import { Row, Col, Typography, Tag, Rate, Skeleton, Button, Divider, Progress, Input, Avatar, List, message, Space, Tooltip, Spin } from 'antd';
import { ArrowLeftOutlined, BookOutlined, HeartOutlined, HeartFilled, ShareAltOutlined, EyeOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [liked, setLiked] = useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: bookKeys.detail(Number(id)),
    queryFn: () => getBookDetail(Number(id)),
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ['similar-books', book?.subjects?.[0]],
    queryFn: () => searchBooks(book?.subjects?.[0] || '', 'subject', 1, 5),
    enabled: !!book?.subjects?.[0],
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/opac/works/${id}/reviews`);
      return data?.reviews || data || [];
    },
    enabled: !!id,
  });

  const handleSubmitReview = async () => {
    if (myRating === 0) { message.warning('Vui lòng chọn số sao'); return; }
    try {
      await apiClient.post(`/opac/works/${id}/reviews`, { rating: myRating, comment: myComment });
      message.success('Cảm ơn bạn đã đánh giá!');
      setReviewOpen(false);
      refetchReviews();
    } catch { message.error('Lỗi gửi đánh giá'); }
  };

  const borrowCount = book?.totalCopies || 0;
  const availCount = book?.availableCopies || 0;
  const borrowPercent = borrowCount > 0 ? Math.round(((borrowCount - availCount) / borrowCount) * 100) : 0;

  if (isLoading) return <ReaderLayout><div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 8 }} /></div></ReaderLayout>;
  if (!book) return <ReaderLayout><div style={{ textAlign: 'center', padding: 60 }}><BookOutlined style={{ fontSize: 64, color: '#ddd' }} /><Typography.Title level={4} style={{ color: '#999', marginTop: 16 }}>Không tìm thấy sách</Typography.Title></div></ReaderLayout>;

  return (
    <ReaderLayout>
      <div style={{ padding: '0 0 40px' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 8, color: '#888' }}>Kết quả tìm kiếm</Button>

        {/* ─── HEADER SECTION (Goodreads-style) ─── */}
        <Row gutter={[32, 24]} style={{ marginTop: 8 }}>
          <Col xs={24} md={8} lg={7}>
            <div style={{ position: 'sticky', top: 24 }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', background: '#fff' }}>
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} style={{ width: '100%', display: 'block' }} />
                ) : (
                  <div style={{ background: '#f5f5f5', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOutlined style={{ fontSize: 80, color: '#bbb' }} />
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Tooltip title="Yêu thích"><Button shape="circle" icon={liked ? <HeartFilled style={{ color: '#e74c3c' }} /> : <HeartOutlined />} onClick={() => setLiked(!liked)} /></Tooltip>
                <Tooltip title="Chia sẻ"><Button shape="circle" icon={<ShareAltOutlined />} /></Tooltip>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16} lg={10}>
            <Typography.Title level={3} style={{ marginBottom: 4 }}>{book.title}</Typography.Title>
            <Typography.Text style={{ fontSize: 16, color: '#555' }}>bởi <strong>{book.authorMain}</strong></Typography.Text>

            {/* Rating Summary */}
            <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#0f3460' }}>{book.rating ? book.rating.toFixed(1) : '—'}</span>
              <div>
                <Rate disabled value={book.rating || 0} allowHalf style={{ fontSize: 18 }} />
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  {reviews?.length || 0} đánh giá · {borrowCount} bản
                </Typography.Text>
              </div>
            </div>

            {/* Availability */}
            <div style={{ background: book.isAvailable ? '#f0fdf4' : '#fef2f2', border: `1px solid ${book.isAvailable ? '#bbf7d0' : '#fecaca'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <Space>
                {book.isAvailable ? (
                  <Tag color="success" style={{ fontSize: 14, padding: '2px 12px' }}>✅ Còn {book.availableCopies} bản</Tag>
                ) : (
                  <Tag color="error" style={{ fontSize: 14, padding: '2px 12px' }}>❌ Hết bản</Tag>
                )}
                <Typography.Text type="secondary">tại {book.publisherName || 'Thư viện Yongin'}</Typography.Text>
              </Space>
              {borrowCount > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Progress percent={borrowPercent} size="small" status={borrowPercent > 80 ? 'exception' : 'active'} format={() => `${borrowPercent}% đã mượn`} />
                </div>
              )}
            </div>

            {/* Actions */}
            <Space size={12} style={{ marginBottom: 20 }}>
              <Button type="primary" size="large" icon={<BookOutlined />} disabled={!book.isAvailable} style={{ borderRadius: 8, height: 44, paddingInline: 32 }}>
                {book.isAvailable ? 'Mượn sách' : 'Hết bản'}
              </Button>
              <Button size="large" icon={liked ? <HeartFilled /> : <HeartOutlined />} onClick={() => setLiked(!liked)} style={{ borderRadius: 8, height: 44 }}>
                {liked ? 'Đã lưu' : 'Lưu'}
              </Button>
            </Space>

            {/* Info Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', marginBottom: 20 }}>
              {[
                ['Nhà xuất bản', book.publisherName],
                ['Năm XB', book.publishYear],
                ['ISBN', book.isbn],
                ['Số trang', book.pages],
                ['Kích thước', book.sizeCm],
                ['Ngôn ngữ', book.languageCode?.toUpperCase()],
              ].map(([label, val]) => val && (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>{label}</Typography.Text>
                  <Typography.Text style={{ fontSize: 13 }}>{val}</Typography.Text>
                </div>
              ))}
            </div>

            {/* Summary */}
            {book.summary && (
              <div style={{ marginBottom: 20 }}>
                <Typography.Title level={5}>📝 Giới thiệu sách</Typography.Title>
                <Typography.Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }} style={{ color: '#555', lineHeight: 1.7 }}>
                  {book.summary}
                </Typography.Paragraph>
              </div>
            )}

            {/* Subjects */}
            {book.subjects?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <Typography.Text type="secondary">Chủ đề: </Typography.Text>
                {book.subjects.map((s: string) => <Tag key={s} style={{ marginBottom: 4 }}>{s}</Tag>)}
              </div>
            )}
          </Col>

          {/* Right sidebar: Quick stats */}
          <Col xs={0} lg={7}>
            <div style={{ background: '#f8f9fc', borderRadius: 12, padding: 20 }}>
              <Typography.Title level={5}>📊 Thống kê</Typography.Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><EyeOutlined /> <strong>{borrowCount}</strong> bản trong thư viện</div>
                <div><ClockCircleOutlined /> <strong>{book.publishYear}</strong> năm xuất bản</div>
                <div><UserOutlined /> <strong>{reviews?.length || 0}</strong> người đánh giá</div>
                <div style={{ marginTop: 8 }}>
                  <Typography.Text type="secondary">Phân phối đánh giá:</Typography.Text>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews?.filter((r: any) => Math.round(r.rating) === star).length || 0;
                    const max = Math.max(...(reviews?.map((r: any) => r.rating) || [1]));
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <Typography.Text style={{ width: 20, fontSize: 12 }}>{star}★</Typography.Text>
                        <Progress percent={max > 0 ? (count / max) * 100 : 0} showInfo={false} size="small" strokeColor="#f39c12" style={{ flex: 1, margin: 0 }} />
                        <Typography.Text style={{ width: 24, fontSize: 12, textAlign: 'right' }}>{count}</Typography.Text>
                      </div>
                    );
                  })}
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '32px 0' }} />

        {/* ─── REVIEWS SECTION ─── */}
        <div>
          <Typography.Title level={4}>⭐ Đánh giá từ bạn đọc ({reviews?.length || 0})</Typography.Title>

          <div style={{ marginBottom: 20 }}>
            {reviewOpen ? (
              <div style={{ background: '#f8f9fc', borderRadius: 12, padding: 20, maxWidth: 500 }}>
                <div style={{ marginBottom: 12 }}><Typography.Text strong>Đánh giá của bạn</Typography.Text></div>
                <Rate value={myRating} onChange={setMyRating} style={{ fontSize: 24 }} />
                <Input.TextArea
                  placeholder="Viết nhận xét của bạn về cuốn sách này..."
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={3}
                  style={{ marginTop: 12 }}
                />
                <Space style={{ marginTop: 12 }}>
                  <Button type="primary" onClick={handleSubmitReview}>Gửi đánh giá</Button>
                  <Button onClick={() => setReviewOpen(false)}>Hủy</Button>
                </Space>
              </div>
            ) : (
              <Button onClick={() => setReviewOpen(true)} icon={<Rate disabled value={0} style={{ fontSize: 14 }} />}>
                Viết đánh giá
              </Button>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <List
              dataSource={reviews}
              renderItem={(review: any) => (
                <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Avatar size={28} icon={<UserOutlined />} />
                    <Typography.Text strong>{review.patron_name || 'Bạn đọc'}</Typography.Text>
                    <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : ''}</Typography.Text>
                  </div>
                  {review.comment && <Typography.Paragraph style={{ margin: '4px 0 0 36px', color: '#555' }}>{review.comment}</Typography.Paragraph>}
                </div>
              )}
            />
          ) : (
            <Typography.Text type="secondary">Chưa có đánh giá nào. Hãy là người đầu tiên!</Typography.Text>
          )}
        </div>

        {/* ─── SIMILAR BOOKS ─── */}
        {similar && similar.results?.length > 1 && (
          <>
            <Divider style={{ margin: '32px 0' }} />
            <div>
              <Typography.Title level={4}>📚 Sách tương tự</Typography.Title>
              <Row gutter={[16, 16]}>
                {similar.results.filter((b: any) => b.id !== book.id).slice(0, 4).map((b: any) => (
                  <Col xs={12} sm={6} key={b.id}>
                    <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate(`/works/${b.id}`)}>
                      <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 8 }}>
                        {b.cover_url ? (
                          <img src={b.cover_url} alt={b.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ background: '#f5f5f5', aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOutlined style={{ fontSize: 32, color: '#bbb' }} />
                          </div>
                        )}
                      </div>
                      <Typography.Text strong ellipsis style={{ fontSize: 13, display: 'block' }}>{b.title}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>{b.author_main}</Typography.Text>
                      <Rate disabled value={b.rating || 0} style={{ fontSize: 10 }} />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </>
        )}
      </div>
    </ReaderLayout>
  );
};

export default BookDetailPage;
