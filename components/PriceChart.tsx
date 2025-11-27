import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PricePoint } from '../types';

interface PriceChartProps {
  data: PricePoint[];
  theme?: 'dark' | 'light';
}

const PriceChart: React.FC<PriceChartProps> = ({ data, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const textColor = isLight ? '#64748b' : '#94a3b8';
  const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
  const tooltipBg = isLight ? '#ffffff' : '#0f172a';
  const tooltipBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const titleColor = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`w-full h-64 p-4 rounded-2xl ${isLight ? 'bg-white' : 'glass-panel'}`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${titleColor}`}>Price History (6 Months)</h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: textColor }} 
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: textColor }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderRadius: '12px', 
                border: `1px solid ${tooltipBorder}`, 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
              itemStyle={{ color: '#8b5cf6', fontWeight: 600 }}
              labelStyle={{ color: textColor }}
              formatter={(value: number) => [`₹${value}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;