"use client";

import { useEffect, useState } from "react";

import CustomSelect from "@/components/CustomSelect";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";
import { useParams } from "next/navigation";

export default function CookieIngredientsPage() {
  const { cookieId } = useParams();
  const [cookie, setCookie] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [baseDoughs, setBaseDoughs] = useState([]);
  const [selectedBaseDough, setSelectedBaseDough] = useState("");
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");

  // 🔄 Load data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/cookies/${cookieId}`);
        const data = await res.json();
        setCookie(data);

        const ingRes = await fetch("/api/ingredients");
        setIngredients(await ingRes.json());

        const doughRes = await fetch("/api/base-doughs");
        const doughData = await doughRes.json();
        setBaseDoughs(doughData);

        // 👇 Preselect base dough if cookie already has recipe
        if (data?.recipes?.length > 0) {
          setSelectedBaseDough(data.recipes[0].baseDoughId);
        }
      } catch (err) {
        Swal.fire("Error", "Failed to load cookie data", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cookieId]);

  // ➕ Add ingredient
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!selectedBaseDough)
      return Swal.fire(
        "Warning",
        "Please select a base dough first",
        "warning"
      );

    try {
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
        Swal.fire("Success", "Ingredient added successfully!", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "Could not add ingredient", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  // ❌ Delete ingredient
  const handleDeleteIngredient = async (ingredientId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove the ingredient from the recipe.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `/api/cookies/${cookieId}/ingredients/${ingredientId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        const cookieRes = await fetch(`/api/cookies/${cookieId}`);
        setCookie(await cookieRes.json());
        Swal.fire("Deleted!", "Ingredient has been removed.", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "Could not delete ingredient", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 text-gray-900">
      <h1 className="text-3xl font-extrabold text-pink-600 mb-6">
        {cookie?.name} – Ingredients
      </h1>

      {/* Base dough selection */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow border">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Select Base Dough
        </label>
        <CustomSelect
          value={selectedBaseDough}
          onChange={setSelectedBaseDough}
          placeholder="🥖 Choose a base dough..."
          options={baseDoughs.map((dough) => ({
            value: dough.id,
            label: dough.name,
          }))}
        />
      </div>

      {/* Show base dough and its ingredients */}
      <div className="space-y-6">
        {cookie?.recipes?.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white p-6 rounded-2xl shadow border border-pink-100"
          >
            <h2 className="text-lg font-bold text-pink-600 mb-3">
              Base dough: {recipe.baseDough?.name}
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
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Form to add ingredient */}
      {selectedBaseDough && (
        <form
          onSubmit={handleAddIngredient}
          className="mt-6 flex flex-wrap gap-3 bg-white p-6 rounded-2xl shadow border"
        >
          {/* Ingredient */}
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

          {/* Quantity */}
          <input
            type="number"
            placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-28 px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          />

          {/* Unit */}
          <div className="w-36">
            <CustomSelect
              value={unit}
              onChange={setUnit}
              placeholder="Unit"
              options={[
                { value: "g", label: "Grams (g)" },
                { value: "kg", label: "Kilograms (kg)" },
                { value: "ml", label: "Milliliters (ml)" },
                { value: "L", label: "Liters (L)" },
                { value: "oz", label: "Ounces (oz)" },
                { value: "lb", label: "Pounds (lb)" },
                { value: "cup", label: "Cups (cup)" },
                { value: "tbsp", label: "Tablespoons (tbsp)" },
                { value: "tsp", label: "Teaspoons (tsp)" },
                { value: "unit", label: "Unit" },
              ]}
            />
          </div>

          {/* Button */}
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
