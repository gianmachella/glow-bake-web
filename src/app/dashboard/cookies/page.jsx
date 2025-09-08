"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CookiesPage() {
  const [cookies, setCookies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    shortDescription: "",
    description: "",
    ingredients: "",
    files: [],
  });

  // cargar cookies
  useEffect(() => {
    async function fetchCookies() {
      const res = await fetch("/api/cookies");
      const data = await res.json();
      setCookies(data);
    }
    fetchCookies();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // agregar cookie
  const handleAdd = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("shortDescription", form.shortDescription);
    formData.append("description", form.description);
    formData.append("ingredients", form.ingredients);

    if (form.files && form.files.length > 0) {
      for (let i = 0; i < form.files.length; i++) {
        formData.append("images", form.files[i]);
      }
    }

    const res = await fetch("/api/cookies", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newCookie = await res.json();
      setCookies([...cookies, newCookie]);
      setIsOpen(false);
      setForm({
        name: "",
        price: "",
        shortDescription: "",
        description: "",
        ingredients: "",
        files: [],
      });
    } else {
      console.error("❌ Error al guardar:", await res.json());
    }
  };

  // eliminar cookie
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta cookie?")) return;

    const res = await fetch("/api/cookies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setCookies(cookies.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-pink-600">Cookies List</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium shadow transition"
        >
          + Agregar Cookie
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cookies.map((cookie, i) => (
          <motion.div
            key={cookie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col"
          >
            {/* Imagen */}
            <div className="w-full h-40 bg-pink-100 flex items-center justify-center">
              {cookie.image ? (
                <img
                  src={cookie.image}
                  alt={cookie.name}
                  className="h-full object-contain"
                />
              ) : (
                <span className="text-6xl">🍪</span>
              )}
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-gray-800">{cookie.name}</h2>
              <p className="text-sm text-gray-500 flex-grow line-clamp-3">
                {cookie.shortDescription || cookie.description}
              </p>
              <p className="text-pink-600 font-bold text-lg mt-2">
                ${cookie.price}
              </p>

              {/* Botones */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleDelete(cookie.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Agregar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-pink-100/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-pink-600">
                Agregar Cookie
              </h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Precio"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, files: e.target.files })}
                  className="w-full p-2 border rounded"
                />

                {/* preview imágenes */}
                {form.files && (
                  <div className="flex gap-3 mt-2">
                    {Array.from(form.files).map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="h-20 w-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <textarea
                  name="shortDescription"
                  placeholder="Descripción corta"
                  value={form.shortDescription}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  name="description"
                  placeholder="Descripción"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  name="ingredients"
                  placeholder="Ingredientes"
                  value={form.ingredients}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600"
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
