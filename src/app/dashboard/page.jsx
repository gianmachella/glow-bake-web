"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      const res = await fetch("/api/dashboard/summary");
      const data = await res.json();
      setSummary(data);
    }
    fetchSummary();
  }, []);

  if (!summary) return <p className="p-6">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6  rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Dashboard Glow Bake
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-pink-100 p-6 rounded-2xl shadow text-gray-800">
          <h2 className="text-lg font-semibold">Ventas Totales</h2>
          <p className="text-2xl font-bold">
            ${summary.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-teal-100 p-6 rounded-2xl shadow text-gray-800">
          <h2 className="text-lg font-semibold">Órdenes</h2>
          <p className="text-2xl font-bold">{summary.totalOrders}</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-2xl shadow text-gray-800">
          <h2 className="text-lg font-semibold">Gastos</h2>
          <p className="text-2xl font-bold">${summary.expenses.toFixed(2)}</p>
        </div>
        <div className="bg-green-100 p-6 rounded-2xl shadow text-gray-800">
          <h2 className="text-lg font-semibold">Ganancia Neta</h2>
          <p
            className={`text-2xl font-bold ${
              summary.netProfit < 0 ? "text-red-600" : "text-green-700"
            }`}
          >
            ${summary.netProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Top Cookies */}
      <div className="bg-white p-6 rounded-2xl shadow text-gray-800">
        <h2 className="text-xl font-bold mb-4">Galletas más vendidas</h2>
        <ul className="space-y-2">
          {summary.topCookies.map((cookie) => (
            <li
              key={cookie.cookieId}
              className="flex justify-between border-b pb-1"
            >
              <span>{cookie.name}</span>
              <span>
                {cookie.totalSold} uds (${cookie.totalRevenue.toFixed(2)})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
