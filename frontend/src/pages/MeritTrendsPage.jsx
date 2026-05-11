import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import { getMeritTrends } from "../services/advancedService";

export default function MeritTrendsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getMeritTrends();
      setRows(data || []);
    })();
  }, []);

  const chartData = useMemo(() => {
    const byYear = {};
    rows.forEach((r) => {
      if (!byYear[r.year]) byYear[r.year] = { year: r.year, opening: 0, closing: 0, count: 0 };
      byYear[r.year].opening += r.opening_merit;
      byYear[r.year].closing += r.closing_merit;
      byYear[r.year].count += 1;
    });
    return Object.values(byYear)
      .map((item) => ({
        year: item.year,
        opening: Number((item.opening / item.count).toFixed(2)),
        closing: Number((item.closing / item.count).toFixed(2)),
      }))
      .sort((a, b) => a.year - b.year);
  }, [rows]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Analytics</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Merit Trend Analyzer</h1>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="opening" stroke="#0f172a" name="Opening merit" strokeWidth={3} />
                <Line type="monotone" dataKey="closing" stroke="#0284c7" name="Closing merit" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
