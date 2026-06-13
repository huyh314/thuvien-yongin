import React from 'react';
import { Card } from 'antd';
import { PieChart as RCPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0f3460', '#e74c3c', '#27ae60', '#f39c12', '#3498db', '#9b59b6', '#1abc9c', '#e67e22', '#2c3e50', '#95a5a6'];

interface PieChartProps {
  title: string;
  data: { name: string; value: number }[];
  height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ title, data, height = 300 }) => (
  <Card title={title}>
    <ResponsiveContainer width="100%" height={height}>
      <RCPieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </RCPieChart>
    </ResponsiveContainer>
  </Card>
);

export const DonutChart: React.FC<PieChartProps> = ({ title, data, height = 300 }) => (
  <Card title={title}>
    <ResponsiveContainer width="100%" height={height}>
      <RCPieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </RCPieChart>
    </ResponsiveContainer>
  </Card>
);
