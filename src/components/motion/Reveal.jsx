"use client";

import { motion } from "framer-motion";

// Fades + lifts its children in the first time they scroll into view.
// `delay` (seconds) staggers siblings; `as` picks the rendered element; any
// other props (e.g. onSubmit on a form) are passed through to it.
export default function Reveal({
  as = "div",
  delay = 0,
  y = 28,
  className = "",
  children,
  ...rest
}) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
