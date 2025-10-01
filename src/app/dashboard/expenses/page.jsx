"use client";

import { useEffect, useState } from "react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    id: null,
    description: "",
    amount: "",
    type: "Fijo",
  });

  // cargar gastos
  useEffect(() => {
    async function fetchExpenses() {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data);
    }
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setForm({ id: null, description: "", amount: "", type: "Fijo" });
    setIsEdit(false);
    setIsOpen(true);
  };

  const openEditModal = (expense) => {
    setForm(expense);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/expenses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const newExpense = await res.json();
      if (isEdit) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === newExpense.id ? newExpense : e))
        );
      } else {
        setExpenses([newExpense, ...expenses]);
      }
      setIsOpen(false);
    } else {
      console.error("❌ Error guardando gasto:", await res.json());
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este gasto?")) return;

    const res = await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Gastos</h1>
        <button
          onClick={openAddModal}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + Agregar Gasto
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-pink-100 text-left font-semibold">
              <th className="p-3 border-b">Descripción</th>
              <th className="p-3 border-b">Monto</th>
              <th className="p-3 border-b">Tipo</th>
              <th className="p-3 border-b">Fecha</th>
              <th className="p-3 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-pink-50">
                <td className="p-3 border-b">{e.description}</td>
                <td className="p-3 border-b font-semibold text-pink-600">
                  ${Number(e.amount).toFixed(2)}
                </td>
                <td className="p-3 border-b">
                  <span className="px-2 py-1 bg-pink-100 rounded-lg text-xs text-pink-700 font-medium">
                    {e.type}
                  </span>
                </td>
                <td className="p-3 border-b">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 border-b flex gap-2">
                  <button
                    onClick={() => openEditModal(e)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md">
            <h2 className="text-xl text-black font-bold mb-4">
              {isEdit ? "Editar Gasto" : "Agregar Gasto"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="description"
                placeholder="Descripción"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 border rounded text-gray-800 placeholder-gray-400"
                required
              />
              <input
                type="number"
                step="0.01"
                name="amount"
                placeholder="Monto"
                value={form.amount}
                onChange={handleChange}
                className="w-full p-2 border rounded text-gray-800 placeholder-gray-400"
                required
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full text-black p-2 border rounded"
                required
              >
                <option value="">Selecciona categoría</option>
                <option value="operativo">Operativo</option>
                <option value="marketing">Marketing</option>
                <option value="infraestructura">Infraestructura</option>
                <option value="per-cookie">Per-Cookie</option>
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
