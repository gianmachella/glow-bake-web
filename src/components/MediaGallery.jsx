"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function MediaGallery() {
  const [items, setItems] = useState(null); // null = loading, [] = nothing to show
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery/active");
        if (!res.ok) throw new Error("Failed to load gallery");
        setItems(await res.json());
      } catch (err) {
        console.error("❌ Error loading gallery:", err);
        setItems([]);
      }
    }
    fetchGallery();
  }, []);

  // Crucial rule: no published media → the section doesn't exist on the page.
  if (!items || items.length === 0) return null;

  const openAt = (index) => setLightboxIndex(index);
  const close = () => setLightboxIndex(null);
  const showNext = () => setLightboxIndex((i) => (i + 1) % items.length);
  const showPrev = () => setLightboxIndex((i) => (i - 1 + items.length) % items.length);

  return (
    <section className="w-full px-6 py-20 bg-gradient-to-b from-white to-pink-50">
      <h2 className="text-center text-3xl md:text-5xl font-script text-pink-700 mb-12">
        From Our Kitchen
      </h2>

      <div className="max-w-6xl mx-auto columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => openAt(index)}
            className="group relative block w-full mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          >
            {item.type === "VIDEO" ? (
              <div className="relative aspect-video bg-gray-900">
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-pink-600 ml-0.5" fill="currentColor" />
                  </span>
                </div>
              </div>
            ) : (
              <img
                src={item.url}
                alt={item.caption || "Glow Bake gallery photo"}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}

            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium line-clamp-2 text-left">
                  {item.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          item={items[lightboxIndex]}
          onClose={close}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </section>
  );
}

function Lightbox({ item, onClose, onNext, onPrev }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        aria-label="Close"
      >
        <X className="w-8 h-8" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-2 sm:left-6 text-white/80 hover:text-white z-10 p-2"
        aria-label="Previous"
      >
        <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
      </button>

      <div
        className="max-w-4xl w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "VIDEO" ? (
          <video
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-h-[80vh] w-full rounded-lg bg-black"
          />
        ) : (
          <img
            src={item.url}
            alt={item.caption || "Glow Bake gallery photo"}
            className="max-h-[80vh] w-full object-contain rounded-lg"
          />
        )}
        {item.caption && (
          <p className="text-white/90 text-sm mt-4 text-center">{item.caption}</p>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-2 sm:right-6 text-white/80 hover:text-white z-10 p-2"
        aria-label="Next"
      >
        <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
      </button>
    </div>
  );
}
