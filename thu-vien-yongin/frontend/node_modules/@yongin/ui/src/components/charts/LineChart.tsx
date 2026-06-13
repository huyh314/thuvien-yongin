import React from 'react';
import { Card, Typography } from 'antd';
import { LineChart as RCLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  title: string;
  data: { name: string; value: number; value2?: number }[];
  dataKey?: string;
  color?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ title, data, dataKey = 'value', color = '#0f3460', height = 300 }) => (
  <Card title={title}>
    <ResponsiveContainer width="100%" height={height}>
      <RCLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </RCLineChart>
    </ResponsiveContainer>
  </Card>
);
