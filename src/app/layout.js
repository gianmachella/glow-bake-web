import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import { Great_Vibes } from "next/font/google";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Glow Bake - So Sweet",
  description: "Delicious handcrafted cookies made with love.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Happy+Monkey&display=swap"
          rel="stylesheet"
        />
      </head>

      <body style={{ fontFamily: "'Happy Monkey', cursive" }}>
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
