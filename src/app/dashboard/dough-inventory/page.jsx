"use client";

import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import Swal from "sweetalert2";

export default function DoughInventoryPage() {
  const [cookies, setCookies] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    async function fetchCookies() {
      try {
        const res = await fetch("/api/cookies");
        if (!res.ok) throw new Error("Error fetching cookies");
        const data = await res.json();
        setCookies(data);
      } catch (err) {
        Swal.fire("Error", "Could not load cookies", "error");
      } finally {
        setLoadingPage(false);
      }
    }
    fetchCookies();
  }, []);

  const handleAddDough = async (cookieId) => {
    const result = await Swal.fire({
      title: "Add Dough?",
      text: "This will add 8 frozen cookies and consume ingredients.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, add",
    });
    if (!result.isConfirmed) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/dough-inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookieId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCookies((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        Swal.fire("Added!", "8 cookies added to frozen inventory", "success");
      } else {
        Swal.fire("Error", "Could not add dough", "error");
      }
    } catch {
      Swal.fire("Error", "Unexpected error adding dough", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveOne = async (cookieId) => {
    const result = await Swal.fire({
      title: "Remove 1 Cookie?",
      text: "This will return its ingredients to inventory.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove",
    });
    if (!result.isConfirmed) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/dough-inventory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookieId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCookies((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        Swal.fire(
          "Removed!",
          "1 cookie removed and ingredients restored",
          "success"
        );
      } else {
        Swal.fire("Error", "Could not remove cookie", "error");
      }
    } catch {
      Swal.fire("Error", "Unexpected error removing cookie", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveDough = async (cookieId) => {
    const result = await Swal.fire({
      title: "Remove Dough (8)?",
      text: "This will remove 8 cookies and restore ingredients.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove 8",
    });
    if (!result.isConfirmed) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/dough-inventory`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookieId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCookies((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        Swal.fire(
          "Removed!",
          "8 cookies removed and ingredients restored",
          "success"
        );
      } else {
        Swal.fire("Error", "Could not remove dough", "error");
      }
    } catch {
      Swal.fire("Error", "Unexpected error removing dough", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <section className="w-full min-h-screen px-6 py-16 bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <Loading isVisible={loadingPage || loadingAction} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-10 text-center">
          Dough Inventory 🥶
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cookies.map((cookie) => (
            <div
              key={cookie.id}
              className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-pink-100 flex flex-col items-center"
            >
              {cookie.image && (
                <img
                  src={cookie.image}
                  alt={cookie.name}
                  className="w-24 h-24 object-cover rounded-full mb-4 shadow"
                />
              )}
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {cookie.name}
              </h2>
              <p className="text-gray-600 mb-4">
                Frozen:{" "}
                <span className="font-semibold text-pink-600">
                  {cookie.frozenStock || 0}
                </span>
              </p>

              {/* Lista de ingredientes por cookie */}
              {cookie.cookieIngredients?.length > 0 && (
                <div className="w-full mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Ingredients (per cookie):
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {cookie.cookieIngredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.ingredient.name} – {ing.quantityUsed} {ing.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => handleAddDough(cookie.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white shadow transition"
                  title="Add Dough (8)"
                >
                  +8
                </button>
                {cookie.frozenStock > 0 && (
                  <>
                    <button
                      onClick={() => handleRemoveOne(cookie.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow transition"
                      title="Remove 1"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleRemoveDough(cookie.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow transition"
                      title="Remove 8"
                    >
                      -8
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
