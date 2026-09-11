"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/dates";
import { EmptyState } from "@/components/shared/empty-state";

interface WeightChartProps {
  data: { date: Date; weightKg: number }[];
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No weight logs yet"
        description="Log your first weight to start seeing your trend here."
      />
    );
  }

  const chartData = data.map((point) => ({
    date: formatDate(point.date),
    weightKg: point.weightKg,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#565d66" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#565d66"
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip />
          <Line type="monotone" dataKey="weightKg" stroke="#e2571c" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
