"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white fixed top-0 left-0 border-b shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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

        <div className="flex gap-4 items-center">
          <a
            href="#about"
            className="text-sm text-gray-700 hover:text-pink-600"
          >
            About
          </a>
          <a href="#menu" className="text-sm text-gray-700 hover:text-pink-600">
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
          <Link
            href="/cart"
            className="text-sm text-gray-700 hover:text-pink-600"
          >
            <img
              src="/images/basket-empty.png"
              alt="Cart"
              className="h-8 w-auto transition-transform duration-200 hover:scale-105"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
