"use client";

import { Menu, X } from "lucide-react";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full bg-white fixed top-0 left-0 border-b shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative">
          <img
            src="/images/logo-gb.png"
            alt="Glow Bake Logo"
            className="h-8 w-auto hover:scale-110 transition-transform duration-200"
          />
          <img
            src="/images/banners/Glow Bake.png"
            alt="Glow Bake Text"
            className="h-8 w-auto"
          />
        </Link>

        {/* Cesta + menú */}
        <div className="flex items-center gap-4">
          {/* Links desktop */}
          <div className="hidden md:flex gap-4 items-center">
            <Link
              href="/#about"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              About
            </Link>
            <Link
              href="/#menu"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              Menu
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              Testimonials
            </Link>
            <Link
              href="/#contact"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              Contact Us
            </Link>
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <img
              src={
                cartItems.length > 0
                  ? "/images/basket-full.png"
                  : "/images/basket-empty.png"
              }
              alt="Cart"
              className="h-8 w-auto transition-transform duration-200 hover:scale-105"
            />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-3 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Botón hamburguesa solo mobile */}
          <button onClick={toggleMenu} className="md:hidden">
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white shadow">
          <Link
            href="/#about"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            About
          </Link>
          <Link
            href="/#menu"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            Menu
          </Link>
          <Link
            href="/#testimonials"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            Testimonials
          </Link>
          <Link
            href="/#contact"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  );
}
