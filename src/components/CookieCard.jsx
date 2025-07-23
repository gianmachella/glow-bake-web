import { motion, useAnimation } from "framer-motion";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function CookieCard({ cookie, onClick, index }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 1.2, delay: index * 0.4 }}
      className="cursor-pointer bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-105"
      onClick={onClick}
    >
      <img
        src={cookie.image}
        alt={cookie.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold text-black text-center">
        {cookie.name}
      </h3>
    </motion.div>
  );
}
