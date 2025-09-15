"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import CustomSelect from "@/components/CustomSelect";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    unitType: "",
    unitQuantity: "",
    price: "",
    remaining: "",
  });

  const unitOptions = [
    { value: "G", label: "Gramos (g)" },
    { value: "KG", label: "Kilogramos (kg)" },
    { value: "MG", label: "Miligramos (mg)" },
    { value: "ML", label: "Mililitros (ml)" },
    { value: "L", label: "Litros (L)" },
    { value: "OZ", label: "Onzas (oz)" },
    { value: "LB", label: "Libras (lb)" },
    { value: "FLOZ", label: "Onzas líquidas (fl oz)" },
    { value: "CUP", label: "Tazas (cup)" },
    { value: "TBSP", label: "Cucharadas (tbsp)" },
    { value: "TSP", label: "Cucharaditas (tsp)" },
    { value: "PT", label: "Pintas (pt)" },
    { value: "QT", label: "Cuartos (qt)" },
    { value: "GAL", label: "Galones (gal)" },
    { value: "UNIT", label: "Unidad" },
    { value: "PACK", label: "Paquete" },
  ];

  // cargar ingredientes
  useEffect(() => {
    async function fetchIngredients() {
      const res = await fetch("/api/ingredients");
      const data = await res.json();
      setIngredients(data);
    }
    fetchIngredients();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setForm({
      id: null,
      name: "",
      unitType: "",
      unitQuantity: "",
      price: "",
      remaining: "",
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const openEditModal = (ingredient) => {
    setForm(ingredient);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/ingredients/${form.id}` : "/api/ingredients";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        unitType: form.unitType,
        unitQuantity: parseFloat(form.unitQuantity),
        price: parseFloat(form.price),
        remaining: parseFloat(form.remaining),
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      if (isEdit) {
        setIngredients((prev) =>
          prev.map((ing) => (ing.id === updated.id ? updated : ing))
        );
      } else {
        setIngredients([updated, ...ingredients]);
      }
      setIsOpen(false);
    } else {
      console.error("❌ Error guardando ingrediente:", await res.json());
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este ingrediente?")) return;

    const res = await fetch(`/api/ingredients/${id}`, { method: "DELETE" });

    if (res.ok) {
      setIngredients(ingredients.filter((ing) => ing.id !== id));
    }
  };

  const lowStock = ingredients.filter(
    (ing) => (ing.remaining / ing.unitQuantity) * 100 < 20
  );

  const exportCSV = () => {
    const header = "Nombre,Restante,Total,Unidad\n";
    const rows = lowStock
      .map(
        (ing) =>
          `${ing.name},${ing.remaining},${ing.unitQuantity},${ing.unitType}`
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "lista_compras.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-pink-600">
          Inventario de Materiales
        </h1>
        <div className="flex gap-3">
          <button
            onClick={openAddModal}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl shadow-md font-medium transition"
          >
            + Agregar Ingrediente
          </button>
          <button
            onClick={() => setIsShoppingOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl shadow-md font-medium transition"
          >
            🛒 Lista de Compras
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-pink-100 to-pink-200 text-left font-semibold text-pink-700">
              <th className="p-4">Nombre</th>
              <th className="p-4">Contenido</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Restante</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => {
              const percent = (ing.remaining / ing.unitQuantity) * 100;
              return (
                <motion.tr
                  key={ing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`hover:bg-pink-50/70 transition ${
                    percent < 20 ? "bg-red-50" : ""
                  }`}
                >
                  <td className="p-4 border-b border-gray-100">{ing.name}</td>
                  <td className="p-4 border-b border-gray-100">
                    {ing.unitQuantity} {ing.unitType}
                  </td>
                  <td className="p-4 border-b border-gray-100 font-medium text-gray-700">
                    ${ing.price.toFixed(2)}
                  </td>
                  <td className="p-4 border-b border-gray-100 flex items-center gap-2">
                    {ing.remaining} {ing.unitType}
                    {percent < 20 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-medium">
                        Bajo stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openEditModal(ing)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs shadow hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(ing.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs shadow hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Lista de Compras */}
      <AnimatePresence>
        {isShoppingOpen && (
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
              className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg"
            >
              <h2 className="text-2xl font-bold mb-6 text-purple-600">
                🛒 Lista de Compras
              </h2>
              {lowStock.length === 0 ? (
                <p className="text-gray-600">✅ Todo está en buen nivel.</p>
              ) : (
                <ul className="space-y-2 mb-6">
                  {lowStock.map((ing) => (
                    <li
                      key={ing.id}
                      className="flex justify-between bg-purple-50 px-4 py-2 rounded-lg text-gray-800"
                    >
                      <span>{ing.name}</span>
                      <span className="text-sm text-gray-600">
                        {ing.remaining}/{ing.unitQuantity} {ing.unitType}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsShoppingOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
                </button>
                {lowStock.length > 0 && (
                  <button
                    onClick={exportCSV}
                    className="px-5 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600"
                  >
                    📤 Exportar CSV
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Crear/Editar Ingrediente */}
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
                {isEdit ? "Editar Ingrediente" : "Agregar Ingrediente"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ej: Harina"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cantidad total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="unitQuantity"
                    placeholder="Ej: 1000"
                    value={form.unitQuantity}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Unidad
                  </label>
                  <CustomSelect
                    options={unitOptions}
                    value={form.unitType}
                    onChange={(val) => setForm({ ...form, unitType: val })}
                    placeholder="Seleccione unidad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    placeholder="Ej: 3.50"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Restante
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="remaining"
                    placeholder="Ej: 800"
                    value={form.remaining}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
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
                    className="px-5 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600"
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
