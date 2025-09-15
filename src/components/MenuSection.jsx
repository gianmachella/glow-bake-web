"use client";

import { useEffect, useState } from "react";

import CookieCard from "./CookieCard";
import CookieModal from "./CookieModal";

export default function MenuSection() {
  const [cookies, setCookies] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchCookies() {
      try {
        const res = await fetch("/api/cookies");
        if (!res.ok) throw new Error("Error al cargar cookies");
        const data = await res.json();
        setCookies(data.filter((c) => c.visible));
      } catch (err) {
        console.error("❌ Error cargando cookies:", err);
      }
    }
    fetchCookies();
  }, []);

  return (
    <section id="menu" className="w-full px-6 py-20 bg-white">
      <h2 className="text-center text-3xl md:text-5xl font-script text-pink-700 mb-12">
        Our Cookies
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {cookies.length > 0 ? (
          cookies.map((cookie, index) => (
            <CookieCard
              key={cookie.id}
              cookie={cookie}
              index={index}
              onClick={() => setSelected(cookie)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No cookies available yet 🍪
          </p>
        )}
      </div>

      {selected && (
        <CookieModal cookie={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
