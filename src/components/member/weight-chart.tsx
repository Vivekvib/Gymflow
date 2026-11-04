"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/dates";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Recharts takes literal color values, not CSS variables, so these mirror
 * the design tokens in globals.css (accent, ink-muted, line-strong, surface,
 * line, ink). If the palette changes, update them here too.
 */
const CHART_COLORS = {
  line: "#d4ff00",
  axisText: "#a3a3a0",
  axisLine: "#3d3d3a",
  tooltipBg: "#161616",
  tooltipBorder: "#2b2b2b",
  tooltipText: "#f4f4ef",
} as const;

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
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
            stroke={CHART_COLORS.axisLine}
          />
          <YAxis
            tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
            stroke={CHART_COLORS.axisLine}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip
            contentStyle={{
              background: CHART_COLORS.tooltipBg,
              border: `1px solid ${CHART_COLORS.tooltipBorder}`,
              borderRadius: 6,
              color: CHART_COLORS.tooltipText,
            }}
            labelStyle={{ color: CHART_COLORS.axisText }}
            itemStyle={{ color: CHART_COLORS.tooltipText }}
            cursor={{ stroke: CHART_COLORS.axisLine }}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke={CHART_COLORS.line}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS.line, stroke: CHART_COLORS.line }}
            activeDot={{ r: 5, fill: CHART_COLORS.line, stroke: CHART_COLORS.tooltipBg }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
