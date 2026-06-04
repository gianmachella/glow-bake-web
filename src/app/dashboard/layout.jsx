"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Cookie,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Receipt,
  Store,
  TicketPercent,
  Truck,
  Users,
} from "lucide-react";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCosts, setOpenCosts] = useState(false);

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { href: "/dashboard/pos", label: "POS System", icon: <Store size={20} /> }, // Nuevo
    {
      href: "/dashboard/cookies",
      label: "Cookies",
      icon: <Cookie size={20} />,
    },
    {
      href: "/dashboard/delivery-settings",
      label: "Delivery",
      icon: <Truck size={20} />,
    },
    {
      href: "/dashboard/sales",
      label: "Sales",
      icon: <CircleDollarSign size={20} />,
    },
    {
      href: "/dashboard/sales/week",
      label: "Weekly Sales",
      icon: <CalendarDays size={20} />,
    },
    {
      href: "/dashboard/customers",
      label: "Customers",
      icon: <Users size={20} />,
    },
    {
      href: "/dashboard/expenses",
      label: "Expenses",
      icon: <Receipt size={20} />,
    },
    {
      href: "/dashboard/promotions",
      label: "Promotions",
      icon: <TicketPercent size={20} />,
    },
    {
      href: "/dashboard/announcements",
      label: "Announcements",
      icon: <Megaphone size={20} />,
    },
  ];

  const costsLinks = [
    { href: "/dashboard/ingredient-table", label: "Inventory" },
    { href: "/dashboard/doughs", label: "Base Doughs" },
    { href: "/dashboard/dough-inventory", label: "Doughs Inventory" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 transition-all duration-300">
      <motion.aside
        animate={{ width: isCollapsed ? 85 : 256 }}
        className="fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-md border-r border-pink-200 p-4 flex flex-col shadow-xl z-50 overflow-hidden"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-0 top-10 bg-pink-500 text-white p-1 rounded-l-md shadow-lg hover:bg-pink-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Logo */}
        <div className="h-16 flex items-center justify-center mb-8">
          {isCollapsed ? (
            <span className="text-2xl font-black text-pink-500 italic">GB</span>
          ) : (
            <img
              src="/images/banners/Glow Bake.png"
              alt="Glow Bake"
              className="h-12 w-auto drop-shadow-sm"
            />
          )}
        </div>

        <nav className="flex flex-col space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
                      : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  <div className="min-w-[20px]">{link.icon}</div>
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{link.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Submenú Costos */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOpenCosts(!openCosts);
              }}
              className={`w-full flex items-center gap-4 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                pathname.includes("ingredient") || pathname.includes("dough")
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-600 hover:bg-pink-50"
              }`}
            >
              <div className="min-w-[20px]">
                <Package size={20} />
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Costs</span>
                  <motion.span animate={{ rotate: openCosts ? 90 : 0 }}>
                    <ChevronRight size={14} />
                  </motion.span>
                </>
              )}
            </button>

            <AnimatePresence>
              {openCosts && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-10 mt-1 flex flex-col space-y-1"
                >
                  {costsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block py-2 px-3 rounded-lg text-xs transition-colors ${
                        pathname === link.href
                          ? "text-pink-600 font-bold"
                          : "text-gray-500 hover:text-pink-500"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-pink-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-4 py-3 px-4 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <div className="min-w-[20px]">
              <LogOut size={20} />
            </div>
            {!isCollapsed && <span>Logout</span>}
          </button>
          {!isCollapsed && (
            <p className="text-[10px] text-gray-400 mt-4 text-center uppercase tracking-widest font-bold">
              By Gian Machella
            </p>
          )}
        </div>
      </motion.aside>

      {/* Main content dinámico */}
      <motion.main
        animate={{ marginLeft: isCollapsed ? 85 : 256 }}
        className="flex-1 p-6 md:p-10 h-screen overflow-y-auto transition-all duration-300"
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
