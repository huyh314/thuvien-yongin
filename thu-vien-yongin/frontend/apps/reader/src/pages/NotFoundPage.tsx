import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReaderLayout } from '@yongin/ui';
import { Button, Result } from 'antd';

const NotFoundPage: React.FC = () => (
  <ReaderLayout>
    <Result status="404" title="404" subTitle="Trang không tồn tại" extra={<Button type="primary" onClick={() => window.location.href = '/'}>Về trang chủ</Button>} />
  </ReaderLayout>
);

export default NotFoundPage;
