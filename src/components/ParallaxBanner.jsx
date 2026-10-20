// src/components/ParallaxBanner.jsx

import Image from "next/image";

import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";

const objectPositions = {
  left: "object-left",
  right: "object-right",
  center: "object-center",
};

// Full-bleed image strip with a scroll-driven parallax drift. Uses a
// transform (via <Parallax>) rather than `background-attachment: fixed`,
// which iOS Safari ignores and which stutters on most mobile browsers.
// The image layer is taller than the strip so the drift never shows an edge.
export default function ParallaxBanner({ image, position = "center", caption }) {
  return (
    <section className="relative h-[180px] md:h-[260px] overflow-hidden bg-pink-100">
      <Parallax distance={50} className="absolute inset-x-0 -top-16 -bottom-16">
        <div className="relative h-full w-full">
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            className={`object-cover ${objectPositions[position] ?? objectPositions.center}`}
          />
        </div>
      </Parallax>

      {caption && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-stone-900/45 via-stone-900/25 to-stone-900/45 px-6">
          <Reveal
            as="p"
            className="font-display text-2xl md:text-4xl lg:text-5xl italic text-white text-center text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
          >
            {caption}
          </Reveal>
        </div>
      )}
    </section>
  );
}
