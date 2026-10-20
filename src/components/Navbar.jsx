"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#menu", label: "Menu" },
  { href: "/#promotions", label: "Promotions" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#contact", label: "Contact Us" },
];

export default function Navbar() {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  // Only flips state when crossing the threshold, so scrolling doesn't
  // re-render the navbar on every frame.
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    if (next !== scrolled) setScrolled(next);
  });

  // Transparent over the landing hero; frosted glass once scrolled, on any
  // other page, or while the mobile menu is open.
  const solid = scrolled || pathname !== "/" || isOpen;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-300 border-b ${
        solid
          ? "bg-white/80 backdrop-blur-xl border-stone-900/5 shadow-[0_8px_30px_-12px_rgba(68,34,20,0.15)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative">
          <Image
            src="/images/logo-gb.png"
            alt="Glow Bake Logo"
            width={100}
            height={100}
            className="h-9 w-auto hover:rotate-12 transition-transform duration-300"
          />
          <Image
            src="/images/banners/Glow Bake.png"
            alt="Glow Bake Text"
            width={178}
            height={100}
            className={`h-9 w-auto transition-opacity duration-300 ${
              solid ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>

        {/* Cesta + menú */}
        <div className="flex items-center gap-5">
          {/* Links desktop */}
          <div className="hidden md:flex gap-6 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-stone-700 hover:text-pink-600 transition-colors"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-pink-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative" aria-label="Cart">
            <Image
              src={
                cartItems.length > 0
                  ? "/images/basket-full.png"
                  : "/images/basket-empty.png"
              }
              alt="Cart"
              width={100}
              height={100}
              className="h-8 w-auto transition-transform duration-200 hover:scale-110"
            />
            <AnimatePresence>
              {cartItems.length > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-1 -right-3 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Botón hamburguesa solo mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-stone-700" />
            ) : (
              <Menu className="h-6 w-6 text-stone-700" />
            )}
          </button>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-pink-50 hover:text-pink-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
