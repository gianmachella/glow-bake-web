"use client";

import { useEffect, useState } from "react";

import Swal from "sweetalert2";

export default function DeliverySettingsPage() {
  const [enableSaturday, setEnableSaturday] = useState(true);
  const [extraDays, setExtraDays] = useState([]);
  const [specialDates, setSpecialDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cookies, setCookies] = useState([]);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"];

  // Load cookies
  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const res = await fetch("/api/cookies");
        const data = await res.json();
        setCookies(data);
      } catch (err) {
        console.error("Error loading cookies:", err);
      }
    };

    fetchCookies();
  }, []);

  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/delivery");
        const data = await res.json();

        setEnableSaturday(data.enableSaturday);
        setExtraDays(data.extraDays || []);
        setSpecialDates(
          (data.specialDates || []).map((sd) => ({
            ...sd,
            date: sd.date
              ? new Date(sd.date).toISOString().substring(0, 10)
              : "",
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchSettings();
  }, []);

  const toggleExtraDay = (day) => {
    const updated = [...extraDays];
    const idx = updated.findIndex((d) => d.day === day);

    if (idx === -1) {
      updated.push({ day, active: true });
    } else {
      updated[idx].active = !updated[idx].active;
    }

    setExtraDays(updated);
  };

  const addSpecialDate = () => {
    setSpecialDates([...specialDates, { productId: "", date: "" }]);
  };

  const saveSettings = async () => {
    setLoading(true);

    try {
      await fetch("/api/settings/delivery/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enableSaturday,
          extraDays,
          specialDates: specialDates.map((sd) => ({
            productId: sd.productId,
            // FORCE local date so it never shifts
            date: sd.date ? `${sd.date}T12:00:00` : null,
          })),
        }),
      });

      Swal.fire({
        title: "Settings Saved",
        text: "Delivery settings updated successfully.",
        icon: "success",
        confirmButtonColor: "#ec4899",
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error",
        text: "Could not save settings.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }

    setLoading(false);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Pickup & Delivery Settings
      </h1>

      <div className="bg-white shadow-xl border border-pink-200/40 rounded-2xl p-8 space-y-10">
        {/* Saturday */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Regular Days
          </h2>

          <label className="flex items-center justify-between p-4 bg-pink-50 rounded-xl cursor-pointer border border-pink-100">
            <span className="text-gray-900 font-medium">Enable Saturday</span>

            <input
              type="checkbox"
              checked={enableSaturday}
              onChange={() => setEnableSaturday(!enableSaturday)}
              className="h-5 w-5 accent-pink-500"
            />
          </label>
        </div>

        {/* Extra days */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Extra Days (Optional)
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {weekDays.map((d) => {
              const active =
                extraDays.find((x) => x.day === d)?.active || false;

              return (
                <label
                  key={d}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer border border-gray-200 hover:bg-gray-100 transition"
                >
                  <span className="text-gray-800 font-medium">{d}</span>

                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleExtraDay(d)}
                    className="h-5 w-5 accent-pink-500"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Special Dates */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Special Dates (Per Product)
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Use this for holiday boxes or single-day products.
          </p>

          <div className="space-y-4">
            {specialDates.map((sd, i) => (
              <div
                key={i}
                className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200"
              >
                <select
                  className="border border-pink-300 bg-white/80 px-3 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
                  value={sd.productId}
                  onChange={(e) => {
                    const updated = [...specialDates];
                    updated[i].productId = e.target.value;
                    setSpecialDates(updated);
                  }}
                >
                  <option value="">Select a cookie…</option>
                  {cookies.map((cookie) => (
                    <option key={cookie.id} value={cookie.id}>
                      {cookie.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                  value={sd.date || ""}
                  onChange={(e) => {
                    const updated = [...specialDates];
                    updated[i].date = e.target.value; // YYYY-MM-DD
                    setSpecialDates(updated);
                  }}
                />
              </div>
            ))}
          </div>

          <button
            className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600"
            onClick={addSpecialDate}
          >
            + Add Special Date
          </button>
        </div>

        <div className="pt-4 text-right">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </section>
  );
}
