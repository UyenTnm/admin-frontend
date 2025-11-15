import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Skeleton } from "@/components/ui/Skeleton";
import { ParallaxHero } from "@/components/ui/ParallaxHero";
import { PageFade } from "@/components/ui/PageFade";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";

type Stats = {
  users: number;
  products: number;
  orders: number;
  salesToday: number;
  chart: { name: string; value: number }[];
  pie: { name: string; value: number }[];
};

const FALLBACK: Stats = {
  users: 0,
  products: 0,
  orders: 0,
  salesToday: 0,
  chart: [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 18 },
    { name: "Wed", value: 9 },
    { name: "Thu", value: 23 },
    { name: "Fri", value: 34 },
    { name: "Sat", value: 28 },
    { name: "Sun", value: 15 },
  ],
  pie: [
    { name: "Electronics", value: 400 },
    { name: "Fashion", value: 300 },
    { name: "Home", value: 200 },
    { name: "Other", value: 100 },
  ],
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/stats");
        if (!mounted) return;

        const data = res?.data;
        // Lấy doanh thu hôm nay từ phần tử cuối mảng "sales"
        const today = data.sales?.[data.sales.length - 1]?.revenues ?? 0;

        // Map dữ liệu chart
        const chart = Array.isArray(data.sales)
          ? data.sales.map((d: any) => ({
              name: new Date(d.date).toLocaleDateString("en-US", {
                weekday: "short",
              }),
              value: Number(d.revenue || 0),
            }))
          : FALLBACK.chart;

        // Pie chart - nếu backend chưa có, dùng category đếm làm tạm
        const pie = [
          { name: "Products", value: data.products ?? 0 },
          { name: "Categories", value: data.categories ?? 0 },
          { name: "Orders", value: data.orders ?? 0 },
        ];

        setStats({
          users: data?.users ?? 0,
          products: data?.products ?? 0,
          orders: data?.orders ?? 0,
          salesToday: today,
          chart,
          pie,
        });
      } catch (err) {
        console.warn("Stats not available, using fallback.", err);
        if (!mounted) return;
        setStats(FALLBACK);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const chartData = stats?.chart ?? FALLBACK.chart;
  const pieData = stats?.pie ?? FALLBACK.pie;

  return (
    <PageFade>
      <ParallaxHero title="Dashboard" subtitle="Daily Performance Report" />

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { key: "users", label: "Users" },
          { key: "products", label: "Products" },
          { key: "orders", label: "Orders" },
          { key: "salesToday", label: "Sales Today" },
        ].map(({ key, label }) => (
          <Card key={key} className="p-4">
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              {label}
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {loading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <AnimatedCounter value={(stats as any)?.[key] ?? 0} />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Weekly Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Category Share</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={pieData} outerRadius={90} label />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </PageFade>
  );
}
