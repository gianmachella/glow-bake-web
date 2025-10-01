"use client";

import { useEffect, useState } from "react";

import CustomSelect from "@/components/CustomSelect";
import { useParams } from "next/navigation";

export default function CookieIngredientsPage() {
  const { cookieId } = useParams();
  const [cookie, setCookie] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [baseDoughs, setBaseDoughs] = useState([]);
  const [selectedBaseDough, setSelectedBaseDough] = useState("");

  const [selected, setSelected] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");

  // 🔄 cargar datos
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/cookies/${cookieId}`);
      const data = await res.json();
      setCookie(data);

      const ingRes = await fetch("/api/ingredients");
      setIngredients(await ingRes.json());

      const doughRes = await fetch("/api/base-doughs");
      const doughData = await doughRes.json();
      setBaseDoughs(doughData);

      // 👇 si la cookie ya tiene una receta, preseleccionamos la masa base
      if (data?.recipes?.length > 0) {
        setSelectedBaseDough(data.recipes[0].baseDoughId);
      }
    }
    fetchData();
  }, [cookieId]);

  // ➕ agregar ingrediente
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!selectedBaseDough)
      return alert("Debes seleccionar una masa base primero");

    const res = await fetch(`/api/cookies/${cookieId}/ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseDoughId: selectedBaseDough,
        ingredientId: selected,
        quantityUsed: parseFloat(qty),
        unit,
      }),
    });

    if (res.ok) {
      const cookieRes = await fetch(`/api/cookies/${cookieId}`);
      const updatedCookie = await cookieRes.json();
      setCookie(updatedCookie);

      setSelected("");
      setQty("");
      setUnit("");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`Error: ${err.error || "No se pudo agregar ingrediente"}`);
    }
  };

  // ❌ eliminar ingrediente
  const handleDeleteIngredient = async (ingredientId) => {
    const res = await fetch(
      `/api/cookies/${cookieId}/ingredients/${ingredientId}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      const cookieRes = await fetch(`/api/cookies/${cookieId}`);
      setCookie(await cookieRes.json());
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`Error: ${err.error || "No se pudo eliminar ingrediente"}`);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 text-gray-900">
      <h1 className="text-3xl font-extrabold text-pink-600 mb-6">
        {cookie?.name} – Ingredientes
      </h1>

      {/* Selección de masa base */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow border">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Seleccionar Masa Base
        </label>
        <CustomSelect
          value={selectedBaseDough}
          onChange={setSelectedBaseDough}
          placeholder="🥖 Elige una masa base..."
          options={baseDoughs.map((dough) => ({
            value: dough.id,
            label: dough.name,
          }))}
        />
      </div>

      {/* Mostrar masa base y sus ingredientes */}
      <div className="space-y-6">
        {cookie?.recipes?.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white p-6 rounded-2xl shadow border border-pink-100"
          >
            <h2 className="text-lg font-bold text-pink-600 mb-3">
              Masa base: {recipe.baseDough?.name}
            </h2>

            <ul className="space-y-2">
              {recipe.ingredients.map((ri) => (
                <li
                  key={ri.id}
                  className="flex justify-between items-center bg-pink-50 px-4 py-2 rounded-lg shadow-sm border border-pink-100"
                >
                  <span className="font-medium text-gray-800">
                    {ri.ingredient.name} – {ri.quantityUsed}{" "}
                    {ri.ingredient.unitType}
                  </span>
                  <button
                    onClick={() => handleDeleteIngredient(ri.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 shadow"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Formulario para agregar ingrediente */}
      {selectedBaseDough && (
        <form
          onSubmit={handleAddIngredient}
          className="mt-6 flex flex-wrap gap-3 bg-white p-6 rounded-2xl shadow border"
        >
          {/* Ingrediente */}
          <div className="flex-1 min-w-[200px]">
            <CustomSelect
              value={selected}
              onChange={setSelected}
              placeholder="🍪 Select ingredient..."
              options={ingredients.map((ing) => ({
                value: ing.id,
                label: `${ing.name} (${ing.unitType})`,
              }))}
            />
          </div>

          {/* Cantidad */}
          <input
            type="number"
            placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-28 px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          />

          {/* Unidad */}
          <div className="w-36">
            <CustomSelect
              value={unit}
              onChange={setUnit}
              placeholder="Unidad"
              options={[
                { value: "g", label: "Gramos (g)" },
                { value: "kg", label: "Kilogramos (kg)" },
                { value: "ml", label: "Mililitros (ml)" },
                { value: "L", label: "Litros (L)" },
                { value: "oz", label: "Onzas (oz)" },
                { value: "lb", label: "Libras (lb)" },
                { value: "cup", label: "Tazas (cup)" },
                { value: "tbsp", label: "Cucharadas (tbsp)" },
                { value: "tsp", label: "Cucharaditas (tsp)" },
                { value: "unidad", label: "Unidad" },
              ]}
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="px-6 py-2 rounded-xl font-medium bg-pink-500 hover:bg-pink-600 text-white shadow transition"
          >
            ➕ Add
          </button>
        </form>
      )}
    </div>
  );
}
