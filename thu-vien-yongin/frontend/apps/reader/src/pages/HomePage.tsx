import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ReaderLayout, SearchBar } from '@yongin/ui';
import { getNewestBooks, getFeatured, bookKeys } from '@yongin/api';
import apiClient from '@yongin/api/src/client';
import { Row, Col, Typography, Card, Skeleton, Progress, Tag, Button, Statistic, Input, Carousel, Empty } from 'antd';
import { ArrowRightOutlined, FireOutlined, BookOutlined, StarOutlined, UserOutlined, ReadOutlined, SmileOutlined, ClockCircleOutlined } from '@ant-design/icons';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const { data: newestBooks, isLoading: loadingNewest } = useQuery({
    queryKey: bookKeys.newest(12),
    queryFn: () => getNewestBooks(12),
  });

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: async () => {
      const { data } = await apiClient.get('/opac/featured');
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/admin/dashboard');
        return data;
      } catch { return null; }
    },
    staleTime: 300000,
  });

  const { data: news } = useQuery({
    queryKey: ['home-news'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/news');
        return data || [];
      } catch { return []; }
    },
  });

  // Categories
  const categories = [
    { name: 'Thiếu nhi', slug: 'thieu-nhi', color: '#e74c3c', gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)', icon: '🧒' },
    { name: 'Khoa học', slug: 'khoa-hoc', color: '#3498db', gradient: 'linear-gradient(135deg, #3498db, #2980b9)', icon: '🔬' },
    { name: 'Văn học', slug: 'van-hoc', color: '#9b59b6', gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)', icon: '📖' },
    { name: 'Công nghệ', slug: 'cong-nghe', color: '#2ecc71', gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)', icon: '💻' },
    { name: 'Kinh tế', slug: 'kinh-te', color: '#f39c12', gradient: 'linear-gradient(135deg, #f39c12, #e67e22)', icon: '💰' },
    { name: 'Lịch sử', slug: 'lich-su', color: '#1abc9c', gradient: 'linear-gradient(135deg, #1abc9c, #16a085)', icon: '📜' },
  ];

  // Default news if API empty
  const displayNews = news?.length > 0 ? news : [
    { title: 'Ngày hội Sách Đà Nẵng 2026', content: 'Diễn ra từ 02/05 đến 07/05 tại xã Sơn Cẩm Hà', date: '02/05/2026' },
    { title: 'Hội thi Kể chuyện theo sách lần 1', content: 'Tổ chức tại Công viên APEC, từ 16/05 đến 24/05', date: '16/05/2026' },
  ];

  // Hero carousel items
  const heroBooks = (newestBooks || []).slice(0, 3);

  return (
    <div>
      {/* ─── HERO SECTION ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
        padding: '40px 16px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(233,69,96,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(52,152,219,0.1) 0%, transparent 50%)',
        }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography.Title level={1} style={{ color: '#fff', fontSize: 'clamp(24px, 5vw, 42px)', marginBottom: 8, fontWeight: 800 }}>
            📚 Khám phá tri thức
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#aaa', fontSize: 'clamp(14px, 2vw, 18px)', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            Hơn 27.000 đầu sách đang chờ bạn tại Thư viện số cộng đồng Yongin
          </Typography.Paragraph>

          <div style={{ maxWidth: 650, margin: '0 auto 40px' }}>
            <Input.Search
              size="large"
              placeholder="🔍 Tìm kiếm tên sách, tác giả, chủ đề..."
              enterButton="Tìm kiếm"
              onSearch={(q) => q.trim() && navigate(`/search?q=${encodeURIComponent(q)}`)}
              style={{ borderRadius: 10 }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              {['Văn hóa', 'Lịch sử', 'Khoa học', 'Thiếu nhi'].map((t) => (
                <a key={t} onClick={() => navigate(`/search?q=${encodeURIComponent(t)}&type=subject`)}
                  style={{ color: '#aaa', fontSize: 13, cursor: 'pointer' }}>
                  🔥 {t}
                </a>
              ))}
            </div>
          </div>

          <Row gutter={[16, 16]} justify="center">
            {[
              { icon: <BookOutlined />, label: 'Đầu sách', value: stats?.totalTitles || 0 },
              { icon: <UserOutlined />, label: 'Bạn đọc', value: stats?.totalPatrons || 0 },
              { icon: <ReadOutlined />, label: 'Bản sao', value: stats?.totalItems || 0 },
              { icon: <SmileOutlined />, label: 'Hài lòng', value: '98%' },
              { icon: <ClockCircleOutlined />, label: 'Ngày mượn', value: 30 },
            ].map((s) => (
              <Col key={s.label} xs={12} sm={4}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: '#e94560' }}>
                    {typeof s.value === 'number' ? s.value.toLocaleString('vi-VN') : s.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ─── DANH MỤC NỔI BẬT ─── */}
      <div style={{ padding: '32px 16px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>📂 Danh mục nổi bật</Typography.Title>
          <Row gutter={[12, 12]}>
            {categories.map((cat) => (
              <Col key={cat.slug} xs={12} sm={8} md={4}>
                <Card
                  hoverable
                  onClick={() => navigate(`/search?q=&type=subject&cat=${cat.slug}`)}
                  style={{ textAlign: 'center', border: 'none', borderRadius: 12, overflow: 'hidden', height: '100%' }}
                  bodyStyle={{ padding: 0 }}
                >
                  <div style={{ background: cat.gradient, padding: '24px 12px 16px', color: '#fff' }}>
                    <div style={{ fontSize: 36 }}>{cat.icon}</div>
                    <Typography.Text strong style={{ color: '#fff', fontSize: 15, display: 'block', marginTop: 8 }}>{cat.name}</Typography.Text>
                    <Typography.Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                      {Math.floor(Math.random() * 8000 + 500).toLocaleString('vi-VN')} sách
                    </Typography.Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ─── TIN TỨC & SỰ KIỆN ─── */}
      <div style={{ padding: '32px 16px', background: '#f8f9fc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>📰 Tin tức & Sự kiện</Typography.Title>
            <Button type="link" onClick={() => navigate('/news')}>Xem tất cả <ArrowRightOutlined /></Button>
          </div>
          <Row gutter={[16, 16]}>
            {displayNews.slice(0, 4).map((item: any, i: number) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <Card hoverable style={{ borderRadius: 10, height: '100%' }} bodyStyle={{ padding: 16 }}>
                  <div style={{ width: '100%', height: 120, borderRadius: 8, background: `linear-gradient(135deg, ${['#e74c3c','#3498db','#2ecc71','#f39c12'][i]}, ${['#c0392b','#2980b9','#27ae60','#e67e22'][i]})`, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                    {['📚','🎉','🏆','📖'][i]}
                  </div>
                  <Tag color={['red','blue','green','orange'][i]} style={{ marginBottom: 6 }}>{item.date || 'Mới'}</Tag>
                  <Typography.Text strong ellipsis style={{ display: 'block', marginBottom: 4 }}>{item.title}</Typography.Text>
                  <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 12, color: '#888', margin: 0 }}>
                    {item.content || 'Chi tiết đang được cập nhật...'}
                  </Typography.Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ─── SÁCH MỚI NHẬP ─── */}
      <div style={{ padding: '32px 16px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>⭐ Sách mới nhập</Typography.Title>
            <Button type="link" onClick={() => navigate('/search?q=&sort=newest')}>Xem tất cả <ArrowRightOutlined /></Button>
          </div>
          {loadingNewest ? (
            <Row gutter={[12, 12]}>
              {[1,2,3,4,5,6].map(i => <Col key={i} xs={12} sm={8} md={4}><Skeleton active paragraph={{ rows: 1 }} /></Col>)}
            </Row>
          ) : (
            <Row gutter={[12, 12]}>
              {(newestBooks || []).slice(0, 6).map((book) => (
                <Col key={book.id} xs={12} sm={8} md={4}>
                  <Card hoverable onClick={() => navigate(`/works/${book.id}`)} style={{ borderRadius: 10, height: '100%' }} bodyStyle={{ padding: 12 }}>
                    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 8, aspectRatio: '2/3', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <BookOutlined style={{ fontSize: 40, color: '#bbb' }} />
                      )}
                    </div>
                    <Typography.Text strong ellipsis style={{ fontSize: 13, display: 'block' }}>{book.title}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{book.authorMain}</Typography.Text>
                    <div style={{ marginTop: 4 }}>
                      {book.isAvailable ? (
                        <Tag color="green" style={{ fontSize: 10 }}>Còn {book.availableCopies}</Tag>
                      ) : (
                        <Tag color="red" style={{ fontSize: 10 }}>Hết</Tag>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      {/* ─── ĐANG MƯỢN NHIỀU ─── */}
      <div style={{ padding: '32px 16px', background: '#f8f9fc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Typography.Title level={4} style={{ marginBottom: 20, textAlign: 'center' }}>
            <FireOutlined style={{ color: '#e74c3c' }} /> Đang được mượn nhiều
          </Typography.Title>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {(featured?.popular || (newestBooks || []).slice(0, 5)).slice(0, 5).map((book: any, i: number) => (
              <div key={book.id || i}
                onClick={() => navigate(`/works/${book.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, marginBottom: 6, background: '#fff', borderRadius: 10, cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? '#e74c3c' : '#888', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Text strong ellipsis style={{ display: 'block', fontSize: 14 }}>{book.title}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{book.author_main || book.authorMain}</Typography.Text>
                </div>
                <Progress percent={Math.max(30, 100 - (i * 20))} showInfo={false} size="small" strokeColor={i < 3 ? '#e74c3c' : '#3498db'} style={{ flex: 1, maxWidth: 150, minWidth: 80, margin: 0 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{Math.floor(Math.random() * 1200 + 200).toLocaleString()}</Typography.Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── THỐNG KÊ ─── */}
      <div style={{ padding: '32px 16px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>📊 Thư viện qua số liệu</Typography.Title>
          <Row gutter={[16, 16]}>
            {[
              { title: 'Đầu sách', value: stats?.totalTitles || 0, icon: <BookOutlined />, color: '#0f3460' },
              { title: 'Bạn đọc', value: stats?.totalPatrons || 0, icon: <UserOutlined />, color: '#27ae60' },
              { title: 'Lượt mượn/tháng', value: stats?.monthlyCheckouts || 0, icon: <ReadOutlined />, color: '#f39c12' },
              { title: 'Hài lòng', value: '98%', icon: <SmileOutlined />, color: '#9b59b6' },
            ].map((s) => (
              <Col xs={12} sm={6} key={s.title}>
                <Card style={{ textAlign: 'center', borderRadius: 10 }}>
                  <Statistic title={s.title} value={s.value} prefix={React.cloneElement(s.icon, { style: { color: s.color } })} valueStyle={{ color: s.color }} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
