"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatPaise } from "@/lib/currency";
import type { RevenuePoint } from "@/modules/dashboard/service";

/**
 * Recharts takes literal color values, not CSS variables, so these mirror the
 * tokens in globals.css (accent, ink-muted, line, surface, ink). Same note as
 * components/member/weight-chart.tsx: update both if the palette changes.
 */
const CHART_COLORS = {
  current: "#d4ff00",
  earlier: "#6e7a1c",
  axisText: "#a3a3a0",
  axisLine: "#3d3d3a",
  tooltipBg: "#161616",
  tooltipBorder: "#2b2b2b",
  tooltipText: "#f4f4ef",
} as const;

function compactRupees(rupees: number): string {
  if (rupees >= 100_000) return `${(rupees / 100_000).toFixed(rupees % 100_000 === 0 ? 0 : 1)}L`;
  if (rupees >= 1_000) return `${(rupees / 1_000).toFixed(rupees % 1_000 === 0 ? 0 : 1)}k`;
  return String(rupees);
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const hasRevenue = data.some((point) => point.totalPaise > 0);
  const chartData = data.map((point) => ({
    label: point.label,
    rupees: point.totalPaise / 100,
    paymentCount: point.paymentCount,
  }));
  const lastIndex = chartData.length - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Collected, last {data.length} months</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasRevenue ? (
          <EmptyState
            title="No payments yet"
            description="Once you record payments, each month's total shows up here."
          />
        ) : (
          <>
            <div className="h-56 w-full sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
                    stroke={CHART_COLORS.axisLine}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
                    stroke={CHART_COLORS.axisLine}
                    tickFormatter={compactRupees}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      background: CHART_COLORS.tooltipBg,
                      border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                      borderRadius: 6,
                      color: CHART_COLORS.tooltipText,
                    }}
                    labelStyle={{ color: CHART_COLORS.axisText }}
                    itemStyle={{ color: CHART_COLORS.tooltipText }}
                    formatter={(value, _name, item) => {
                      const count = (item?.payload as { paymentCount?: number } | undefined)?.paymentCount ?? 0;
                      return [
                        `${formatPaise(Number(value) * 100)} from ${count} ${count === 1 ? "payment" : "payments"}`,
                        "Collected",
                      ];
                    }}
                  />
                  <Bar dataKey="rupees" radius={[3, 3, 0, 0]}>
                    {chartData.map((point, index) => (
                      <Cell
                        key={point.label}
                        fill={index === lastIndex ? CHART_COLORS.current : CHART_COLORS.earlier}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* The chart is an image to screen readers; this is the same data as text. */}
            <table className="sr-only">
              <caption>Amount collected per month</caption>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Collected</th>
                </tr>
              </thead>
              <tbody>
                {data.map((point) => (
                  <tr key={point.key}>
                    <td>{point.label}</td>
                    <td>{formatPaise(point.totalPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
