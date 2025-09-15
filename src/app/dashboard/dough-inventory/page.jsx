"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import CustomSelect from "@/components/CustomSelect";

export default function DoughInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [cookies, setCookies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ cookieId: "", quantity: "" });

  // cargar inventario y cookies
  useEffect(() => {
    async function fetchData() {
      const [invRes, cookiesRes] = await Promise.all([
        fetch("/api/dough-inventory"),
        fetch("/api/cookies"),
      ]);
      setInventory(await invRes.json());
      setCookies(await cookiesRes.json());
    }
    fetchData();
  }, []);

  const cookieOptions = cookies.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const openModal = () => {
    setForm({ cookieId: "", quantity: "" });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/dough-inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cookieId: form.cookieId,
        quantity: parseInt(form.quantity),
      }),
    });

    if (res.ok) {
      const newBatch = await res.json();
      setInventory([newBatch, ...inventory]);
      setIsOpen(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-yellow-700">
          Inventario de Masas
        </h1>
        <button
          onClick={openModal}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl shadow-md font-medium transition"
        >
          + Registrar Masa
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white/90 rounded-2xl shadow-lg border border-yellow-100">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-left font-semibold text-yellow-700">
              <th className="p-4">Cookie</th>
              <th className="p-4">Cantidad de masas</th>
              <th className="p-4">Galletas disponibles</th>
              <th className="p-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((dough, idx) => {
              const isLow = dough.available < 3;
              return (
                <motion.tr
                  key={dough.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`transition ${
                    isLow ? "bg-red-50/70" : "hover:bg-yellow-50/70"
                  }`}
                >
                  <td className="p-4 border-b border-gray-100">
                    {dough.cookie.name}
                  </td>
                  <td className="p-4 border-b border-gray-100">
                    {dough.quantity}
                  </td>
                  <td
                    className={`p-4 border-b border-gray-100 font-semibold ${
                      isLow ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    {dough.available}
                  </td>
                  <td className="p-4 border-b border-gray-100">
                    {new Date(dough.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-6 text-yellow-700">
                Registrar Masa Nueva
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cookie
                  </label>
                  <CustomSelect
                    options={cookieOptions}
                    value={form.cookieId}
                    onChange={(val) => setForm({ ...form, cookieId: val })}
                    placeholder="Seleccione cookie"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cantidad de masas
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Ej: 3"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cada masa equivale a 8 galletas
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
