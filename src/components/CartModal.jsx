"use client";

import Swal from "sweetalert2";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CartModal({ onClose }) {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryDay, setDeliveryDay] = useState("Thursday");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSendOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          lastName,
          email,
          phone,
          address,
          deliveryDay,
          total,
          items: cartItems,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Order Sent!",
          text: "Thank you! Check your email for payment details.",
        });

        onClose();
        clearCart();
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
        ) : (
          <>
            {!showForm ? (
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
                  <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Shipping Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-400"
                  />
                  <div className="flex items-center gap-4 mt-2">
                    <label className="text-sm font-medium">Delivery day:</label>
                    <label className="text-sm">
                      <input
                        type="radio"
                        value="Thursday"
                        checked={deliveryDay === "Thursday"}
                        onChange={(e) => setDeliveryDay(e.target.value)}
                        className="mr-1"
                      />
                      Thursday
                    </label>
                    <label className="text-sm">
                      <input
                        type="radio"
                        value="Friday"
                        checked={deliveryDay === "Friday"}
                        onChange={(e) => setDeliveryDay(e.target.value)}
                        className="mr-1"
                      />
                      Friday
                    </label>
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
          </>
        )}
      </div>
    </div>
  );
}
