"use client";

import { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import Swal from "sweetalert2";
import ToggleSwitch from "@/components/ToggleSwitch";

// Monday-start of the week containing `date`, formatted as YYYY-MM-DD for the
// <input type="date"> value and as the `week` query param the API expects.
// Mirrors the UTC-based logic in src/lib/weekWindow.js so the date the admin
// sees selected matches the week the server resolves it to.
function mondayOf(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

export default function WeeklyMenuManager() {
  const [weekInput, setWeekInput] = useState(() =>
    toDateInputValue(mondayOf(new Date()))
  );
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const weekStart = toDateInputValue(mondayOf(weekInput));

  useEffect(() => {
    async function fetchWeek() {
      setLoading(true);
      try {
        const res = await fetch(`/api/weekly-menu?week=${weekStart}`);
        if (!res.ok) throw new Error("Failed to load weekly menu");
        const data = await res.json();
        setCookies(data.cookies);
      } catch (err) {
        Swal.fire("Error", "Could not load the weekly menu", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchWeek();
  }, [weekStart]);

  const toggleIncluded = (cookieId, included) => {
    setCookies((prev) =>
      prev.map((c) =>
        c.cookieId === cookieId
          ? { ...c, included, batchLimit: included ? c.batchLimit || 12 : c.batchLimit }
          : c
      )
    );
  };

  const setBatchLimit = (cookieId, batchLimit) => {
    setCookies((prev) =>
      prev.map((c) =>
        c.cookieId === cookieId ? { ...c, batchLimit } : c
      )
    );
  };

  const handleSave = async () => {
    const included = cookies.filter((c) => c.included);
    const invalid = included.find((c) => !Number.isInteger(c.batchLimit) || c.batchLimit <= 0);
    if (invalid) {
      Swal.fire(
        "Invalid batch limit",
        `Set a batch limit greater than 0 for ${invalid.name}, or unselect it.`,
        "warning"
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/weekly-menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart,
          items: included.map((c) => ({
            cookieId: c.cookieId,
            batchLimit: c.batchLimit,
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save weekly menu");
      const data = await res.json();
      setCookies(data.cookies);
      Swal.fire("Saved", "This week's menu has been updated.", "success");
    } catch (err) {
      Swal.fire("Error", "Could not save the weekly menu", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-white to-pink-100 rounded-2xl shadow-lg min-h-screen space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl text-black tracking-tight">Weekly Menu</h1>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Week of (Mon–Sun)
          </label>
          <input
            type="date"
            value={weekInput}
            onChange={(e) => setWeekInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
          />
        </div>
      </div>

      {loading ? (
        <Loading isVisible />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pink-100 text-pink-800">
                <tr>
                  <th className="text-left py-3 px-4">Available this week</th>
                  <th className="text-left py-3 px-4">Cookie</th>
                  <th className="text-left py-3 px-4">Batch limit</th>
                  <th className="text-left py-3 px-4">Sold / Remaining</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => {
                  const remaining = Math.max(c.batchLimit - c.sold, 0);
                  return (
                    <tr key={c.cookieId} className="border-t border-gray-100">
                      <td className="py-3 px-4">
                        <ToggleSwitch
                          checked={c.included}
                          onChange={(val) => toggleIncluded(c.cookieId, val)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {c.image && (
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-10 h-10 rounded-full object-cover border border-pink-200"
                            />
                          )}
                          <span className="font-medium text-gray-900">
                            {c.name}
                          </span>
                        </div>
                        {!c.visible && (
                          <span
                            className="mt-1 inline-block text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"
                            title="This cookie is hidden in the main Cookies catalog. Enabling it here won't show it to customers until it's also made visible there."
                          >
                            Hidden in catalog
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          disabled={!c.included}
                          value={c.batchLimit || ""}
                          onChange={(e) =>
                            setBatchLimit(
                              c.cookieId,
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {c.included ? (
                          remaining <= 0 ? (
                            <span className="text-red-600 font-semibold">
                              Sold out
                            </span>
                          ) : (
                            `${c.sold} sold / ${remaining} left`
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Weekly Menu"}
          </button>
        </>
      )}
    </div>
  );
}
