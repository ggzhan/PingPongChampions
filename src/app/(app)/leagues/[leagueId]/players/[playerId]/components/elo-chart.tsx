
"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import type { EloHistory } from '@/lib/types';
import { useTheme } from 'next-themes';

interface EloChartProps {
  data: EloHistory[];
}

export default function EloChart({ data }: EloChartProps) {
  // Trim data to the last 15 matches for readability
  const chartData = data.slice(-15);
  const { resolvedTheme } = useTheme()
  const strokeColor = resolvedTheme === 'dark' ? '#A1A1AA' : '#71717A'; // zinc-400 / zinc-500


  if (chartData.length <= 1) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Not enough match data to display a chart.
      </div>
    );
  }

  // Calculate Y-axis domain with padding
  const eloValues = chartData.map(d => d.elo);
  const yMin = Math.min(...eloValues);
  const yMax = Math.max(...eloValues);
  const yPadding = (yMax - yMin) * 0.1 || 10;
  const yDomain = [Math.floor(yMin - yPadding), Math.ceil(yMax + yPadding)];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="colorElo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="matchIndex"
          stroke={strokeColor}
          tickFormatter={(value) => `M${value}`}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke={strokeColor}
          domain={yDomain}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          dx={-5}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
          content={<ChartTooltipContent
            formatter={(value, name) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{`ELO: ${value}`}</span>
                </div>
            )}
            labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                    const matchIndex = payload[0].payload.matchIndex;
                    return `Match #${matchIndex}`;
                }
                return label;
            }}
            indicator="dot"
            />}
        />
        <Area type="monotone" dataKey="elo" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorElo)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
