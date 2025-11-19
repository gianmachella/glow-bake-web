"use client";

import { AnimatePresence, motion } from "framer-motion";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [openCosts, setOpenCosts] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/cookies", label: "Cookies" },
    { href: "/dashboard/delivery-settings", label: "Delivery Settings" },
    { href: "/dashboard/sales", label: "Sales" },
    { href: "/dashboard/sales/week", label: "Weekly Sales" },
    { href: "/dashboard/customers", label: "Customers" },
    { href: "/dashboard/expenses", label: "Expenses" },
  ];

  const costsLinks = [
    { href: "/dashboard/ingredient-table", label: "Inventory" },
    { href: "/dashboard/doughs", label: "Base Doughs" },
    { href: "/dashboard/dough-inventory", label: "Doughs Inventory" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-sm border-r border-pink-200 p-6 flex flex-col shadow-xl">
        <img
          src="/images/banners/Glow Bake.png"
          alt="Glow Bake Text"
          className="h-16 w-auto mb-12 mx-auto drop-shadow-sm"
        />

        <nav className="flex flex-col space-y-2 flex-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <motion.div
                key={link.href}
                whileHover={{ scale: 1.02, x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  href={link.href}
                  className={`block py-2.5 px-4 rounded-xl text-sm font-medium transition-colors duration-300 ${
                    active
                      ? "bg-pink-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            );
          })}

          {/* Submenú Costos */}
          <div>
            <button
              onClick={() => setOpenCosts(!openCosts)}
              className={`w-full flex justify-between items-center py-2.5 px-4 rounded-xl text-sm font-medium transition-colors duration-300 ${
                pathname.startsWith("/dashboard/ingredient-table") ||
                pathname.startsWith("/dashboard/doughs") ||
                pathname.startsWith("/dashboard/dough-inventory")
                  ? "bg-pink-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
              }`}
            >
              <span>Costs</span>
              <motion.span animate={{ rotate: openCosts ? 90 : 0 }}>
                ▶
              </motion.span>
            </button>

            <AnimatePresence>
              {openCosts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-6 mt-2 flex flex-col space-y-1"
                >
                  {costsLinks.map((link) => {
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block py-2 px-3 rounded-lg text-sm transition-colors duration-300 ${
                          active
                            ? "bg-pink-200 text-pink-700 font-semibold"
                            : "text-gray-600 hover:bg-pink-100 hover:text-pink-600"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Logout */}
        <motion.button
          onClick={() => signOut({ callbackUrl: "/login" })}
          whileHover={{ scale: 1.05, x: 6 }}
          whileTap={{ scale: 0.95 }}
          className="mt-auto flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </motion.button>
        <p className="text-black text-sm">Created By Gian Machella</p>
      </aside>

      {/* Main content con padding a la izquierda para no tapar el sidebar */}
      <main className="flex-1 p-10 h-screen overflow-y-auto ml-64">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
