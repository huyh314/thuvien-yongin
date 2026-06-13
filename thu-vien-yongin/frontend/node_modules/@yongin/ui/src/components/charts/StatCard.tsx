import React from 'react';
import { Card, Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  prefix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, prefix }) => (
  <Card>
    <Statistic
      title={title}
      value={value}
      prefix={prefix || icon}
      valueStyle={{ color: color || '#0f3460' }}
    />
  </Card>
);
