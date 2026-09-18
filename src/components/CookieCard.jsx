import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useInView } from "react-intersection-observer";

export default function CookieCard({ cookie, index }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });
  const { addToCart } = useCart();
  const [count, setCount] = useState(1);
  const soldOut = !!cookie.soldOut;
  const hasStockInfo = typeof cookie.remaining === "number";

  useEffect(() => {
    if (inView) controls.start({ opacity: 1, y: 0 });
  }, [inView, controls]);

  const handleAdd = () => {
    if (soldOut) return;
    addToCart({ ...cookie, quantity: count });
    setCount(1); // opcional reset
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 1.2, delay: index * 0.4 }}
      className="relative cursor-pointer bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-transform hover:scale-105 flex flex-col h-full"
    >
      {cookie.isNew && !soldOut && ( // 👈 ahora usamos isNew
        <Image
          src="/images/cookies/new.png"
          alt="New"
          width={80}
          height={80}
          className="absolute -top-6 -left-6 w-20 h-20 z-10 -rotate-12"
        />
      )}

      {soldOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 rounded-2xl">
          <span className="bg-gray-900 text-white text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full -rotate-6 shadow-lg">
            Sold Out
          </span>
        </div>
      )}

      {/* Imagen centrada */}
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-pink-200">
          <Image
            src={cookie.image}
            alt={cookie.name}
            fill
            sizes="(min-width: 640px) 10rem, 8rem"
            className="object-cover"
          />
        </div>
      </div>

      {/* Texto a la izquierda */}
      <div className="flex flex-col text-left flex-grow">
        <Link href={`/cookies/${encodeURIComponent(cookie.id)}`}>
          <h3 className="text-lg font-bold text-pink-600 uppercase hover:underline">
            {cookie.name}
          </h3>
        </Link>{" "}
        <Link href={`/cookies/${encodeURIComponent(cookie.id)}`}>
          <p className="text-gray-500 text-xs mt-1 mb-5 underline">
            More Details
          </p>
        </Link>
        <p className="text-gray-500 text-sm mt-1">
          {cookie.shortDescription || cookie.description}
        </p>
        <p className="text-gray-800 font-semibold text-base mt-2">
          ${cookie.price.toFixed(2)} USD
        </p>
        {hasStockInfo && !soldOut && (
          <p
            className={`text-xs font-semibold mt-1 ${
              cookie.remaining <= 3 ? "text-red-600" : "text-green-600"
            }`}
          >
            {cookie.remaining} left this week
          </p>
        )}
      </div>

      {/* Contador + botón */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        {/* contador */}
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <button
            onClick={() => setCount((prev) => Math.max(1, prev - 1))}
            disabled={count <= 1}
            className="w-8 h-8 rounded-full bg-gray-300 hover:bg-pink-500 hover:text-white text-gray-800"
          >
            -
          </button>
          <span className="w-6 text-center font-medium text-gray-900">
            {count}
          </span>
          <button
            onClick={() =>
              setCount((prev) =>
                hasStockInfo ? Math.min(cookie.remaining, prev + 1) : prev + 1
              )
            }
            disabled={hasStockInfo && count >= cookie.remaining}
            className="w-8 h-8 rounded-full bg-gray-300 hover:bg-pink-500 hover:text-white text-gray-800 disabled:opacity-50 disabled:hover:bg-gray-300 disabled:hover:text-gray-800"
          >
            +
          </button>
        </div>

        {/* botón */}
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-medium text-sm w-full sm:w-auto"
        >
          {soldOut ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
}
