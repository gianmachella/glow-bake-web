"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";

export default function DashboardCookieCard({
  cookie,
  index,
  onEdit,
  onDelete,
  onToggleVisible,
  onToggleNew,
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });
  const router = useRouter();
  const [costData, setCostData] = useState(null);

  useEffect(() => {
    if (inView) controls.start({ opacity: 1, y: 0 });
  }, [inView, controls]);

  useEffect(() => {
    async function fetchCost() {
      const res = await fetch(`/api/cookies/${cookie.id}/costs`);
      if (res.ok) {
        setCostData(await res.json());
      }
    }
    if (cookie?.id) fetchCost();
  }, [cookie?.id]);

  const costo = costData ? costData.cost.toFixed(2) : "0.00";
  const ganancia = costData ? costData.profit.toFixed(2) : "0.00";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative bg-white rounded-xl shadow hover:shadow-lg 
                 transition-transform hover:-translate-y-1 flex flex-col h-full border border-gray-200"
    >
      {/* Switch Visible */}
      <div className="absolute top-3 right-3">
        <span className="mr-2 text-xs text-gray-600">
          {cookie?.visible ? "Visible" : "Hidden"}
        </span>
        <ToggleSwitch
          checked={cookie?.visible}
          onChange={(val) => onToggleVisible(cookie.id, val)}
        />
      </div>

      {/* Switch New */}
      <div className="absolute top-3 left-3">
        <span className="mr-2 text-xs text-pink-600">
          {cookie?.isNew ? "New" : "Not New"}
        </span>
        <ToggleSwitch
          checked={cookie?.isNew}
          onChange={(val) => onToggleNew(cookie.id, val)}
        />
      </div>

      {/* Imagen */}
      <div className="flex justify-center mt-8">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden 
                        border-2 border-pink-200 bg-pink-50 shadow-sm flex items-center justify-center"
        >
          {cookie.image ? (
            <img
              src={cookie.image}
              alt={cookie.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">🍪</span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-grow text-center p-4">
        <h3 className="text-base font-bold text-pink-600 uppercase tracking-wide">
          {cookie.name}
        </h3>
        <p className="text-xs text-gray-500 italic line-clamp-2 mt-1">
          {cookie.shortDescription || cookie.description}
        </p>

        {/* 💵 Info financiera */}
        <div className="mt-3 text-sm space-y-1">
          <p className="text-gray-800 font-semibold">
            Precio: ${cookie.price.toFixed(2)}
          </p>
          <p className="text-gray-700 text-xs mt-1">
            Costo: ${costo} – Ganancia: ${ganancia}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between gap-2 p-3 border-t border-gray-100">
        <button
          onClick={() =>
            router.push(`/dashboard/cookie-ingredients/${cookie.id}`)
          }
          className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-700 
                     px-2 py-1 rounded-lg text-xs font-medium transition"
        >
          Ingredientes
        </button>
        <button
          onClick={() => onEdit(cookie)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 
                     px-2 py-1 rounded-lg text-xs font-medium transition"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(cookie.id)}
          className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 
                     px-2 py-1 rounded-lg text-xs font-medium transition"
        >
          Eliminar
        </button>
      </div>
    </motion.div>
  );
}
