import React from 'react';
import { Card } from 'antd';
import { BarChart as RCBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, color = '#0f3460', height = 300 }) => (
  <Card title={title}>
    <ResponsiveContainer width="100%" height={height}>
      <RCBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} angle={-20} textAnchor="end" height={60} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </RCBarChart>
    </ResponsiveContainer>
  </Card>
);
