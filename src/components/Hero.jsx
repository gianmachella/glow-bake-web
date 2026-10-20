"use client";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Cookie positions inside the basket "stage" — a 16:9 box matching the
// basket artwork (6000×3375). `left`/`bottom` are % of the stage's width /
// height, and every cookie is COOKIE_SIZE % of the stage width, so the whole
// composition scales as one unit and stays locked to the basket on any
// screen (phones, tablets, ultra-wide). Values are the original desktop
// layout (1200px basket on a 1440px viewport) converted to stage units.
// Array order is paint order (later cookies sit in front).
const COOKIE_SIZE = 29.2;
const cookies = [
  { src: "/images/cookies/cookie-1.png", left: 16.4, bottom: 26.7 },
  { src: "/images/cookies/cookie-2.png", left: 47.6, bottom: 20.7 },
  { src: "/images/cookies/cookie-3.png", left: 62, bottom: 14.8 },
  { src: "/images/cookies/cookie-8.png", left: 14, bottom: 10.4 },
  { src: "/images/cookies/cookie-4.png", left: 28.4, bottom: 26.7 },
  { src: "/images/cookies/cookie-5.png", left: 50, bottom: 11.9 },
  { src: "/images/cookies/cookie-6.png", left: 26, bottom: 10.4 },
  { src: "/images/cookies/cookie-7.png", left: 38, bottom: 10.4 },
];

// Scroll distance (px) over which the parallax speeds below are expressed;
// each layer moves `speed * SCROLL_RANGE` px across it, then keeps going
// linearly (useTransform clamps by default, so `clamp: false`).
const SCROLL_RANGE = 1000;

function useScrollSpeed(scrollY, speed) {
  return useTransform(
    scrollY,
    [0, SCROLL_RANGE],
    [0, speed * SCROLL_RANGE],
    { clamp: false }
  );
}

function HeroCookie({ cookie, index, scrollY }) {
  const direction = index % 2 === 0 ? 1 : -1;
  const rotate = useScrollSpeed(scrollY, 0.1 * direction);

  return (
    <motion.div
      className="absolute aspect-square"
      style={{
        left: `${cookie.left}%`,
        bottom: `${cookie.bottom}%`,
        width: `${COOKIE_SIZE}%`,
        rotate,
      }}
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.9,
        delay: 0.25 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Image
        src={cookie.src}
        alt=""
        fill
        priority={index < 4}
        sizes="(min-width: 1024px) 25vw, 40vw"
        className="object-contain drop-shadow-[0_18px_24px_rgba(68,34,20,0.25)]"
      />
    </motion.div>
  );
}

export default function Hero() {
  const { scrollY } = useScroll();

  // Same layer speeds as the original hero: background drifts down slowly,
  // the basket sinks faster, cookies float up out of it, logo eases down.
  const backgroundY = useScrollSpeed(scrollY, 0.2);
  const basketY = useScrollSpeed(scrollY, 0.6);
  const cookiesY = useScrollSpeed(scrollY, -0.4);
  const contentY = useScrollSpeed(scrollY, 0.4);
  const contentOpacity = useTransform(scrollY, [0, 450], [1, 0]);

  return (
    <section
      id="top"
      className="relative isolate w-full h-[100svh] min-h-[560px] overflow-hidden bg-[#f6ede4]"
    >
      {/* Kitchen background — taller than the hero so drifting down never
          exposes an edge. */}
      <motion.div
        className="absolute inset-x-0 -top-[25%] bottom-0 -z-10"
        style={{ y: backgroundY }}
      >
        <Image
          src="/images/banners/kitchen-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.55),transparent_60%)]" />
      </motion.div>

      {/* Basket stage: 16:9, pinned bottom-center. Width is a share of the
          viewport (larger on narrow/portrait screens, where the sides crop)
          but never taller than ~62% of the viewport height, which is what
          keeps ultra-wide and short landscape screens from blowing it up. */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 aspect-video w-[min(140vw,110svh)] sm:w-[min(115vw,110svh)] md:w-[min(100vw,110svh)] lg:w-[min(83vw,110svh)]">
        <motion.div className="absolute inset-0 z-10" style={{ y: basketY }}>
          <Image
            src="/images/basket-back.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 83vw, 140vw"
            className="object-contain"
          />
        </motion.div>

        <motion.div className="absolute inset-0 z-20" style={{ y: cookiesY }}>
          {cookies.map((cookie, i) => (
            <HeroCookie
              key={cookie.src}
              cookie={cookie}
              index={i}
              scrollY={scrollY}
            />
          ))}
        </motion.div>

        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{ y: basketY }}
        >
          <Image
            src="/images/basket-front.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 83vw, 140vw"
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Logo, tagline, CTAs */}
      <motion.div
        className="relative z-40 flex flex-col items-center px-6 pt-[clamp(5.5rem,13svh,9rem)] text-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-video w-[min(78vw,460px,58svh)]"
        >
          <Image
            src="/images/banners/Glow Bake.png"
            alt="Glow Bake — So Sweet"
            fill
            priority
            sizes="(min-width: 640px) 460px, 78vw"
            className="object-contain"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-1 max-w-md text-sm sm:text-base md:text-lg font-medium text-stone-700 text-balance"
        >
          Small-batch cookies, handmade every week with love.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/#menu"
            className="rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/25 transition hover:-translate-y-0.5 hover:bg-pink-700 hover:shadow-xl hover:shadow-pink-600/30"
          >
            See this week&apos;s menu
          </Link>
          <Link
            href="/#about"
            className="rounded-full border border-stone-900/10 bg-white/70 px-6 py-3 text-sm font-semibold text-stone-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
          >
            Our story
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#about"
        aria-label="Scroll to learn more"
        className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white/80 p-2 text-pink-600 shadow-md backdrop-blur"
        style={{ opacity: contentOpacity }}
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5" />
      </motion.a>
    </section>
  );
}
