import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CookieCard({ cookie, index }) {
  const { addToCart } = useCart();
  const [count, setCount] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = !!cookie.soldOut;
  const hasStockInfo = typeof cookie.remaining === "number";
  const detailsHref = `/cookies/${encodeURIComponent(cookie.id)}`;

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    if (soldOut) return;
    addToCart({ ...cookie, quantity: count });
    setCount(1); // opcional reset
    setJustAdded(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      // Stagger within a row only, so cards further down the grid don't wait
      // seconds behind the first ones.
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col rounded-3xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-stone-900/5 transition-[box-shadow,translate] duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-pink-900/10"
    >
      {cookie.isNew && !soldOut && ( // 👈 ahora usamos isNew
        <Image
          src="/images/cookies/new.png"
          alt="New"
          width={80}
          height={80}
          className="absolute -top-5 -left-4 w-16 h-16 sm:w-20 sm:h-20 z-10 -rotate-12"
        />
      )}

      {/* pointer-events-none: the card stays in the grid and its "More
          Details" links stay clickable while sold out. */}
      {soldOut && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-end p-4">
          <span className="bg-stone-900 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full rotate-3 shadow-lg">
            Sold Out
          </span>
        </div>
      )}

      {/* Image on a soft pink plate; rotates gently on hover */}
      <Link href={detailsHref} className="relative mx-auto mb-5 block w-full max-w-[11rem] aspect-square">
        <span className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-100 to-amber-50 transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 rounded-full overflow-hidden border-4 border-pink-200 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-[1.04]">
          <Image
            src={cookie.image || "/images/logo-circle.png"}
            alt={cookie.name}
            fill
            sizes="(min-width: 640px) 11rem, 40vw"
            className={`object-cover ${soldOut ? "grayscale opacity-60" : ""}`}
          />
        </span>
      </Link>

      <div className="flex flex-grow flex-col text-left">
        <Link href={detailsHref}>
          <h3 className="font-display text-lg sm:text-xl font-semibold leading-tight text-stone-900 transition-colors group-hover:text-pink-600">
            {cookie.name}
          </h3>
        </Link>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 line-clamp-2">
          {cookie.shortDescription || cookie.description}
        </p>
        <Link
          href={detailsHref}
          className="mt-1 w-fit text-xs font-medium text-pink-600 underline-offset-4 hover:underline"
        >
          More details
        </Link>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <p className="text-lg font-semibold text-stone-900">
            ${cookie.price.toFixed(2)}
            <span className="ml-1 text-xs font-medium text-stone-400">USD</span>
          </p>
          {hasStockInfo && !soldOut && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                cookie.remaining <= 3
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {cookie.remaining} left this week
            </span>
          )}
        </div>
      </div>

      {/* Contador + botón */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-1 rounded-full bg-stone-100 p-1 sm:justify-start">
          <button
            onClick={() => setCount((prev) => Math.max(1, prev - 1))}
            disabled={soldOut || count <= 1}
            aria-label="Decrease quantity"
            className="h-8 w-8 rounded-full text-stone-700 transition hover:bg-white hover:text-pink-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-stone-700"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold text-stone-900">
            {count}
          </span>
          <button
            onClick={() =>
              setCount((prev) =>
                hasStockInfo ? Math.min(cookie.remaining, prev + 1) : prev + 1
              )
            }
            disabled={soldOut || (hasStockInfo && count >= cookie.remaining)}
            aria-label="Increase quantity"
            className="h-8 w-8 rounded-full text-stone-700 transition hover:bg-white hover:text-pink-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-stone-700"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="relative inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-600/20 transition hover:bg-pink-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none sm:w-auto"
        >
          {soldOut ? (
            "Sold Out"
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </motion.article>
  );
}
