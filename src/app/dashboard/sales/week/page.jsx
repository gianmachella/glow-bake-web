"use client";

import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import Swal from "sweetalert2";

export default function WeeklySalesPage() {
  const [sales, setSales] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales/week");
      if (!res.ok) throw new Error("Error fetching weekly sales");
      const data = await res.json();
      setSales(data);
    } catch (err) {
      Swal.fire("Error", "Could not load weekly sales", "error");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleMarkAsBaked = async (day) => {
    const result = await Swal.fire({
      title: `Mark ${day} as baked?`,
      text: "This will reduce frozen stock according to the sales of that day.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, confirm",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/dough-inventory/bake-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day }),
      });

      if (res.ok) {
        Swal.fire("Updated!", "Frozen stock adjusted successfully", "success");
        fetchSales();
      } else {
        Swal.fire("Error", "Could not update dough inventory", "error");
      }
    } catch {
      Swal.fire("Error", "Unexpected error updating dough inventory", "error");
    }
  };

  return (
    <section className="w-full min-h-screen px-6 py-16 bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <Loading isVisible={loadingPage} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-10 text-center">
          Weekly Sales 📅
        </h1>

        {!sales ? (
          <p className="text-center text-gray-600">No sales recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {["Thursday", "Friday", "Saturday"].map((day) => (
              <div
                key={day}
                className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-pink-100"
              >
                <h2 className="text-2xl font-bold text-pink-600 mb-4">{day}</h2>

                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Orders: {sales[day]?.totalOrders || 0}
                </p>

                {Object.keys(sales[day]?.cookies || {}).length === 0 ? (
                  <p className="text-gray-500">No sales for this day.</p>
                ) : (
                  <ul className="space-y-2 mb-4">
                    {Object.entries(sales[day].cookies).map(([cookie, qty]) => (
                      <li
                        key={cookie}
                        className="flex justify-between text-gray-700"
                      >
                        <span>{cookie}</span>
                        <span className="font-medium text-pink-600">
                          × {qty}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-lg font-bold text-gray-900 mb-4">
                  Total Cookies: {sales[day]?.totalCookies || 0}
                </p>

                <button
                  onClick={() => handleMarkAsBaked(day)}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl shadow-md font-medium transition"
                >
                  Mark as Baked
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
