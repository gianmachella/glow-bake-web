"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import DashboardCookieCard from "@/components/DashboardCookieCard";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";
import ToggleSwitch from "@/components/ToggleSwitch";

export default function CookiesPage() {
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    shortDescription: "",
    description: "",
    ingredients: "",
    visible: true,
    new: false, // 👈 local state
    files: [],
  });

  // 🔄 Load cookies
  useEffect(() => {
    async function fetchCookies() {
      try {
        const res = await fetch("/api/cookies");
        if (!res.ok) throw new Error("Failed to fetch cookies");
        const data = await res.json();
        setCookies(data);
      } catch (err) {
        Swal.fire("Error", "Could not load cookies", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchCookies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openAddModal = () => {
    setForm({
      id: null,
      name: "",
      price: "",
      shortDescription: "",
      description: "",
      ingredients: "",
      visible: true,
      new: false,
      files: [],
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const openEditModal = (cookie) => {
    setForm({
      id: cookie.id,
      name: cookie.name,
      price: cookie.price,
      shortDescription: cookie.shortDescription || "",
      description: cookie.description || "",
      ingredients: cookie.ingredients || "",
      visible: cookie.visible,
      new: cookie.isNew || false,
      files: [],
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // ⚡ translate "new" → "isNew"
    const payload = { ...form, isNew: form.new };
    delete payload.new;

    Object.entries(payload).forEach(([key, value]) => {
      if (key !== "files") formData.append(key, value);
    });

    if (form.files?.length > 0) {
      for (let i = 0; i < Math.min(form.files.length, 2); i++) {
        formData.append("images", form.files[i]);
      }
    }

    const res = await fetch("/api/cookies", { method: "POST", body: formData });
    if (res.ok) {
      const newCookie = await res.json();
      setCookies([...cookies, newCookie]);
      setIsOpen(false);
      Swal.fire("Success", "Cookie created successfully!", "success");
    } else {
      Swal.fire("Error", "Could not create cookie", "error");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    const payload = { ...form, isNew: form.new };
    delete payload.new;

    Object.entries(payload).forEach(([key, value]) => {
      if (key !== "files") formData.append(key, value);
    });

    if (form.files?.length > 0) {
      for (let i = 0; i < Math.min(form.files.length, 2); i++) {
        formData.append("images", form.files[i]);
      }
    }

    const res = await fetch("/api/cookies", { method: "PUT", body: formData });
    if (res.ok) {
      const updated = await res.json();
      setCookies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setIsOpen(false);
      Swal.fire("Updated", "Cookie updated successfully!", "success");
    } else {
      Swal.fire("Error", "Could not update cookie", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete cookie?",
      text: "Do you want to hide it (soft delete) or delete permanently?",
      icon: "warning",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Soft Delete (Hide)",
      denyButtonText: "Hard Delete (Permanent)",
    });

    if (!result.isConfirmed && !result.isDenied) return;

    const soft = result.isConfirmed;

    const res = await fetch("/api/cookies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, soft }),
    });

    if (res.ok) {
      setCookies((prev) => prev.filter((c) => c.id !== id));
      Swal.fire(
        soft ? "Hidden!" : "Deleted!",
        soft
          ? "The cookie is now hidden (soft deleted)."
          : "The cookie was permanently deleted.",
        "success"
      );
    } else {
      Swal.fire("Error", "Could not delete cookie", "error");
    }
  };

  const handleToggleVisible = async (id, newVisible) => {
    const res = await fetch("/api/cookies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, visible: newVisible }),
    });
    if (res.ok) {
      setCookies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, visible: newVisible } : c))
      );
    }
  };

  const handleToggleNew = async (id, newIsNew) => {
    const res = await fetch("/api/cookies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isNew: newIsNew }),
    });
    if (res.ok) {
      setCookies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isNew: newIsNew } : c))
      );
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-white to-pink-100 rounded-2xl shadow-lg min-h-screen space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl text-black tracking-tight">
          Cookies Dashboard
        </h1>
        <button
          onClick={openAddModal}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg transition transform hover:scale-105"
        >
          + Add Cookie
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {cookies.map((cookie, i) => (
          <DashboardCookieCard
            key={cookie.id}
            cookie={cookie}
            index={i}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onToggleVisible={handleToggleVisible}
            onToggleNew={handleToggleNew}
          />
        ))}
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-pink-600">
                  {isEdit ? "Edit Cookie" : "Add Cookie"}
                </h2>

                {/* 🔘 Visibility switch */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {form.visible ? "Visible" : "Hidden"}
                  </span>
                  <ToggleSwitch
                    checked={form.visible}
                    onChange={(val) => setForm({ ...form, visible: val })}
                  />
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={isEdit ? handleEdit : handleAdd}
                className="space-y-5 text-gray-900"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="E.g: Nutella Cookie"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="E.g: 5.50"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleChange}
                    placeholder="Short description of the cookie"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Detailed description"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    rows={3}
                  />
                </div>

                {/* Upload images */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Images (max. 2)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setForm({
                        ...form,
                        files: Array.from(e.target.files).slice(0, 2),
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                  {/* Preview */}
                  <div className="flex gap-3 mt-3">
                    {form.files?.map((file, idx) => (
                      <div
                        key={idx}
                        className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* New switch */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {form.new ? "New" : "Not New"}
                  </span>
                  <ToggleSwitch
                    checked={form.new}
                    onChange={(val) => setForm({ ...form, new: val })}
                  />
                </div>

                {/* Footer */}
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
                    {isEdit ? "Save Changes" : "Create Cookie"}
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
