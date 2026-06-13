import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Spin } from 'antd';
import { BookOutlined, TeamOutlined, SwapOutlined, WarningOutlined } from '@ant-design/icons';
import { StatCard, LineChart, PieChart, BarChart } from '@yongin/ui';
import apiClient from '@yongin/api/src/client';

const DashboardPage: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard').then(r => r.data),
  });

  const { data: ddcStats } = useQuery({
    queryKey: ['admin-charts-ddc'],
    queryFn: () => apiClient.get('/admin/charts/ddc').then(r => r.data),
  });

  const { data: langStats } = useQuery({
    queryKey: ['admin-charts-languages'],
    queryFn: () => apiClient.get('/admin/charts/languages').then(r => r.data),
  });

  const { data: monthly } = useQuery({
    queryKey: ['admin-charts-monthly'],
    queryFn: () => apiClient.get('/admin/charts/monthly-circulation?from=2026-01-01&to=2026-12-31').then(r => r.data),
  });

  const { data: keywords } = useQuery({
    queryKey: ['admin-popular-keywords'],
    queryFn: () => apiClient.get('/admin/popular-keywords').then(r => r.data),
  });

  const monthlyData = (monthly || []).map((m: any) => ({ name: m.month, value: m.count }));
  const ddcData = (ddcStats || []).slice(0, 10).map((d: any) => ({ name: d.name, value: d.count }));
  const langData = (langStats || []).map((l: any) => ({ name: l.name, value: l.count }));
  const keywordData = (keywords || []).slice(0, 10).map((k: any) => ({ name: k.query || k, value: k.count || k.search_count || 0 }));

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard title="Đầu tài liệu" value={stats?.totalTitles || 0} icon={<BookOutlined style={{ color: '#0f3460' }} />} color="#0f3460" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Bạn đọc" value={stats?.totalPatrons || 0} icon={<TeamOutlined style={{ color: '#27ae60' }} />} color="#27ae60" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Đang mượn" value={stats?.activeCheckouts || 0} icon={<SwapOutlined style={{ color: '#f39c12' }} />} color="#f39c12" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Quá hạn" value={stats?.overdueCount || 0} icon={<WarningOutlined style={{ color: '#e74c3c' }} />} color="#e74c3c" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <LineChart
            title="📈 Mượn/Trả theo tháng"
            data={monthlyData.length > 0 ? monthlyData : [{ name: 'Chưa có', value: 0 }]}
            color="#3498db"
          />
        </Col>
        <Col xs={24} lg={12}>
          <PieChart
            title="📊 Phân loại theo chủ đề"
            data={ddcData.length > 0 ? ddcData : [{ name: 'Chưa có', value: 1 }]}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <BarChart
            title="🔥 Từ khóa tìm kiếm hot"
            data={keywordData.length > 0 ? keywordData : [{ name: 'Chưa có', value: 0 }]}
            color="#e74c3c"
            height={280}
          />
        </Col>
        <Col xs={24} lg={12}>
          <PieChart
            title="🌐 Ngôn ngữ tài liệu"
            data={langData.length > 0 ? langData : [{ name: 'Chưa có', value: 1 }]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
