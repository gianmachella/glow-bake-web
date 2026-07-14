"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Amanda",
    quote:
      "It’s because they were SO good!! I sampled all of them yesterday 😂",
  },
  {
    name: "Emily",
    quote:
      "Those cookies were so delicious 🤤 my family gobbled them up so fast! Riquísimo! My kids loved this cookies!",
  },
  {
    name: "Luke",
    quote:
      "These cookies were SOOOO delicious! Particularly the Nutella and red velvet😋 Wife and I couldn’t get enough! Will be ordering more in the future!",
  },
  {
    name: "Yenny",
    quote: "I loved the Nutella cookie! I can't wait to try all the flavors!",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="testimonials"
      className="relative bg-pink-50 px-6 py-60 overflow-hidden"
    >
      {/* Imagen de fondo con opacidad */}
      <Image
        src="/images/testimonials-bg.png"
        alt="Testimonials Background"
        fill
        sizes="100vw"
        className="object-cover opacity-10 pointer-events-none"
      />

      {/* Contenido por encima */}
      <div className="relative z-10">
        <h2 className="text-center text-3xl md:text-5xl font-script text-pink-700 mb-12">
          What People Say
        </h2>

        <div className="max-w-3xl mx-auto text-center transition-opacity duration-700 ease-in-out">
          <p className="text-lg italic text-gray-800 mb-4">
            “{testimonials[current].quote}”
          </p>
          <p className="font-semibold text-pink-700">
            — {testimonials[current].name}
          </p>
        </div>
      </div>
    </section>
  );
}
