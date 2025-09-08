"use client";

import { useEffect, useState } from "react";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) throw new Error("Error fetching sales");
        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading sales...</p>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-pink-50 px-6 py-12 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-700 mb-8">Sales History</h1>

        {sales.length === 0 ? (
          <p className="text-gray-800">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-pink-100 text-left text-sm font-semibold text-gray-700">
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Customer</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Cookie</th>
                  <th className="p-3 border-b">Qty</th>
                  <th className="p-3 border-b">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="text-sm text-gray-800 hover:bg-pink-50"
                  >
                    <td className="p-3 border-b">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 border-b">
                      {sale.customer?.name} {sale.customer?.lastName}
                    </td>
                    <td className="p-3 border-b">{sale.customer?.email}</td>
                    <td className="p-3 border-b">{sale.cookie?.name}</td>
                    <td className="p-3 border-b">{sale.quantity}</td>
                    <td className="p-3 border-b font-semibold text-pink-600">
                      ${sale.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
