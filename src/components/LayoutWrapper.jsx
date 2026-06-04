"use client";

import AnnouncementPopup from "@/components/AnnouncementPopup";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname.startsWith("/login");

  return (
    <>
      {!isDashboard && <Navbar />}
      {!isDashboard && !isLogin && <AnnouncementPopup />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
}
