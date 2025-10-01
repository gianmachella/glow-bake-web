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
    packages: 1,
  });

  const unitOptions = [
    { value: "g", label: "Gramos (g)" },
    { value: "kg", label: "Kilogramos (kg)" },
    { value: "mg", label: "Miligramos (mg)" },
    { value: "ml", label: "Mililitros (ml)" },
    { value: "l", label: "Litros (L)" },
    { value: "oz", label: "Onzas (oz)" },
    { value: "lb", label: "Libras (lb)" },
    { value: "floz", label: "Onzas líquidas (fl oz)" },
    { value: "cup", label: "Tazas (cup)" },
    { value: "tbsp", label: "Cucharadas (tbsp)" },
    { value: "tsp", label: "Cucharaditas (tsp)" },
    { value: "pt", label: "Pintas (pt)" },
    { value: "qt", label: "Cuartos (qt)" },
    { value: "gal", label: "Galones (gal)" },
    { value: "unidad", label: "Unidad" },
    { value: "pack", label: "Paquete" },
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
      packages: 1,
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
        packages: parseInt(form.packages),
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

  // Cambiar paquetes y actualizar remaining
  const handlePackagesChange = async (id, action) => {
    const ingredient = ingredients.find((i) => i.id === id);
    if (!ingredient) return;

    let newPackages = ingredient.packages;
    let newRemaining = ingredient.remaining;

    if (action === "add") {
      newPackages = ingredient.packages + 1;
      newRemaining = ingredient.remaining + ingredient.unitQuantity;
    } else if (action === "remove" && ingredient.packages > 0) {
      newPackages = ingredient.packages - 1;
      newRemaining = ingredient.remaining - ingredient.unitQuantity;
    }

    const res = await fetch(`/api/ingredients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ingredient,
        packages: newPackages,
        remaining: newRemaining,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setIngredients((prev) =>
        prev.map((ing) => (ing.id === updated.id ? updated : ing))
      );
    }
  };

  const lowStock = ingredients.filter(
    (ing) => (ing.remaining / ing.unitQuantity) * 100 < 20
  );

  const exportCSV = () => {
    const header = "Nombre,Restante,Total,Unidad,Paquetes\n";
    const rows = lowStock
      .map(
        (ing) =>
          `${ing.name},${ing.remaining},${ing.unitQuantity},${ing.unitType},${ing.packages || 0}`
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

  const getBarColor = (percent) => {
    if (percent > 50) return "bg-green-500";
    if (percent > 35) return "bg-yellow-400";
    if (percent > 20) return "bg-yellow-500";
    return "bg-red-500";
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
              <th className="p-4">Nivel</th> {/* Nueva columna */}
              <th className="p-4">Paquetes</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => {
              const percent = Math.min(
                (ing.remaining / ing.unitQuantity) * 100,
                100
              );
              return (
                <motion.tr
                  key={ing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-pink-50/70 transition"
                >
                  <td className="p-4 border-b border-gray-100">{ing.name}</td>
                  <td className="p-4 border-b border-gray-100">
                    {ing.unitQuantity} {ing.unitType}
                  </td>
                  <td className="p-4 border-b border-gray-100 font-medium text-gray-700">
                    ${ing.price.toFixed(2)}
                  </td>
                  <td className="p-4 border-b border-gray-100">
                    {ing.remaining} {ing.unitType}
                  </td>
                  {/* Barra de nivel */}
                  <td className="p-4 border-b border-gray-100">
                    {percent <= 0 ? (
                      <span className="text-red-600 font-semibold">
                        Out of Stock
                      </span>
                    ) : (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`${getBarColor(percent)} h-3`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {percent.toFixed(0)}%
                        </span>
                      </>
                    )}
                  </td>

                  <td className="p-4 border-b border-gray-100 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => handlePackagesChange(ing.id, "remove")}
                        className="px-2 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        -
                      </button>
                      <span className="font-semibold">{ing.packages}</span>
                      <button
                        onClick={() => handlePackagesChange(ing.id, "add")}
                        className="px-2 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm"
                      >
                        +
                      </button>
                    </div>
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
                {/* Nombre */}
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

                {/* Cantidad total */}
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

                {/* Unidad */}
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

                {/* Precio */}
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

                {/* Restante */}
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

                {/* Paquetes (NUEVO) */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Paquetes
                  </label>
                  <input
                    type="number"
                    name="packages"
                    placeholder="Ej: 3"
                    value={form.packages}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                    min="0"
                  />
                </div>

                {/* Botones */}
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
                        {ing.packages > 0 && (
                          <span className="ml-2 text-purple-700 font-medium">
                            ({ing.packages} paquetes)
                          </span>
                        )}
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
    </div>
  );
}
