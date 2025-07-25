"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/context/CartContext";

export default function CookieModal({ cookie, onClose }) {
  const [current, setCurrent] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    // Carousel
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cookie.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cookie.images.length]);

  useEffect(() => {
    // Disable scroll when modal opens
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleAddToCart = () => {
    addToCart({ ...cookie, quantity });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-2xl font-bold text-gray-500 hover:text-red-500"
        >
          &times;
        </button>

        <div className="w-full mb-4 overflow-hidden rounded-xl">
          <img
            src={cookie.images[current]}
            alt={cookie.name}
            className="w-full h-auto object-contain transition-all duration-500"
          />
        </div>

        <h3 className="text-xl font-semibold text-pink-700 mb-2">
          {cookie.name}
        </h3>
        <p className="text-gray-700 text-sm mb-4">{cookie.description}</p>

        <div className="flex items-center gap-3 mb-6">
          <label htmlFor="qty" className="text-gray-800 font-medium text-sm">
            Quantity:
          </label>
          <input
            id="qty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-16 border border-gray-400 rounded px-2 py-1 text-center text-gray-800"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleAddToCart}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-medium text-sm"
          >
            Add to Cart
          </button>
          <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-extrabold text-2xl shadow-md border-2 border-pink-300">
            ${cookie.price}
          </div>
        </div>
      </div>
    </div>
  );
}
