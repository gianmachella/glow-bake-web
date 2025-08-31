"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import Swal from "sweetalert2";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartItems, clearCart, addToCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    deliveryDay: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabledDays, setDisabledDays] = useState({
    Thursday: false,
    Friday: false,
  });
  const [nextAvailableDate, setNextAvailableDate] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 👉 función para calcular la próxima fecha disponible
  const getNextDate = (targetDay) => {
    const today = new Date();
    const day = today.getDay(); // 0=Dom ... 6=Sab
    const result = new Date(today);

    let daysToAdd = (targetDay + 7 - day) % 7;
    if (daysToAdd === 0) daysToAdd = 7; // siempre la próxima, no hoy

    result.setDate(today.getDate() + daysToAdd);
    return result.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Chequear disponibilidad de jueves/viernes
  useEffect(() => {
    const now = new Date();
    const today = now.getDay();
    const hours = now.getHours();

    let disableThursday = false;
    let disableFriday = false;

    if (today === 4 && hours >= 9) disableThursday = true;
    if (today === 5 && hours >= 0) disableThursday = true;
    if (today === 5 && hours >= 9) disableFriday = true;

    // 👉 sábado y domingo: habilitar ambos para la nueva semana
    if (today === 6 || today === 0) {
      disableThursday = false;
      disableFriday = false;
    }

    setDisabledDays({ Thursday: disableThursday, Friday: disableFriday });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deliveryDay" && value === "Other") {
      Swal.fire({
        icon: "info",
        title: "Special Catering Orders",
        text: "The 'Other' option is only available for catering or special orders. Please contact us directly for details.",
        confirmButtonColor: "#ec4899",
      });
      setNextAvailableDate("Contact us to schedule");
    }

    if (name === "deliveryDay" && value === "Thursday") {
      setNextAvailableDate(getNextDate(4)); // 4 = Jueves
    }

    if (name === "deliveryDay" && value === "Friday") {
      setNextAvailableDate(getNextDate(5)); // 5 = Viernes
    }

    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "First name is required.";
    if (!form.lastName) newErrors.lastName = "Last name is required.";
    if (!form.email.includes("@")) newErrors.email = "Valid email required.";
    if (!form.phone) newErrors.phone = "Phone number required.";
    if (!form.address) newErrors.address = "Address required.";
    if (!form.deliveryDay)
      newErrors.deliveryDay = "Please select a delivery day.";
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
      } else {
        Swal.fire("Oops", "Something went wrong. Try again.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Could not send order.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-pink-50 px-6 py-12 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-800">
            Your cart is empty.{" "}
            <Link href="/#menu" className="text-pink-600 underline">
              Continue shopping
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left side */}
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
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:flex-row md:items-center md:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-2 md:mb-0">
                      <button
                        onClick={() =>
                          addToCart({ ...item, quantity: item.quantity - 1 })
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-full bg-gray-300 hover:bg-pink-500 hover:text-white text-gray-800"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          addToCart({ ...item, quantity: item.quantity + 1 })
                        }
                        className="w-8 h-8 rounded-full bg-gray-300 hover:bg-pink-500 hover:text-white text-gray-800"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-center md:text-right font-bold text-pink-600 w-full md:w-20">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="bg-white border rounded-xl p-6 h-fit shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-900">
                Order Summary
              </h2>
              <div className="flex justify-between mb-2 text-gray-800">
                <span>Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-xl font-bold text-pink-600">
                  ${total.toFixed(2)}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">
                Checkout Info
              </h3>
              <div className="space-y-3">
                {[
                  { name: "name", placeholder: "First Name" },
                  { name: "lastName", placeholder: "Last Name" },
                  { name: "email", placeholder: "Email", type: "email" },
                  { name: "phone", placeholder: "Phone", type: "tel" },
                  { name: "address", placeholder: "Shipping Address" },
                ].map(({ name, placeholder, type = "text" }) => (
                  <div key={name} className="flex flex-col">
                    <input
                      type={type}
                      name={name}
                      placeholder={placeholder}
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
                  <p className="h-4"></p>
                </div>
              </div>

              {/* Delivery day */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-900">
                  Delivery day:
                </label>
                <div className="flex gap-4 mt-2">
                  {["Thursday", "Friday", "Other"].map((day) => (
                    <label
                      key={day}
                      className={`text-sm flex items-center gap-1 ${disabledDays[day] ? "text-gray-400" : "text-gray-800"}`}
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
                  <p className="text-xs text-gray-500 mt-2">
                    {form.deliveryDay === "Other"
                      ? nextAvailableDate
                      : `Next available ${form.deliveryDay}: ${nextAvailableDate}`}
                  </p>
                )}
                <p className="text-xs text-red-600 mt-1 h-4">
                  {errors.deliveryDay || ""}
                </p>
              </div>

              {/* Legal disclaimer */}
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
                className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-2 rounded-full"
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
