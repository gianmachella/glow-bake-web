"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import CustomSelect from "@/components/CustomSelect";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [form, setForm] = useState({
    id: null,
    description: "",
    amount: "",
    type: "",
  });

  const categoryOptions = [
    { value: "Operational", label: "Operational" },
    { value: "Marketing", label: "Marketing" },
    { value: "Infrastructure", label: "Infrastructure" },
    { value: "Per-Cookie", label: "Per-Cookie" },
  ];

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const res = await fetch("/api/expenses");
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        Swal.fire("Error", "Could not fetch expenses", "error");
      } finally {
        setLoadingPage(false);
      }
    }
    fetchExpenses();
  }, []);

  const openAddModal = () => {
    setForm({ id: null, description: "", amount: "", type: "" });
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
    setLoadingAction(true);
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch("/api/expenses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setExpenses((prev) =>
            prev.map((exp) => (exp.id === saved.id ? saved : exp))
          );
          Swal.fire("Updated!", "Expense updated successfully", "success");
        } else {
          setExpenses([saved, ...expenses]);
          Swal.fire("Created!", "Expense added successfully", "success");
        }
        setIsOpen(false);
      } else {
        Swal.fire("Error", "Could not save expense", "error");
      }
    } catch {
      Swal.fire("Error", "Unexpected error saving expense", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete expense?",
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
      const res = await fetch("/api/expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== id));
        Swal.fire("Deleted!", "Expense deleted successfully", "success");
      } else {
        Swal.fire("Error", "Could not delete expense", "error");
      }
    } catch {
      Swal.fire("Error", "Unexpected error deleting expense", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {loadingPage && <Loading isVisible={true} />}
      {loadingAction && <Loading isVisible={true} />}

      {!loadingPage && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-pink-600">Expenses</h1>
            <button
              onClick={openAddModal}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl shadow-md font-medium transition"
            >
              + Add Expense
            </button>
          </div>

          <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100">
            <table className="w-full text-sm text-gray-800">
              <thead>
                <tr className="bg-gradient-to-r from-pink-100 to-pink-200 text-left font-semibold text-pink-700">
                  <th className="p-4">Description</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e, idx) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-pink-50/70 transition"
                  >
                    <td className="p-4 border-b border-gray-100">
                      {e.description}
                    </td>
                    <td className="p-4 border-b border-gray-100 font-semibold text-pink-600">
                      ${Number(e.amount).toFixed(2)}
                    </td>
                    <td className="p-4 border-b border-gray-100">
                      <span className="px-2 py-1 bg-pink-100 rounded-lg text-xs text-pink-700 font-medium">
                        {e.type}
                      </span>
                    </td>
                    <td className="p-4 border-b border-gray-100">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 border-b border-gray-100 flex gap-3 justify-center">
                      <button
                        onClick={() => openEditModal(e)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs shadow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs shadow"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

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
              <h2 className="text-2xl font-bold mb-6 text-pink-600">
                {isEdit ? "Edit Expense" : "Add Expense"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
                <CustomSelect
                  options={categoryOptions}
                  value={form.type}
                  onChange={(val) => setForm({ ...form, type: val })}
                  placeholder="Select category..."
                />
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600"
                  >
                    Save
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
