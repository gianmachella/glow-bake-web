"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Image from "next/image";
import Parallax from "@/components/motion/Parallax";
import SectionHeading from "@/components/motion/SectionHeading";

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

const ROTATE_MS = 6000;

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Re-armed whenever `current` changes, so picking a dot restarts the timer
  // instead of jumping again moments later.
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, ROTATE_MS);
    return () => clearTimeout(timer);
  }, [current, paused]);

  const testimonial = testimonials[current];

  return (
    <section
      id="testimonials"
      className="relative isolate overflow-hidden bg-pink-50 px-6 py-28 md:py-40"
    >
      {/* Background texture drifts slower than the page */}
      <Parallax distance={80} className="absolute inset-x-0 -top-24 -bottom-24 -z-10">
        <div className="relative h-full w-full">
          <Image
            src="/images/testimonials-bg.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-10 pointer-events-none"
          />
        </div>
      </Parallax>

      <SectionHeading eyebrow="Sweet words" title="What people say" />

      <div
        className="relative mx-auto max-w-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative min-h-[17rem] sm:min-h-[15rem] rounded-[2.5rem] bg-white/80 px-8 py-12 sm:px-14 shadow-xl shadow-pink-900/5 ring-1 ring-pink-100 backdrop-blur">
          <span
            aria-hidden
            className="absolute -top-8 left-8 font-display text-[7rem] leading-none text-pink-300 select-none"
          >
            “
          </span>

          <AnimatePresence mode="wait">
            <motion.figure
              key={current}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <blockquote className="font-display text-xl sm:text-2xl md:text-[1.7rem] italic leading-snug text-stone-800 text-balance">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                {testimonial.name}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setCurrent(i)}
              aria-label={`Show testimonial from ${t.name}`}
              aria-current={i === current}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-pink-500" : "w-2.5 bg-pink-200 hover:bg-pink-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
