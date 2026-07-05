interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((point) => point.revenue), 1);
  const width = 700;
  const height = 220;
  const barGap = 6;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;
  const hasAnyRevenue = data.some((point) => point.revenue > 0);

  return (
    <div className="border border-border bg-paper p-5">
      <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        Revenue — last 14 days
      </p>

      {!hasAnyRevenue ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No paid orders yet
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full" preserveAspectRatio="none">
          {data.map((point, index) => {
            const barHeight = Math.max(
              (point.revenue / max) * (height - 30),
              point.revenue > 0 ? 3 : 1,
            );
            const x = index * (barWidth + barGap);
            const y = height - 30 - barHeight;

            return (
              <g key={point.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={point.revenue > 0 ? "#24433A" : "#D9D2C3"}
                />
                {index % 2 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                    fill="#6B6555"
                  >
                    {point.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export { RevenueChart };
