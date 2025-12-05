"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { EloHistory } from "@/lib/types";

const chartConfig = {
  elo: {
    label: "ELO",
    color: "hsl(var(--primary))",
  },
}

export default function EloChart({ data }: { data: EloHistory[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        Not enough match data to display chart.
      </div>
    )
  }
  
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={['dataMin - 20', 'dataMax + 20']}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Line dataKey="elo" type="monotone" stroke="var(--color-elo)" strokeWidth={2} dot={true} />
      </LineChart>
    </ChartContainer>
  )
}
