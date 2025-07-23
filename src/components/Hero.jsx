"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: "url('/images/banners/kitchen-bg.png')",
          transform: `translateY(${offsetY * 0.2}px)`,
        }}
      />

      {/* Cesta */}
      <div
        className="absolute bottom-0 w-full flex justify-center z-10"
        style={{
          transform: `translateY(${offsetY * 0.6}px)`,
        }}
      >
        <img
          src="/images/banners/cookies-basket.png"
          alt="Cookies Basket"
          className="w-[500px] sm:w-[700px] md:w-[800px] lg:w-[1200px] object-contain max-w-none"
        />
      </div>

      {/* Logo Glow Bake */}
      <div
        className="absolute inset-0 flex items-start justify-center pt-50 sm:pt-20 z-20"
        style={{
          transform: `translateY(${offsetY * 0.4}px)`,
        }}
      >
        <img
          src="/images/banners/glow Bake.png"
          alt="Glow Bake Logo"
          className="w-[600px] md:w-[800px] lg:w-[500px] object-contain"
        />
      </div>
    </div>
  );
}
