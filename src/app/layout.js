import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import { Fraunces, Great_Vibes, Inter } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import Providers from "@/components/Providers";

// Exposed as CSS variables and mapped to Tailwind's font-sans / font-display /
// font-script utilities in globals.css.
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-great-vibes",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Glow Bake - So Sweet",
  description: "Delicious handcrafted cookies made with love.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${greatVibes.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <CartProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
