import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Grid } from 'antd';
import {
  DashboardOutlined, BookOutlined, SwapOutlined, TeamOutlined,
  ShoppingCartOutlined, FileTextOutlined, SettingOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  user: { fullName: string; roleName: string } | null;
  onLogout: () => void;
  menuItems: { key: string; icon: React.ReactNode; label: string }[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, user, onLogout, menuItems }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={isMobile ? true : collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        style={{ background: '#16213e' }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #0f3460' }}>
          <Typography.Text strong style={{ color: '#fff', fontSize: collapsed ? 14 : 18 }}>
            {collapsed ? 'Y' : 'Yongin'}
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>{title}</Typography.Title>
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: 'Thông tin' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: onLogout },
              ],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{user?.fullName || 'Người dùng'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
