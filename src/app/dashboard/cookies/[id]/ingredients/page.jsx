"use client";

import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import Swal from "sweetalert2";

export default function CookieIngredientsPage({ params }) {
  const { id } = params;
  const [cookie, setCookie] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [allBaseDoughs, setAllBaseDoughs] = useState([]);
  const [selectedBaseDough, setSelectedBaseDough] = useState("");
  const [newIngredient, setNewIngredient] = useState({
    ingredientId: "",
    quantityUsed: 0,
  });
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/cookies/${id}/ingredients`);
        if (!res.ok) throw new Error("Failed to load ingredients");
        const data = await res.json();
        setCookie(data.cookie);
        setIngredients(data.ingredients);

        const ingRes = await fetch("/api/ingredients");
        setAllIngredients(await ingRes.json());

        const doughRes = await fetch("/api/base-doughs");
        setAllBaseDoughs(await doughRes.json());
      } catch (err) {
        Swal.fire("Error", "Could not load data", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleAdd = async () => {
    if (
      !selectedBaseDough ||
      !newIngredient.ingredientId ||
      newIngredient.quantityUsed <= 0
    ) {
      Swal.fire(
        "Warning",
        "Please select a base dough and valid ingredient",
        "warning"
      );
      return;
    }

    try {
      const res = await fetch(`/api/cookies/${id}/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newIngredient,
          baseDoughId: selectedBaseDough,
        }),
      });

      if (!res.ok) throw new Error("Failed to add ingredient");
      const data = await res.json();
      setIngredients((prev) => [...prev, data]);
      setNewIngredient({ ingredientId: "", quantityUsed: 0 });

      Swal.fire("Success", "Ingredient added successfully", "success");
    } catch {
      Swal.fire("Error", "Could not add ingredient", "error");
    }
  };

  const handleDelete = async (ingredientId) => {
    const result = await Swal.fire({
      title: "Delete ingredient?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`/api/cookies/${id}/ingredients/${ingredientId}`, {
        method: "DELETE",
      });
      setIngredients((prev) => prev.filter((i) => i.id !== ingredientId));

      Swal.fire("Deleted!", "Ingredient removed successfully", "success");
    } catch {
      Swal.fire("Error", "Could not delete ingredient", "error");
    }
  };

  const handleUpdate = async (ingredientId) => {
    const quantityUsed = editing[ingredientId];
    if (!quantityUsed || quantityUsed <= 0) {
      Swal.fire("Warning", "Invalid quantity", "warning");
      return;
    }

    try {
      const res = await fetch(
        `/api/cookies/${id}/ingredients/${ingredientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantityUsed }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();

      setIngredients((prev) =>
        prev.map((i) => (i.id === ingredientId ? { ...i, ...updated } : i))
      );
      setEditing((prev) => ({ ...prev, [ingredientId]: undefined }));

      Swal.fire("Updated", "Ingredient updated successfully", "success");
    } catch {
      Swal.fire("Error", "Could not update ingredient", "error");
    }
  };

  const totalCost = ingredients.reduce((sum, i) => sum + i.cost, 0);

  if (loading) return <Loading />;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        Ingredients for {cookie?.name}
      </h1>

      {/* Base dough selection */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow border">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Select Base Dough
        </label>
        <select
          value={selectedBaseDough}
          onChange={(e) => setSelectedBaseDough(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">-- Choose base dough --</option>
          {allBaseDoughs.map((dough) => (
            <option key={dough.id} value={dough.id}>
              {dough.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add ingredient form */}
      {selectedBaseDough && (
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-6 rounded-xl shadow border">
          <select
            value={newIngredient.ingredientId}
            onChange={(e) =>
              setNewIngredient((prev) => ({
                ...prev,
                ingredientId: e.target.value,
              }))
            }
            className="border rounded p-2 flex-1"
          >
            <option value="">Select ingredient</option>
            {allIngredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name} ({ing.unitType})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantity used"
            value={newIngredient.quantityUsed}
            onChange={(e) =>
              setNewIngredient((prev) => ({
                ...prev,
                quantityUsed: parseFloat(e.target.value),
              }))
            }
            className="border rounded p-2 w-40"
          />
          <button
            onClick={handleAdd}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            ➕ Add
          </button>
        </div>
      )}

      {/* Ingredients table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-pink-100 text-pink-700">
            <tr>
              <th className="p-3 text-left">Ingredient</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Cost</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((i) => (
              <tr key={i.id} className="border-t hover:bg-pink-50">
                <td className="p-3">{i.ingredient.name}</td>
                <td className="p-3">
                  {editing[i.id] !== undefined ? (
                    <input
                      type="number"
                      value={editing[i.id]}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [i.id]: parseFloat(e.target.value),
                        }))
                      }
                      className="border rounded p-1 w-20"
                    />
                  ) : (
                    i.quantityUsed
                  )}
                </td>
                <td className="p-3">{i.ingredient.unitType}</td>
                <td className="p-3">${i.cost.toFixed(2)}</td>
                <td className="p-3 text-center space-x-2">
                  {editing[i.id] !== undefined ? (
                    <>
                      <button
                        onClick={() => handleUpdate(i.id)}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() =>
                          setEditing((prev) => ({ ...prev, [i.id]: undefined }))
                        }
                        className="text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setEditing((prev) => ({
                            ...prev,
                            [i.id]: i.quantityUsed,
                          }))
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-pink-50">
              <td className="p-3 text-right" colSpan={3}>
                Total
              </td>
              <td className="p-3">${totalCost.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
