"use client";

import { useEffect, useState } from "react";

import Swal from "sweetalert2";
import { useCart } from "@/context/CartContext";

export default function CookieModal({ cookie, onClose }) {
  const [current, setCurrent] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [flavorCounts, setFlavorCounts] = useState({
    smores: 0,
    nutella: 0,
    "choco chips": 0,
    mms: 0,
  });
  const [selectedOption, setSelectedOption] = useState("custom");
  const { addToCart } = useCart();

  const FLAVORS = ["smores", "nutella", "choco chips", "mms"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cookie.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cookie.images.length]);

  const handleFlavorChange = (flavor, value) => {
    const updated = { ...flavorCounts, [flavor]: parseInt(value) || 0 };
    setFlavorCounts(updated);
    setSelectedOption("custom");
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (option === "mix") {
      setFlavorCounts({
        smores: 3,
        nutella: 3,
        "choco chips": 3,
        mms: 3,
      });
    } else {
      setFlavorCounts({
        smores: 0,
        nutella: 0,
        "choco chips": 0,
        mms: 0,
      });
    }
  };

  const getFlavorSummary = () => {
    return FLAVORS.filter((flavor) => flavorCounts[flavor] > 0)
      .map((flavor) => `${flavorCounts[flavor]}x ${flavor}`)
      .join(", ");
  };

  const handleAddToCart = () => {
    if (cookie.id === "minicookies") {
      const total = Object.values(flavorCounts).reduce((a, b) => a + b, 0);
      if (total !== 12) {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "You must select exactly 12 cookies.",
        });
        return;
      }

      addToCart({
        ...cookie,
        quantity: 1,
        flavors: { ...flavorCounts },
        description: `${cookie.description} (${getFlavorSummary()})`,
      });
    } else {
      addToCart({ ...cookie, quantity });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
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

        {cookie.id === "minicookies" ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-800 font-medium text-sm mb-1">
                Choose an option:
              </label>
              <div className="flex gap-4">
                <label className="text-gray-700 text-sm">
                  <input
                    type="radio"
                    name="minibox"
                    checked={selectedOption === "mix"}
                    onChange={() => handleOptionSelect("mix")}
                    className="mr-1"
                  />
                  Mix (3 of each)
                </label>
                <label className="text-gray-700 text-sm">
                  <input
                    type="radio"
                    name="minibox"
                    checked={selectedOption === "custom"}
                    onChange={() => handleOptionSelect("custom")}
                    className="mr-1"
                  />
                  Choose flavors
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {FLAVORS.map((flavor) => (
                <div key={flavor}>
                  <label className="text-sm font-medium text-gray-600">
                    {flavor}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={flavorCounts[flavor]}
                    onChange={(e) => handleFlavorChange(flavor, e.target.value)}
                    className="w-full border rounded px-2 py-1 mt-1 text-center text-gray-800 placeholder-gray-800"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
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
        )}

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
