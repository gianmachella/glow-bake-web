"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import Swal from "sweetalert2";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load customers
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        setCustomers(data);
      } catch {
        Swal.fire("Error", "Could not load customers", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setForm({
      id: null,
      name: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const openEditModal = (customer) => {
    setForm(customer);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch("/api/customers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      const newCustomer = await res.json();
      if (isEdit) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === newCustomer.id ? newCustomer : c))
        );
        Swal.fire("Updated!", "Customer updated successfully", "success");
      } else {
        setCustomers([newCustomer, ...customers]);
        Swal.fire("Created!", "Customer added successfully", "success");
      }

      setIsOpen(false);
    } catch {
      Swal.fire("Error", "Could not save customer", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete customer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Delete failed");

      setCustomers(customers.filter((c) => c.id !== id));
      Swal.fire("Deleted!", "Customer removed successfully", "success");
    } catch {
      Swal.fire("Error", "Could not delete customer", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-pink-600">Customers</h1>
        <button
          onClick={openAddModal}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl shadow-md font-medium transition"
        >
          + Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-pink-100 to-pink-200 text-left font-semibold text-pink-700">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Address</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-pink-50/70 transition"
              >
                <td className="p-4 border-b border-gray-100">
                  <span className="font-medium text-gray-900">
                    {c.name} {c.lastName}
                  </span>
                </td>
                <td className="p-4 border-b border-gray-100">{c.email}</td>
                <td className="p-4 border-b border-gray-100">{c.phone}</td>
                <td className="p-4 border-b border-gray-100">{c.address}</td>
                <td className="p-4 border-b border-gray-100 flex gap-3 justify-center">
                  <button
                    onClick={() => openEditModal(c)}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs shadow"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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
              <h2 className="text-2xl font-bold mb-6 text-pink-600">
                {isEdit ? "Edit Customer" : "Add Customer"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="First Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={form.address || ""}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
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
