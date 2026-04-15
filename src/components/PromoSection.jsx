"use client";

import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PromoSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/promotions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "You're all set!",
          text: "Check your inbox! We've sent your QR coupon for the Lucas Farmers Market.",
          confirmButtonColor: "#ec4899",
        });
        setEmail("");
      } else {
        Swal.fire({
          icon: "info",
          title: "Note",
          text: data.error || "Something went wrong",
          confirmButtonColor: "#ec4899",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "We couldn't process your request. Please try again later.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-pink-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-40 h-40 bg-pink-200 rounded-full blur-[80px] opacity-40"></div>
        <div className="absolute bottom-1/4 -right-10 w-52 h-52 bg-pink-300 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-14 rounded-[3rem] shadow-2xl border border-pink-100 text-center"
        >
          <header className="mb-8">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Limited Time Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-pink-600 mb-4 italic tracking-tight">
              Exclusive Market Promo!
            </h2>
            <p className="text-gray-700 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Visiting us at the{" "}
              <span className="font-bold text-gray-900">
                Lucas Farmers Market
              </span>
              ? Claim your discount now!
            </p>
          </header>

          <div className="bg-pink-500 text-white py-3 px-6 rounded-2xl inline-block mb-10 shadow-lg shadow-pink-200">
            <p className="text-2xl md:text-3xl font-black italic">
              $1 OFF{" "}
              <span className="text-lg font-normal not-italic text-pink-100">
                per cookie
              </span>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 justify-center items-stretch mb-8"
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 text-xl">
                ✉️
              </span>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 pl-12 bg-white border-2 border-pink-200 placeholder:text-gray-500 text-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 rounded-2xl outline-none transition-all text-lg shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all transform active:scale-95 ${
                loading
                  ? "bg-pink-300 cursor-not-allowed"
                  : "bg-pink-500 hover:bg-pink-600 hover:shadow-pink-300"
              }`}
            >
              {loading ? "SENDING..." : "GET MY QR CODE"}
            </button>
          </form>

          {/* Critical Disclaimer */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-center gap-3">
            <span className="text-2xl">📍</span>
            <p className="text-sm text-gray-600 font-medium leading-tight">
              <span className="text-pink-600 font-bold uppercase tracking-tighter">
                In-Person Only:
              </span>{" "}
              This coupon is{" "}
              <span className="text-gray-900 font-bold underline">
                only valid for redemption
              </span>{" "}
              at our physical booth during the Lucas Farmers Market. Not valid
              for online orders.
            </p>
          </div>

          <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            GlowBake &bull; Lucas, Texas &bull; One use per customer
          </p>
        </motion.div>
      </div>
    </section>
  );
}
