"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import CustomSelect from "@/components/CustomSelect";
import Swal from "sweetalert2";

export default function DoughsPage() {
  const [doughs, setDoughs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    ingredients: [],
  });
  const [allIngredients, setAllIngredients] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const doughRes = await fetch("/api/base-doughs");
        const doughJson = await doughRes.json().catch(() => []);
        setDoughs(Array.isArray(doughJson) ? doughJson : []);

        const ingRes = await fetch("/api/ingredients");
        const ingJson = await ingRes.json().catch(() => []);
        setAllIngredients(Array.isArray(ingJson) ? ingJson : []);
      } catch (err) {
        console.error("❌ Error fetchData:", err);
        setDoughs([]);
        setAllIngredients([]);
      }
    }
    fetchData();
  }, []);

  const openAddModal = () => {
    setForm({ id: null, name: "", ingredients: [] });
    setIsEdit(false);
    setIsOpen(true);
  };

  const openEditModal = (dough) => {
    setForm({
      id: dough.id,
      name: dough.name,
      ingredients: dough.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantityUsed: ing.quantityUsed,
        unit: ing.ingredient.unitType || "",
      })),
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch("/api/base-doughs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setDoughs((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
        } else {
          setDoughs([saved, ...doughs]);
        }
        setIsOpen(false);

        Swal.fire({
          title: isEdit ? "Masa actualizada" : "Masa creada",
          text: isEdit
            ? "La masa base fue actualizada con éxito"
            : "La masa base fue creada con éxito",
          icon: "success",
          confirmButtonColor: "#ec4899", // rosa
        });
      } else {
        const err = await res.text();
        Swal.fire({
          title: "Error",
          text: `No se pudo guardar la masa: ${err}`,
          icon: "error",
          confirmButtonColor: "#ef4444", // rojo
        });
      }
    } catch (error) {
      console.error("❌ Error guardando masa:", error);
      Swal.fire({
        title: "Error inesperado",
        text: "Ocurrió un problema al guardar la masa",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta masa base será eliminada junto con sus ingredientes",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // rojo
      cancelButtonColor: "#6b7280", // gris
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/base-doughs", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          setDoughs((prev) => prev.filter((d) => d.id !== id));
          Swal.fire({
            title: "Eliminado",
            text: "La masa base fue eliminada con éxito",
            icon: "success",
            confirmButtonColor: "#ec4899", // rosa
          });
        } else {
          const err = await res.text();
          Swal.fire({
            title: "Error",
            text: `No se pudo eliminar la masa: ${err}`,
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      } catch (error) {
        console.error("❌ Error eliminando masa:", error);
        Swal.fire({
          title: "Error inesperado",
          text: "Ocurrió un problema al eliminar la masa",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };
  const addIngredientToForm = () => {
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { ingredientId: "", quantityUsed: 0, unit: "" },
      ],
    }));
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...form.ingredients];
    newIngredients[index][field] = value;
    setForm({ ...form, ingredients: newIngredients });
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-pink-600">Masas Base</h1>
        <button
          onClick={openAddModal}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl shadow-md font-medium transition"
        >
          + Agregar Masa
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-pink-100 to-pink-200 text-left font-semibold text-pink-700">
              <th className="p-4">Nombre</th>
              <th className="p-4">Ingredientes</th>
              <th className="p-4">Costo Total</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(doughs) && doughs.length > 0 ? (
              doughs.map((d, idx) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-pink-50/70 transition"
                >
                  <td className="p-4 border-b border-gray-100 font-medium text-gray-900">
                    {d.name}
                  </td>
                  <td className="p-4 border-b border-gray-100">
                    <ul className="list-disc pl-4 space-y-1">
                      {d.ingredients?.map((ing) => (
                        <li key={ing.id}>
                          {ing.ingredient.name} – {ing.quantityUsed}{" "}
                          {ing.ingredient.unitType} (${ing.cost.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-4 border-b border-gray-100 font-semibold text-pink-600">
                    ${d.totalCost.toFixed(2)}
                  </td>
                  <td className="p-4 border-b border-gray-100 flex gap-3 justify-center">
                    <button
                      onClick={() => openEditModal(d)}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs shadow"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs shadow"
                    >
                      Eliminar
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No hay masas creadas todavía
                </td>
              </tr>
            )}
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
              className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-pink-600">
                {isEdit ? "Editar Masa" : "Agregar Masa"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la masa"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border text-black rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />

                {/* Ingredientes dinámicos */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Ingredientes
                  </h3>
                  {form.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <CustomSelect
                        options={allIngredients.map((a) => ({
                          value: a.id,
                          label: `${a.name} (${a.unitType})`,
                        }))}
                        value={ing.ingredientId}
                        onChange={(val) =>
                          updateIngredient(i, "ingredientId", val)
                        }
                        placeholder="Seleccionar ingrediente..."
                      />
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={ing.quantityUsed}
                        onChange={(e) =>
                          updateIngredient(
                            i,
                            "quantityUsed",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-28 p-2 border border-gray-300 rounded text-black focus:ring-2 focus:ring-pink-400"
                      />

                      <select
                        value={ing.unit || ""}
                        onChange={(e) =>
                          updateIngredient(i, "unit", e.target.value)
                        }
                        className="w-32 p-2 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-pink-400"
                      >
                        <option value="">Unidad</option>
                        <option value="g">Gramos (g)</option>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="L">Litros (L)</option>
                        <option value="oz">Onzas (oz)</option>
                        <option value="lb">Libras (lb)</option>
                        <option value="cup">Tazas (cup)</option>
                        <option value="tbsp">Cucharadas (tbsp)</option>
                        <option value="tsp">Cucharaditas (tsp)</option>
                        <option value="unidad">Unidad</option>
                      </select>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addIngredientToForm}
                    className="text-pink-500 text-sm font-medium hover:underline"
                  >
                    + Agregar Ingrediente
                  </button>
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
    </div>
  );
}
