"use client";

import { AnimatePresence, motion } from "framer-motion";

import Image from "next/image";

export default function Loading({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo con animación de giro */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: [0.4, 0, 0.2, 1], // acelera al inicio y frena al final
              }}
            >
              <Image
                src="/images/logo-circle.png"
                alt="Loading Logo"
                width={120}
                height={120}
                priority
              />
            </motion.div>

            {/* Texto opcional */}
            <motion.p
              className="mt-6 text-pink-200 font-semibold text-lg"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Loading...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
