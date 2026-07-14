"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import Swal from "sweetalert2";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { computeLineItems } from "@/lib/discounts";

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
    deliveryMethod: "",
    deliveryDay: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabledDays, setDisabledDays] = useState({});

  const [settings, setSettings] = useState(null);

  const [nextAvailableDate, setNextAvailableDate] = useState("");

  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [activeWebPromotions, setActiveWebPromotions] = useState([]);

  const discountsByCookieId = {};
  const globalDiscounts = [];
  for (const d of [...activeDiscounts, ...activeWebPromotions]) {
    if (d.cookieId) {
      (discountsByCookieId[d.cookieId] ||= []).push(d);
    } else {
      globalDiscounts.push(d); // no cookieId = applies to every cookie
    }
  }

  const { items: lineItems, subtotal: total, savings } = computeLineItems(
    cartItems,
    discountsByCookieId,
    globalDiscounts
  );

  const WEEKDAY_MAP = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const router = useRouter();

  const getDeliveryMessage = () => {
    switch (form.city) {
      case "Princeton":
        return { free: true, cost: 0, message: "✅ Delivery is free" };
      case "McKinney":
        return { free: false, cost: 16, message: "🚚 Delivery cost: $16" };
      case "Farmersville":
        return { free: false, cost: 12, message: "🚚 Delivery cost: $12" };
      case "Lucas":
        return { free: false, cost: 10, message: "🚚 Delivery cost: $10" };
      case "Wylie":
        return { free: false, cost: 16, message: "🚚 Delivery cost: $16" };
      case "Allen":
        return { free: false, cost: 16, message: "🚚 Delivery cost: $16" };
      default:
        return null;
    }
  };

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

  const getAvailableDays = () => {
    if (!settings) return [];

    let days = ["Friday"];

    if (settings.enableSaturday) {
      days.push("Saturday");
    }

    settings.extraDays?.forEach((d) => {
      if (d.active) days.push(d.day);
    });

    const specialDates = settings.specialDates
      ?.filter((s) => cartItems.some((item) => item.id === s.productId))
      .map((s) =>
        new Date(s.date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );

    if (specialDates?.length > 0) {
      return specialDates;
    }

    return [...days, "Other"];
  };

  useEffect(() => {
    if (!settings) return;

    const available = getAvailableDays();

    if (form.deliveryDay && !available.includes(form.deliveryDay)) {
      setForm((prev) => ({
        ...prev,
        deliveryDay: "",
      }));
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deliveryDay") {
      if (!WEEKDAY_MAP[value]) {
        setNextAvailableDate(value);
        setForm({ ...form, deliveryDay: value });
        return;
      }

      const weekdayNum = WEEKDAY_MAP[value];
      const nextDate = getNextDate(weekdayNum);

      setNextAvailableDate(nextDate);
    }

    if (name === "deliveryDay" && value === "Other") {
      Swal.fire({
        icon: "info",
        title: "Special catering order",
        html: `
      'Other' is only for catering orders.<br/>
      <b>Minimum 10 cookies.</b><br/>
      Contact us at: <br/>
      <b>(945) 400 5808 (text only)</b>
    `,
        confirmButtonColor: "#ec4899",
      });

      setNextAvailableDate("Contact us directly");
    }

    if (name === "deliveryDay" && value === "Thursday")
      setNextAvailableDate(getNextDate(4));
    if (name === "deliveryDay" && value === "Friday")
      setNextAvailableDate(getNextDate(5));
    if (name === "deliveryDay" && value === "Saturday")
      setNextAvailableDate(getNextDate(6));

    if (name === "deliveryMethod") {
      setForm((prev) => ({
        ...prev,
        deliveryDay: "",
      }));

      setNextAvailableDate("");
    }
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

    const availableDays = getAvailableDays();

    if (form.deliveryMethod === "Delivery") {
      if (!form.address) newErrors.address = "Address required.";
      if (!form.city) newErrors.city = "Select a city.";
      if (!form.deliveryDay) newErrors.deliveryDay = "Select a delivery day.";

      if (form.deliveryDay && !availableDays.includes(form.deliveryDay)) {
        newErrors.deliveryDay = "This day is not available.";
      }
    }

    if (form.deliveryMethod === "Pickup") {
      if (!form.deliveryDay) newErrors.deliveryDay = "Select a pickup day.";

      if (form.deliveryDay && !availableDays.includes(form.deliveryDay)) {
        newErrors.deliveryDay = "This day is not available.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOrder = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const delivery = getDeliveryMessage();
      const deliveryCost = delivery && !delivery.free ? delivery.cost : 0;
      const grandTotal = total + deliveryCost;

      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total,
          deliveryFee: deliveryCost,
          items: cartItems,
        }),
      });

      if (res.ok) {
        Swal.fire(
          "Order Sent!",
          "Check your email for payment details.",
          "success"
        );
        clearCart();
        router.push("/#menu");
      } else {
        const data = await res.json().catch(() => ({}));
        Swal.fire("Oops", data.error || "Something went wrong. Try again.", "error");
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/delivery");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchActiveDiscounts = async () => {
      try {
        const [autoRes, webPromoRes] = await Promise.all([
          fetch("/api/auto-discounts/active"),
          fetch("/api/web-promotions/active"),
        ]);
        setActiveDiscounts(await autoRes.json());
        setActiveWebPromotions(await webPromoRes.json());
      } catch (err) {
        console.error("Error loading automatic discounts:", err);
      }
    };

    fetchActiveDiscounts();
  }, []);

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
              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-300 pb-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.images?.[0] ||
                        item.image ||
                        "/images/placeholder-cookie.png"
                      }
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
                        {item.quantity} ×{" "}
                        {item.unitOff > 0 ? (
                          <>
                            <span className="line-through text-gray-400 mr-1">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="text-pink-600 font-semibold">
                              ${item.unitPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          `$${item.price.toFixed(2)}`
                        )}
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
                      ${item.lineTotal.toFixed(2)}
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
              {savings > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>You saved</span>
                  <span className="font-semibold">-${savings.toFixed(2)}</span>
                </div>
              )}
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
                        {getAvailableDays().map((day) => (
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
                            {settings?.specialDates?.some((s) =>
                              cartItems.some((i) => i.id === s.productId)
                            ) && (
                              <p className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded mt-2">
                                ⚠️ This item has a fixed delivery/pickup date.
                              </p>
                            )}

                            {day}
                          </label>
                        ))}
                      </div>
                      {nextAvailableDate && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          Next available date: {nextAvailableDate}
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
                    {/* Address */}
                    <div className="flex flex-col">
                      <input
                        type="text"
                        name="address"
                        placeholder="* Address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                      />
                      <p className="text-xs text-red-600 mt-1 h-4">
                        {errors.address || ""}
                      </p>
                    </div>

                    {/* City */}
                    <div className="flex flex-col mt-3">
                      <label className="text-sm font-medium text-gray-900 mb-1">
                        City
                      </label>
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-white"
                      >
                        <option value="">Select a city</option>
                        <option value="Princeton">Princeton</option>
                        <option value="McKinney">McKinney</option>
                        <option value="Farmersville">Farmersville</option>
                        <option value="Lucas">Lucas</option>
                        <option value="Wylie">Wylie</option>
                        <option value="Allen">Allen</option>
                      </select>
                      <p className="text-xs text-red-600 mt-1 h-4">
                        {errors.city || ""}
                      </p>
                    </div>

                    {/* Fee message */}
                    {form.city && (
                      <div className="mt-3 p-3 border rounded-lg bg-blue-50 text-sm text-gray-900">
                        {(() => {
                          const delivery = getDeliveryMessage();
                          return (
                            <p
                              className={
                                delivery?.free
                                  ? "text-green-700 font-semibold"
                                  : "text-gray-900"
                              }
                            >
                              {delivery?.message}
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
                        {getAvailableDays().map((day) => (
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
                            {settings?.specialDates?.some((s) =>
                              cartItems.some((i) => i.id === s.productId)
                            ) && (
                              <p className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded mt-2">
                                ⚠️ This item has a fixed delivery/pickup date.
                              </p>
                            )}

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
