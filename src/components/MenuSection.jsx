"use client";

import { useEffect, useState } from "react";

import CookieCard from "./CookieCard";
import CookieModal from "./CookieModal";

export default function MenuSection() {
  const [cookies, setCookies] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const res = await fetch("/api/cookies");
        const data = await res.json();
        setCookies(data);
      } catch (err) {
        console.error("❌ Error loading cookies:", err);
      }
    };

    fetchCookies();
  }, []);

  return (
    <section id="menu" className="w-full px-6 py-20 bg-white">
      <h2 className="text-center text-3xl md:text-5xl font-script text-pink-700 mb-12">
        Our Cookies
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {cookies.map((cookie, index) => (
          <CookieCard
            key={cookie.id} // ahora sí viene de la DB
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
