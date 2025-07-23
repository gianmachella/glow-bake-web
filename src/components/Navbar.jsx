"use client";

import { Menu, X } from "lucide-react";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full bg-white fixed top-0 left-0 border-b shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo-gb.png"
            alt="Glow Bake Logo"
            className="h-8 w-auto"
          />
          <img
            src="/images/banners/Glow Bake.png"
            alt="Glow Bake Logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* Cesta y menú */}
        <div className="flex items-center gap-4">
          {/* Botón hamburguesa solo en mobile */}
          <button onClick={toggleMenu} className="md:hidden">
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>

          {/* Enlaces visibles solo en desktop */}
          <div className="hidden md:flex gap-4 items-center">
            <a
              href="#about"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              About
            </a>
            <a
              href="#menu"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              Menu
            </a>
            <a
              href="#testimonials"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              Testimonials
            </a>
            <a
              href="#contact"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              Contact Us
            </a>
          </div>
          {/* Cart siempre visible */}
          <Link href="/cart">
            <img
              src="/images/basket-empty.png"
              alt="Cart"
              className="h-8 w-auto transition-transform duration-200 hover:scale-210"
            />
          </Link>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <a
            href="#about"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            About
          </a>
          <a
            href="#menu"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            Menu
          </a>
          <a
            href="#testimonials"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            Testimonials
          </a>
          <a
            href="#contact"
            onClick={closeMenu}
            className="block text-sm text-gray-700 hover:text-pink-600"
          >
            Contact Us
          </a>
        </div>
      )}
    </nav>
  );
}
