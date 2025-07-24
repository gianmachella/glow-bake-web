"use client";

import Swal from "sweetalert2";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CartModal({ onClose }) {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    deliveryDay: "Thursday",
  });

  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "First name is required.";
    if (!form.lastName) newErrors.lastName = "Last name is required.";
    if (!form.email || !form.email.includes("@"))
      newErrors.email = "Valid email is required.";
    if (!form.phone) newErrors.phone = "Phone number is required.";
    if (!form.address) newErrors.address = "Shipping address is required.";
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
        Swal.fire({
          icon: "success",
          title: "Order Sent!",
          text: "Thank you! Check your email for payment details.",
        });
        clearCart();
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error sending order. Please try later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-red-500"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-pink-700">Your Cart</h2>

        {cartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : !showForm ? (
          <>
            <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 border-b pb-2"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-pink-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-pink-600">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="mt-5 w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold py-2 rounded-full"
            >
              Go to Checkout
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              {[
                { name: "name", placeholder: "First Name" },
                { name: "lastName", placeholder: "Last Name" },
                { name: "email", placeholder: "Email", type: "email" },
                { name: "phone", placeholder: "Phone", type: "tel" },
                { name: "address", placeholder: "Shipping Address" },
              ].map(({ name, placeholder, type = "text" }) => (
                <div key={name}>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-500"
                  />
                  {errors[name] && (
                    <p className="text-xs text-red-600 mt-1">{errors[name]}</p>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-4 mt-2">
                <label className="text-sm font-medium">Delivery day:</label>
                {["Thursday", "Friday"].map((day) => (
                  <label key={day} className="text-sm">
                    <input
                      type="radio"
                      name="deliveryDay"
                      value={day}
                      checked={form.deliveryDay === day}
                      onChange={handleChange}
                      className="mr-1"
                    />
                    {day}
                  </label>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center border-t pt-3">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-pink-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSendOrder}
              disabled={loading}
              className="mt-5 w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold py-2 rounded-full"
            >
              {loading ? "Sending..." : "Send Order"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
