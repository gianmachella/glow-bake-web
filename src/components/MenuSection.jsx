"use client";

import CookieCard from "./CookieCard";
import CookieModal from "./CookieModal";
import { cookies } from "@/utils/CookiesData"; // 👈 ahora usamos tu data real
import { useState } from "react";

export default function MenuSection() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="menu" className="w-full px-6 py-20 bg-white">
      <h2 className="text-center text-3xl md:text-5xl font-script text-pink-700 mb-12">
        Our Cookies
      </h2>

      {/* Grid mejorada: en mobile 2 columnas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {cookies.map((cookie, index) => (
          <CookieCard
            key={cookie.id}
            cookie={cookie}
            index={index}
            onClick={() => setSelected(cookie)}
          />
        ))}
      </div>

      {selected && (
        <CookieModal cookie={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
