"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok && data.success) {
      router.push("/dashboard");
    } else {
      setError(data.error || "⚠️ Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-200">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm space-y-6 border border-pink-100"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold text-center text-gray-900"
        >
          Welcome!
        </motion.h1>
        <p className="text-center text-gray-600 text-sm">Sign in to continue</p>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-center text-sm font-medium"
          >
            {error}
          </motion.p>
        )}

        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none text-gray-900"
            required
          />
        </div>

        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none text-gray-900"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold p-3 rounded-xl shadow-lg hover:from-pink-600 hover:to-pink-700 transition-all"
        >
          Sign in
        </motion.button>

        <p className="text-xs text-center text-gray-500">
          © {new Date().getFullYear()} Glow Bake — All rights reserved
        </p>
      </motion.form>
    </div>
  );
}
