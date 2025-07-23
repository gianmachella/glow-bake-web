"use client";

import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Emily R.",
    quote:
      "Absolutely delicious! The best cookies I've ever had — soft, flavorful, and made with love.",
  },
  {
    name: "James D.",
    quote:
      "I ordered a dozen for a party and they were gone in minutes. Everyone asked where they were from!",
  },
  {
    name: "Sophia M.",
    quote:
      "Glow Bake cookies are pure happiness in every bite. You can tell they care about quality.",
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
    <section id="testimonials" className="bg-pink-50 px-6 py-60">
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
    </section>
  );
}
