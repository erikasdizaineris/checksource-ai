
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface ReliabilityGaugeProps {
  score: number;
}

const ReliabilityGauge: React.FC<ReliabilityGaugeProps> = ({ score }) => {
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // Green
    if (s >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const color = getColor(score);

  return (
    <div className="w-full h-48 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
            <Label
              value={`${score}%`}
              position="centerBottom"
              className="text-2xl font-bold"
              style={{ fill: color, fontSize: '24px', fontWeight: 'bold' }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReliabilityGauge;