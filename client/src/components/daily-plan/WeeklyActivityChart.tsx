import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeeklyChartDatum = {
  name: string;
  date: string;
  quantidade: number;
};

export default function WeeklyActivityChart({
  chartData,
}: {
  chartData: WeeklyChartDatum[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
        <XAxis dataKey="name" stroke="oklch(0.22 0.07 260 / 0.6)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="oklch(0.22 0.07 260 / 0.6)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.22 0.07 260)",
            border: "1px solid oklch(0.75 0.12 75 / 0.3)",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
          itemStyle={{ color: "oklch(0.82 0.10 80)" }}
        />
        <Bar dataKey="quantidade" fill="oklch(0.75 0.12 75)" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.quantidade > 0 ? "oklch(0.75 0.12 75)" : "oklch(0.75 0.12 75 / 0.3)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
