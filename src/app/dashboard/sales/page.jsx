"use client";

import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchSales({ reset = false } = {}) {
    try {
      const cursor = reset ? null : nextCursor;
      const url = cursor ? `/api/sales?cursor=${cursor}` : "/api/sales";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error fetching sales");
      const { data, nextCursor: newCursor } = await res.json();
      setSales((prev) => (reset || !cursor ? data : [...prev, ...data]));
      setNextCursor(newCursor);
    } catch (err) {
      Swal.fire("Error", "Could not fetch sales", "error");
    } finally {
      setLoadingPage(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchSales({ reset: true });
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchSales();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete sale?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/sales?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        Swal.fire("Deleted!", "Sale deleted successfully", "success");
        fetchSales({ reset: true });
      } else {
        Swal.fire("Error", "Could not delete sale", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Unexpected error deleting sale", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 px-6 py-16">
      <Loading isVisible={loadingPage || loadingAction} />

      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-pink-600 mb-10 text-center"
        >
          Sales History
        </motion.h1>

        {sales.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">
            No sales recorded yet.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="overflow-x-auto bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border border-pink-100"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-pink-100 to-pink-200 text-left text-sm font-semibold text-pink-700">
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Items</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, idx) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="text-sm text-gray-800 hover:bg-pink-50/60 transition-colors"
                  >
                    <td className="p-4 border-b border-gray-100">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 border-b border-gray-100">
                      {sale.customer?.name} {sale.customer?.lastName}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-gray-500">
                      {sale.customer?.email}
                    </td>
                    <td className="p-4 border-b border-gray-100">
                      <ul className="list-disc list-inside space-y-1">
                        {sale.items.map((item) => (
                          <li key={item.id} className="text-gray-700">
                            <span className="font-medium text-pink-600">
                              {item.cookie?.name}
                            </span>{" "}
                            × {item.quantity}{" "}
                            <span className="text-gray-500">
                              (${item.price.toFixed(2)} each)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 border-b border-gray-100 font-bold text-right text-pink-600">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-right">
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs shadow hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {nextCursor && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white rounded-xl shadow font-medium transition"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
