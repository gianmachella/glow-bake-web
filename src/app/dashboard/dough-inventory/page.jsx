"use client";

import { useEffect, useState } from "react";

import CustomSelect from "@/components/CustomSelect";

export default function CookieIngredientsForm({ cookieId }) {
  const [ingredients, setIngredients] = useState([]);
  const [baseDoughs, setBaseDoughs] = useState([]);
  const [form, setForm] = useState({
    ingredientId: "",
    quantityUsed: "",
    unitType: "",
    baseDoughId: "",
  });

  useEffect(() => {
    async function fetchData() {
      const ingRes = await fetch("/api/ingredients");
      setIngredients(await ingRes.json());

      const res = await fetch("/api/doughs");
      setBaseDoughs(await doughRes.json());
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/cookies/${cookieId}/ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Ingrediente agregado!");
      setForm({
        ingredientId: "",
        quantityUsed: "",
        unitType: "",
        baseDoughId: "",
      });
    } else {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-xl shadow"
    >
      {/* Selección de masa base */}
      <div>
        <label className="block text-sm font-medium mb-1">Masa base</label>
        <CustomSelect
          options={baseDoughs.map((d) => ({ value: d.id, label: d.name }))}
          value={form.baseDoughId}
          onChange={(val) => setForm({ ...form, baseDoughId: val })}
          placeholder="Seleccione masa base"
        />
      </div>

      {/* Selección de ingrediente */}
      <div>
        <label className="block text-sm font-medium mb-1">Ingrediente</label>
        <CustomSelect
          options={ingredients.map((i) => ({ value: i.id, label: i.name }))}
          value={form.ingredientId}
          onChange={(val) => setForm({ ...form, ingredientId: val })}
          placeholder="Seleccione ingrediente"
        />
      </div>

      {/* Cantidad */}
      <div>
        <label className="block text-sm font-medium mb-1">Cantidad usada</label>
        <input
          type="number"
          value={form.quantityUsed}
          onChange={(e) => setForm({ ...form, quantityUsed: e.target.value })}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Unidad */}
      <div>
        <label className="block text-sm font-medium mb-1">Unidad</label>
        <input
          type="text"
          value={form.unitType}
          onChange={(e) =>
            setForm({ ...form, unitType: e.target.value.toUpperCase() })
          }
          className="w-full border p-2 rounded"
          placeholder="Ej: G, KG, OZ"
        />
      </div>

      <button
        type="submit"
        className="bg-pink-500 text-white px-5 py-2 rounded-lg hover:bg-pink-600"
      >
        Guardar
      </button>
    </form>
  );
}
