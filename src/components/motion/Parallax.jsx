"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Moves its children vertically as the wrapper scrolls through the viewport:
// `-distance` px when the wrapper's top enters at the bottom of the screen,
// `+distance` px when its bottom leaves at the top. Positive distance drifts
// slower than the page (background feel), negative drifts faster (foreground).
// Driven by framer-motion motion values, so scrolling never re-renders React.
export default function Parallax({ distance = 60, className = "", children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
