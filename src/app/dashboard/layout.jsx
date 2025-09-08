"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }) {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/cookies", label: "Cookies" },
    { href: "/dashboard/sales", label: "Ventas" },
    { href: "/dashboard/customers", label: "Clientes" },
    { href: "/dashboard/expenses", label: "Gastos" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-white">
      {/* Sidebar */}
      <aside className="w-64 bg-pink-100 text-pink-400 p-6 flex flex-col shadow-lg">
        <img
          src="/images/banners/Glow Bake.png"
          alt="Glow Bake Text"
          className="h-16 w-auto mb-10 mx-auto"
        />
        <nav className="flex flex-col space-y-4">
          {links.map((link, i) => (
            <motion.div
              key={link.href}
              whileHover={{ scale: 1.05, x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={link.href}
                className="block py-2 px-3 rounded-lg hover:bg-pink-500 hover:text-white transition-colors duration-300 font-medium"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
