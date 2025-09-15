"use client";

import { useEffect, useState } from "react";

export default function CookieIngredientsPage({ params }) {
  const { id } = params;
  const [cookie, setCookie] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    ingredientId: "",
    quantityUsed: 0,
  });
  const [editing, setEditing] = useState({}); // { [ingredientId]: cantidad }

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/cookies/${id}/ingredients`);
      const data = await res.json();
      setCookie(data.cookie);
      setIngredients(data.ingredients);

      const ingRes = await fetch("/api/ingredients");
      setAllIngredients(await ingRes.json());
    }
    fetchData();
  }, [id]);

  const handleAdd = async () => {
    if (!newIngredient.ingredientId || newIngredient.quantityUsed <= 0) return;
    const res = await fetch(`/api/cookies/${id}/ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIngredient),
    });
    const data = await res.json();
    setIngredients((prev) => [...prev, data]);
    setNewIngredient({ ingredientId: "", quantityUsed: 0 });
  };

  const handleDelete = async (ingredientId) => {
    await fetch(`/api/cookies/${id}/ingredients/${ingredientId}`, {
      method: "DELETE",
    });
    setIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
  };

  const handleUpdate = async (ingredientId) => {
    const quantityUsed = editing[ingredientId];
    if (!quantityUsed || quantityUsed <= 0) return;

    const res = await fetch(`/api/cookies/${id}/ingredients/${ingredientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantityUsed }),
    });
    const updated = await res.json();

    setIngredients((prev) =>
      prev.map((i) => (i.id === ingredientId ? { ...i, ...updated } : i))
    );
    setEditing((prev) => ({ ...prev, [ingredientId]: undefined }));
  };

  const totalCost = ingredients.reduce((sum, i) => sum + i.cost, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Ingredientes de {cookie?.name}
      </h1>

      {/* Formulario para agregar */}
      <div className="flex gap-4 mt-6 items-center">
        <select
          value={newIngredient.ingredientId}
          onChange={(e) =>
            setNewIngredient((prev) => ({
              ...prev,
              ingredientId: e.target.value,
            }))
          }
          className="border rounded p-2"
        >
          <option value="">Seleccionar ingrediente</option>
          {allIngredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({ing.unitType})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad usada"
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
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar
        </button>
      </div>

      {/* Tabla de ingredientes */}
      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-gray-100 text-gray-800">
            <th className="p-2 text-left">Ingrediente</th>
            <th className="p-2">Cantidad usada</th>
            <th className="p-2">Unidad</th>
            <th className="p-2">Costo</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((i) => (
            <tr key={i.id} className="border-t">
              <td className="p-2">{i.ingredient.name}</td>
              <td className="p-2">
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
              <td className="p-2">{i.ingredient.unitType}</td>
              <td className="p-2">${i.cost.toFixed(2)}</td>
              <td className="p-2 flex gap-2">
                {editing[i.id] !== undefined ? (
                  <>
                    <button
                      onClick={() => handleUpdate(i.id)}
                      className="text-green-600 hover:underline"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() =>
                        setEditing((prev) => ({ ...prev, [i.id]: undefined }))
                      }
                      className="text-gray-600 hover:underline"
                    >
                      Cancelar
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
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(i.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-50">
            <td className="p-2 text-right" colSpan={3}>
              Total
            </td>
            <td className="p-2">${totalCost.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
