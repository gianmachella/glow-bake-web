"use client";

import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { cookies } from "@/utils/CookiesData";
import { useCart } from "@/context/CartContext";

export default function CookieDetailPage({ params }) {
  const cookie = cookies.find((c) => c.id === params.id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [current, setCurrent] = useState(0);
  const [suggested, setSuggested] = useState([]);
  const [showStore, setShowStore] = useState(false);

  useEffect(() => {
    if (!cookie) return;

    const shuffled = cookies
      .filter((c) => c.id !== cookie.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    setSuggested(shuffled);
  }, [cookie?.id]);
  if (!cookie) return <p>Cookie not found</p>;

  const handleAdd = () => {
    addToCart({ ...cookie, quantity });
  };

  const handlePrev = () => {
    setCurrent(
      (prev) => (prev - 1 + cookie.images.length) % cookie.images.length
    );
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % cookie.images.length);
  };

  return (
    <div className="min-h-screen w-full bg-white bg-cover bg-center">
      <div className="w-full max-w-5xl mx-auto px-6 py-10 pt-30">
        {/* Carousel */}
        <div className="w-full mb-6 flex flex-col items-center">
          <img
            src={cookie.images[current]}
            alt={cookie.name}
            className="w-full max-w-md rounded-xl border shadow"
          />
          <div className="mt-3 flex items-center gap-4 text-gray-600 text-sm">
            <button onClick={handlePrev} className="p-2 hover:text-pink-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span>
              {current + 1}/{cookie.images.length}
            </span>
            <button onClick={handleNext} className="p-2 hover:text-pink-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-pink-600 uppercase mb-2">
          {cookie.name}
        </h1>

        {/* Description */}
        <p className="text-gray-600 italic mb-4">{cookie.description}</p>
        {/* Price & Cart */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-6 gap-4">
          <p className="text-2xl font-bold text-gray-900">
            (${cookie.price.toFixed(2)} USD)
          </p>

          {/* contador bonito */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 shadow"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 shadow"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold text-sm md:text-base w-full md:w-auto"
          >
            Add to Cart
          </button>
        </div>

        {/* Pickup Info */}
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
          <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
            <li>Pickup available at 5614 Mystic Glade Way, Princeton, TX.</li>
            <li>
              Orders are usually ready on Thursday and Friday if placed before
              Thursday morning.
            </li>
          </ul>
          <p
            className="mt-3 text-sm text-pink-600 cursor-pointer"
            onClick={() => setShowStore(true)}
          >
            View store information
          </p>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-900">Ingredients:</h3>
          <p className="text-gray-700 text-sm">{cookie.ingredients}</p>
        </div>

        {/* Allergy Warning */}
        <div className="border rounded-lg p-4 bg-yellow-50 text-sm mb-8 flex flex-col gap-3">
          <div className="flex items-start gap-2 text-yellow-800">
            <TriangleAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>
              Our cookies may contain soy, eggs, tree nuts, peanuts, or dairy
              products.
            </p>
          </div>
          <div className="flex items-start gap-2 text-yellow-800">
            <TriangleAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>
              We take precautions to reduce cross-contact, but we cannot
              guarantee the complete absence of allergens.
            </p>
          </div>
        </div>

        {/* You may also like */}
        <h3 className="text-xl font-bold text-pink-600 mb-4">
          You may also like:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {suggested.map((c) => (
            <Link key={c.id} href={`/cookies/${c.id}`}>
              <div className="bg-white shadow rounded-lg p-3 flex flex-col items-center hover:scale-105 transition">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-24 h-24 object-cover rounded-full mb-2"
                />
                <p className="text-sm font-medium text-center text-gray-700">
                  {c.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Modal Store Info */}
      {showStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
            <button
              onClick={() => setShowStore(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold text-pink-600 mb-4">
              <a
                href="https://maps.apple.com/?address=5614%20Mystic%20Glade%20Way,%20Princeton,%20TX%2075407"
                target="_blank"
                rel="noopener noreferrer"
              >
                5614 Mystic Glade Way
              </a>
            </h2>
            <p className="text-gray-700 text-sm">Princeton</p>
            <p className="text-gray-700 text-sm">Texas</p>
            <p className="text-gray-700 text-sm">ZIP Code: 75407</p>
            <p className="text-gray-700 text-sm">Phone: (945) 400 5808</p>
          </div>
        </div>
      )}
    </div>
  );
}
