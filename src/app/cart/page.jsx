"use client";

import { useEffect, useState } from "react";

import AddressInput from "@/components/AddressInput";
import Link from "next/link";
import Swal from "sweetalert2";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartItems, clearCart, increment, decrement, deleteFromCart } =
    useCart();

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    address: "",
    city: "",
    lat: "",
    lon: "",
    deliveryMethod: "", // Delivery o Pickup
    deliveryDay: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabledDays, setDisabledDays] = useState({
    Thursday: false,
    Friday: false,
  });
  const [nextAvailableDate, setNextAvailableDate] = useState("");
  const [distanceMiles, setDistanceMiles] = useState(null);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 📍 tu casa como origen
  const myHome = { lat: 33.190223, lon: -96.502784 };

  // 👉 fetchDistance
  const fetchDistance = async (lat, lon) => {
    try {
      const res = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: [myHome.lon, myHome.lat], // lon,lat
          destination: [parseFloat(lon), parseFloat(lat)], // lon,lat
        }),
      });

      const data = await res.json();
      if (data.miles) {
        setDistanceMiles(data.miles);
      } else {
        console.warn("❌ Error en la distancia:", data);
        setDistanceMiles(null);
      }
    } catch (err) {
      console.error("Fetch distance error:", err);
      setDistanceMiles(null);
    }
  };

  // cuando cambia la dirección → calculamos distancia
  useEffect(() => {
    if (form.lat && form.lon) {
      fetchDistance(form.lat, form.lon);
    }
  }, [form.lat, form.lon]);

  // 📦 reglas de delivery
  const getDeliveryMessage = () => {
    if (!form.address || !distanceMiles) return null;

    if (distanceMiles <= 10) {
      return { free: true, message: "✅ Delivery is free" };
    }

    const cost = distanceMiles * 1.5;
    return {
      free: false,
      message: `🚚 Delivery cost: $${cost.toFixed(
        2
      )} (${distanceMiles.toFixed(1)} mi from our kitchen)`,
    };
  };

  // 👉 próxima fecha
  const getNextDate = (targetDay) => {
    const today = new Date();
    const day = today.getDay();
    const result = new Date(today);

    let daysToAdd = (targetDay + 7 - day) % 7;
    if (daysToAdd === 0) daysToAdd = 7;

    result.setDate(today.getDate() + daysToAdd);
    return result.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // deshabilitar días
  useEffect(() => {
    const now = new Date();
    const today = now.getDay();
    const hours = now.getHours();

    let disableThursday = false,
      disableFriday = false;
    if (today === 4 && hours >= 9) disableThursday = true;
    if (today === 5) disableThursday = true;
    if (today === 5 && hours >= 9) disableFriday = true;

    if (today === 6 || today === 0) {
      disableThursday = false;
      disableFriday = false;
    }

    setDisabledDays({ Thursday: disableThursday, Friday: disableFriday });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "deliveryDay" &&
      value === "Other" &&
      form.deliveryMethod === "Pickup"
    ) {
      Swal.fire({
        icon: "info",
        title: "Special Catering Orders (Pickup)",
        html: "The 'Other' option is only for catering or special orders.<br/><strong>The minimum purchase is 10 cookies for this service.</strong><br/>Please contact us directly.",
        confirmButtonColor: "#ec4899",
      });
      setNextAvailableDate(`Contact us to schedule Only text: (945) 400 5808`);
    }

    if (
      name === "deliveryDay" &&
      value === "Other" &&
      form.deliveryMethod === "Delivery"
    ) {
      Swal.fire({
        icon: "info",
        title: "Special Catering Orders (Delivery)",
        html: "The 'Other' option is only for catering or special orders.<br/>Please contact us directly for details.",
        confirmButtonColor: "#ec4899",
      });
      setNextAvailableDate(
        `Contact us to schedule <br/> Only text: (945) 400 5808`
      );
    }

    if (name === "deliveryDay" && value === "Thursday")
      setNextAvailableDate(getNextDate(4));
    if (name === "deliveryDay" && value === "Friday")
      setNextAvailableDate(getNextDate(5));

    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "First name is required.";
    if (!form.lastName) newErrors.lastName = "Last name is required.";
    if (!form.email.includes("@")) newErrors.email = "Valid email required.";
    if (!form.phone) newErrors.phone = "Phone number required.";
    if (!form.deliveryMethod)
      newErrors.deliveryMethod = "Select delivery or pickup.";

    if (form.deliveryMethod === "Delivery") {
      if (!form.address) newErrors.address = "Address required.";
      if (!form.deliveryDay) newErrors.deliveryDay = "Select a delivery day.";
    }
    if (form.deliveryMethod === "Pickup") {
      if (!form.deliveryDay) newErrors.deliveryDay = "Select a pickup day.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, total, items: cartItems }),
      });
      if (res.ok) {
        Swal.fire(
          "Order Sent!",
          "Check your email for payment details.",
          "success"
        );
        clearCart();
        console.log("✅ Order saved to DB and email sent");
      } else {
        Swal.fire("Oops", "Something went wrong. Try again.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Could not send order.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cartItems]);

  return (
    <section className="w-full min-h-screen bg-pink-50 px-6 py-12 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-700 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-900">
            Your cart is empty.{" "}
            <Link href="/#menu" className="text-pink-600 underline">
              Continue shopping
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Items */}
            <div className="md:col-span-2 space-y-6">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-300 pb-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <Link href={`/cookies/${encodeURIComponent(item.id)}`}>
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-800">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:flex-row md:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-2 md:mb-0">
                      <button
                        onClick={() => decrement(item.id)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-full bg-gray-300 hover:bg-pink-500 hover:text-white text-gray-900"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increment(item.id)}
                        className="w-8 h-8 rounded-full bg-gray-300 hover:bg-pink-500 hover:text-white text-gray-900"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-center md:text-right font-bold text-pink-600 w-full md:w-20">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => deleteFromCart(item.id)}
                      className="text-xs text-red-600 hover:underline mt-2 md:mt-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white border rounded-xl p-6 h-fit shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-900">
                Order Summary
              </h2>
              <div className="flex justify-between mb-2 text-gray-900">
                <span>Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-xl font-bold text-pink-700">
                  ${total.toFixed(2)}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">
                Checkout Info
              </h3>
              <div className="space-y-3">
                {/* Campos básicos */}
                {["name", "lastName", "email", "phone"].map((name, i) => (
                  <div key={name} className="flex flex-col">
                    <input
                      type={
                        name === "email"
                          ? "email"
                          : name === "phone"
                            ? "tel"
                            : "text"
                      }
                      name={name}
                      placeholder={`* ${["First Name", "Last Name", "Email", "Phone"][i]}`}
                      value={form[name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                    />
                    <p className="text-xs text-red-600 mt-1 h-4">
                      {errors[name] || ""}
                    </p>
                  </div>
                ))}

                {/* Notes */}
                <div className="flex flex-col">
                  <textarea
                    name="notes"
                    placeholder="Notes (optional)"
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 h-20 resize-none"
                  />
                </div>

                {/* Radios: Delivery o Pickup */}
                <div className="flex flex-col mt-3">
                  <label className="text-sm font-medium text-gray-900">
                    Choose:
                  </label>
                  <div className="flex gap-6 mt-2">
                    {["Delivery", "Pickup"].map((method) => (
                      <label
                        key={method}
                        className="text-sm flex items-center gap-1 text-gray-900"
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={method}
                          checked={form.deliveryMethod === method}
                          onChange={handleChange}
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-red-600 mt-1 h-4">
                    {errors.deliveryMethod || ""}
                  </p>
                </div>

                {/* Pickup */}
                {form.deliveryMethod === "Pickup" && (
                  <>
                    <p className="mt-3 p-3 border rounded-lg bg-green-50 text-sm text-green-700 font-semibold">
                      📍 Pickup at{" "}
                      <b>5614 Mystic Glade Way, Princeton, TX 75407</b> <br />
                      Thu & Fri, 4:00–6:00 PM
                    </p>

                    {/* Día de pickup */}
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-900">
                        Pickup day:
                      </label>
                      <div className="flex gap-4 mt-2">
                        {["Thursday", "Friday", "Other"].map((day) => (
                          <label
                            key={day}
                            className={`text-sm flex items-center gap-1 ${
                              disabledDays[day]
                                ? "text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryDay"
                              value={day}
                              checked={form.deliveryDay === day}
                              onChange={handleChange}
                              disabled={disabledDays[day]}
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                      {nextAvailableDate && (
                        <p className="text-xs text-gray-700 mt-1 italic">
                          {nextAvailableDate}
                        </p>
                      )}
                      <p className="text-xs text-red-600 mt-1 h-4">
                        {errors.deliveryDay || ""}
                      </p>
                    </div>
                  </>
                )}

                {/* Delivery */}
                {form.deliveryMethod === "Delivery" && (
                  <>
                    <AddressInput
                      inputText={form.address}
                      onChange={(field, val) =>
                        setForm((prev) => ({ ...prev, [field]: val }))
                      }
                      error={errors.address}
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={form.city ?? ""}
                      disabled
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-gray-100"
                    />

                    {form.address && form.lat && form.lon && distanceMiles && (
                      <div className="mt-3 p-3 border rounded-lg bg-blue-50 text-sm text-gray-900">
                        {(() => {
                          const delivery = getDeliveryMessage();
                          return (
                            <p
                              className={
                                delivery.free
                                  ? "text-green-700 font-semibold"
                                  : "text-gray-900"
                              }
                            >
                              {delivery.message}
                            </p>
                          );
                        })()}
                      </div>
                    )}

                    {/* Día de delivery */}
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-900">
                        Delivery day:
                      </label>
                      <div className="flex gap-4 mt-2">
                        {["Thursday", "Friday", "Other"].map((day) => (
                          <label
                            key={day}
                            className={`text-sm flex items-center gap-1 ${
                              disabledDays[day]
                                ? "text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryDay"
                              value={day}
                              checked={form.deliveryDay === day}
                              onChange={handleChange}
                              disabled={disabledDays[day]}
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                      {nextAvailableDate && (
                        <p className="text-xs text-gray-700 mt-1 italic">
                          {nextAvailableDate}
                        </p>
                      )}
                      <p className="text-xs text-red-600 mt-1 h-4">
                        {errors.deliveryDay || ""}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Disclaimer */}
              <div className="mt-5 border border-gray-300 bg-yellow-50 rounded-lg p-3 text-xs italic text-gray-800">
                “This food is made in a home kitchen and is not inspected by the
                Department of State Health Services or a local health
                department.”
              </div>

              <button
                onClick={handleSendOrder}
                disabled={loading}
                className="mt-5 w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold py-3 rounded-full disabled:opacity-50"
              >
                {loading ? "Sending..." : "Place Order"}
              </button>
              <button
                onClick={clearCart}
                className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-semibold py-2 rounded-full"
              >
                Empty Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
