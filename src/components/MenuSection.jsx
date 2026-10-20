"use client";

import { useEffect, useState } from "react";

import CookieCard from "./CookieCard";
import CookieModal from "./CookieModal";
import SectionHeading from "./motion/SectionHeading";

export default function MenuSection() {
  const [cookies, setCookies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchCookies() {
      try {
        const res = await fetch("/api/weekly-menu/active");
        if (!res.ok) throw new Error("Error al cargar el menú semanal");
        const data = await res.json();
        setCookies(Array.isArray(data.cookies) ? data.cookies : []);
      } catch (err) {
        console.error("❌ Error cargando cookies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCookies();
  }, []);

  return (
    <section
      id="menu"
      className="relative w-full bg-gradient-to-b from-white via-[#fffaf7] to-white px-4 sm:px-6 py-24 md:py-32"
    >
      <SectionHeading
        eyebrow="Fresh this week"
        title="This week’s cookies"
        lead="Our menu changes every week and every batch is limited — once a flavor is gone, it’s gone until next time."
      />

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              aria-hidden
              className="h-[26rem] animate-pulse rounded-3xl bg-stone-100"
            />
          ))
        ) : cookies.length > 0 ? (
          cookies.map((cookie, index) => (
            <CookieCard
              key={cookie.id}
              cookie={cookie}
              index={index}
              onClick={() => setSelected(cookie)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-stone-500">
            No cookies available yet 🍪 — check back soon for this week’s batch.
          </p>
        )}
      </div>

      {selected && (
        <CookieModal cookie={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
