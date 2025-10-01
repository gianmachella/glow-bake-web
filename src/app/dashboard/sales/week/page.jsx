"use client";

import { useEffect, useState } from "react";

export default function WeeklySalesPage() {
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch("/api/sales/week");
        if (!res.ok) throw new Error("Error fetching weekly sales");
        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  if (loading) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading Sales...</p>
      </section>
    );
  }

  if (!sales) {
    return <p className="text-center text-gray-600">No hay ventas.</p>;
  }

  return (
    <section className="w-full min-h-screen px-6 py-16 bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-10 text-center">
          Weekly Sales 📅
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["Thursday", "Friday", "Saturday"].map((day) => (
            <div
              key={day}
              className="bg-white shadow-lg rounded-2xl p-6 border border-pink-100"
            >
              <h2 className="text-2xl font-bold text-pink-600 mb-4">{day}</h2>
              <p className="text-lg font-semibold text-gray-800 mb-2">
                Orders: {sales[day]?.totalOrders || 0}
              </p>

              {Object.keys(sales[day]?.cookies || {}).length === 0 ? (
                <p className="text-gray-500">No hay ventas.</p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {Object.entries(sales[day].cookies).map(([cookie, qty]) => (
                    <li
                      key={cookie}
                      className="flex justify-between text-gray-700"
                    >
                      <span>{cookie}</span>
                      <span className="font-medium text-pink-600">× {qty}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-lg font-bold text-gray-900">
                Total Cookies: {sales[day]?.totalCookies || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
