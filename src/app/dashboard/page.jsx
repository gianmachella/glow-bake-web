"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";

import Loading from "@/components/Loading"; // 👈 Nuevo componente global
import { motion } from "framer-motion";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("weekly"); // 👈 default

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`/api/summary?range=${filter}`);
        if (!res.ok) throw new Error("Error fetching summary");
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [filter]);

  if (loading) {
    return <Loading />; // 👈 reemplazo directo
  }

  if (!summary) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error loading data</p>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-10 rounded-3xl shadow-inner">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-pink-600 mb-10 text-center"
      >
        Glow Bake Dashboard ✨
      </motion.h1>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-10">
        {["weekly", "monthly", "yearly"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setLoading(true);
              setFilter(f);
            }}
            className={`px-6 py-2 rounded-lg font-medium shadow-md transition ${
              filter === f
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f === "weekly" && "Weekly"}
            {f === "monthly" && "Monthly"}
            {f === "yearly" && "Yearly"}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <motion.div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${(summary.totalRevenue || 0).toFixed(2)}
          </p>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-teal-100 to-teal-200 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {summary.totalOrders || 0}
          </p>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700">Expenses</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${(summary.expenses || 0).toFixed(2)}
          </p>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700">Net Profit</h2>
          <p
            className={`text-3xl font-bold mt-2 ${
              (summary.netProfit || 0) < 0 ? "text-red-600" : "text-green-700"
            }`}
          >
            ${(summary.netProfit || 0).toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Top Cookies */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Best Selling Cookies 🍪 ({filter})
        </h2>

        {summary.topCookies.length === 0 ? (
          <p className="text-gray-500 text-center">No sales recorded yet.</p>
        ) : (
          <>
            <ul className="space-y-3 mb-8">
              {summary.topCookies.map((cookie) => (
                <li
                  key={cookie.cookieId}
                  className="flex justify-between items-center border-b pb-2 text-gray-700"
                >
                  <span className="font-medium">{cookie.name}</span>
                  <span className="text-sm text-gray-600">
                    {cookie.totalSold} pcs —{" "}
                    <span className="font-semibold text-pink-600">
                      ${(cookie.totalRevenue || 0).toFixed(2)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="w-full h-80">
              <ResponsiveContainer>
                <BarChart data={summary.topCookies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fill: "#374151" }} />
                  <YAxis tick={{ fill: "#374151" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      border: "1px solid #f3f4f6",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                    formatter={(value, name) =>
                      name === "totalSold"
                        ? [`${value} pcs`, "Quantity"]
                        : [`$${(value || 0).toFixed(2)}`, "Revenue"]
                    }
                  />
                  <Bar
                    dataKey="totalSold"
                    fill="#ec4899"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
