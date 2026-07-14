"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const STORAGE_KEY = "glowbake_seen_announcements";

function getSeenIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function markAsSeen(id) {
  const seen = getSeenIds();
  if (!seen.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, id]));
  }
}

export default function AnnouncementPopup() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    async function fetchAndFilter() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) return;
        const all = await res.json();
        const seen = getSeenIds();

        const toShow = all.filter((a) => a.alwaysShow || !seen.includes(a.id));
        if (toShow.length > 0) {
          setQueue(toShow.slice(1));
          setCurrent(toShow[0]);
        }
      } catch {
        // silently fail — announcements are non-critical
      }
    }
    fetchAndFilter();
  }, []);

  function dismiss() {
    if (!current.alwaysShow) markAsSeen(current.id);

    if (queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(queue.slice(1));
    } else {
      setCurrent(null);
    }
  }

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 hover:bg-pink-50 text-gray-500 hover:text-pink-600 transition-colors shadow"
            >
              <X size={18} />
            </button>

            {/* Image */}
            {current.image && (
              <div className="relative w-full h-52 overflow-hidden">
                <Image
                  src={current.image}
                  alt={current.title}
                  fill
                  sizes="(min-width: 640px) 28rem, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-7">
              {/* GlowBake badge */}
              <div className="inline-block mb-3 px-3 py-1 bg-pink-100 text-pink-600 text-xs font-bold rounded-full uppercase tracking-widest">
                Glow Bake
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-3 leading-tight">
                {current.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {current.content}
              </p>

              <button
                onClick={dismiss}
                className="mt-6 w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-pink-200"
              >
                Got it!
              </button>
            </div>

            {/* Queue indicator */}
            {queue.length > 0 && (
              <p className="text-center text-xs text-gray-400 pb-4">
                {queue.length} more announcement{queue.length > 1 ? "s" : ""} after this
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
