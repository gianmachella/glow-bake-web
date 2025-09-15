"use client";

import { useEffect, useState } from "react";

import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchSales() {
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
  }

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar venta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/sales?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        Swal.fire("Eliminada ✅", "La venta fue eliminada.", "success");
        fetchSales();
      } else {
        Swal.fire("Error", "No se pudo eliminar la venta.", "error");
      }
    } catch (err) {
      console.error("❌ Error al eliminar venta:", err);
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  if (loading) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading Sales...</p>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-pink-600 mb-10 text-center"
        >
          Sales History 📊
        </motion.h1>

        {sales.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">No sales yet.</p>
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
                              (${item.price.toFixed(2)} c/u)
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
                        className="text-xs text-red-600 hover:underline"
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
      </div>
    </section>
  );
}
