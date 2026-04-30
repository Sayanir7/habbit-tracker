import React from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../common/Card.jsx";

export function ProgressChart({ trendData }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Visualization</p>
          <h2 className="text-xl font-bold">Progress over time</h2>
        </div>
        <LineChartIcon />
      </div>
      <div className="mt-4 h-60 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ left: -24, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #d6d3d1",
                boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)"
              }}
            />
            <Area type="monotone" dataKey="progress" stroke="#16a34a" fill="url(#progressGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function LineChartIcon() {
  return (
    <div className="hidden h-12 w-24 sm:block">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={[{ v: 30 }, { v: 48 }, { v: 42 }, { v: 68 }, { v: 88 }]}>
          <Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
