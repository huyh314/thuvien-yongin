import React from 'react';
import { Layout, Typography, Menu, Button, Row, Col, Grid } from 'antd';
import { BookOutlined, HomeOutlined, AppstoreOutlined, ReadOutlined, PhoneOutlined, SearchOutlined, LoginOutlined, UserOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

interface ReaderLayoutProps {
  children: React.ReactNode;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

export const ReaderLayout: React.FC<ReaderLayoutProps> = ({ children, darkMode, onToggleDark }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: '/search', icon: <AppstoreOutlined />, label: 'Danh mục' },
    { key: '/news', icon: <ReadOutlined />, label: 'Tin tức' },
    { key: '/contact', icon: <PhoneOutlined />, label: 'Liên hệ' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: darkMode ? '#141414' : '#f0f2f5' }}>
      <Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: darkMode ? '#1a1a2e' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: isMobile ? '0 12px' : '0 40px',
        height: 64, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <BookOutlined style={{ fontSize: 24, color: '#e94560' }} />
          <Typography.Title level={4} style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
            {isMobile ? 'Yongin' : 'Thư viện Yongin'}
          </Typography.Title>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname === '/' ? '/' : (location.pathname.startsWith('/search') ? '/search' : location.pathname)]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent', borderBottom: 'none', flex: 'auto', justifyContent: 'center',
            minWidth: 0, color: '#fff',
          }}
          theme="dark"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onToggleDark && (
            <Button type="text" icon={darkMode ? <SunOutlined /> : <MoonOutlined />} onClick={onToggleDark}
              style={{ color: '#fff' }} />
          )}
          <Button type="text" icon={<SearchOutlined />} onClick={() => navigate('/search')}
            style={{ color: '#fff' }} />
          <Button type="primary" ghost icon={<LoginOutlined />} onClick={() => navigate('/login')}
            style={{ borderRadius: 6 }}>
            {isMobile ? '' : 'Đăng nhập'}
          </Button>
        </div>
      </Header>
      <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {children}
      </Content>
      <Footer style={{
        textAlign: 'center',
        background: darkMode ? '#1a1a2e' : '#1a1a2e',
        color: '#888', padding: '32px 16px',
      }}>
        <Row gutter={[24, 16]} style={{ maxWidth: 900, margin: '0 auto', textAlign: 'left' }}>
          <Col xs={24} sm={8}>
            <Typography.Title level={5} style={{ color: '#fff' }}>📞 Liên hệ</Typography.Title>
            <Typography.Paragraph style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
              🏛️ 46 Bạch Đằng, Hải Châu, Đà Nẵng<br />
              📧 info@thuvienyongin.vn<br />
              📞 0236.xxxx.xxx<br />
              ⏰ Thứ 2 - CN: 7:00 - 21:00
            </Typography.Paragraph>
          </Col>
          <Col xs={24} sm={8}>
            <Typography.Title level={5} style={{ color: '#fff' }}>🔗 Liên kết</Typography.Title>
            <Typography.Paragraph style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
              <a onClick={() => navigate('/')} style={{ color: '#aaa', display: 'block' }}>Trang chủ</a>
              <a onClick={() => navigate('/search')} style={{ color: '#aaa', display: 'block' }}>Danh mục sách</a>
              <a onClick={() => navigate('/login')} style={{ color: '#aaa', display: 'block' }}>Đăng nhập</a>
            </Typography.Paragraph>
          </Col>
          <Col xs={24} sm={8}>
            <Typography.Title level={5} style={{ color: '#fff' }}>📬 Đăng ký nhận tin</Typography.Title>
            <Typography.Paragraph style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
              Nhận thông báo về sách mới, sự kiện thư viện qua email.
            </Typography.Paragraph>
          </Col>
        </Row>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #333' }}>
          <Typography.Text style={{ color: '#666', fontSize: 12 }}>
            &copy; 2026 CÔNG TY KPT &middot; Phần mềm Thư viện Yongin &middot; Hệ thống quản lý thư viện số cộng đồng
          </Typography.Text>
        </div>
      </Footer>
    </Layout>
  );
};
