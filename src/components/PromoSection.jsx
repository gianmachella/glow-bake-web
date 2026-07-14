"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Copy, Check, X } from "lucide-react";

function DiscountBadge({ discountType, discountValue }) {
  const label =
    discountType === "PERCENTAGE" ? `${discountValue}% OFF` : `$${discountValue} OFF`;
  return (
    <div className="bg-pink-500 text-white py-3 px-6 rounded-2xl inline-block mb-6 shadow-lg shadow-pink-200">
      <p className="text-2xl md:text-3xl font-black italic">{label}</p>
    </div>
  );
}

function CampaignBanner({ campaign }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-14 rounded-[3rem] shadow-2xl border border-pink-100 text-center"
    >
      {campaign.image && (
        <div className="relative w-full h-48 md:h-56 mb-8 rounded-3xl overflow-hidden">
          <Image
            src={campaign.image}
            alt={campaign.name}
            fill
            sizes="(min-width: 768px) 48rem, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <header className="mb-6">
        <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Limited Time Offer
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-pink-600 mb-4 italic tracking-tight">
          {campaign.name}
        </h2>
        {campaign.description && (
          <p className="text-gray-700 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            {campaign.description}
          </p>
        )}
      </header>

      <DiscountBadge
        discountType={campaign.discountType}
        discountValue={campaign.discountValue}
      />

      {campaign.couponCode && (
        <p className="text-sm text-gray-600 font-medium">
          Use code{" "}
          <span className="font-mono font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-lg">
            {campaign.couponCode}
          </span>
        </p>
      )}
    </motion.div>
  );
}

function ClaimPromotionModal({ promotion, onClose }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { code, used }
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/web-promotions/${promotion.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Could not process your request. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select/copy the text manually
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-7"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 hover:bg-pink-50 text-gray-500 hover:text-pink-600 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">{promotion.name}</h2>
        {promotion.description && (
          <p className="text-gray-600 text-sm mb-5">{promotion.description}</p>
        )}

        {!result ? (
          <>
            <p className="text-xs text-gray-500 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2 mb-5">
              Enter your name and email to receive a unique one-time discount code.
              Copy your code and enter it at checkout — it can only be used once per
              person.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-200 disabled:opacity-60"
              >
                {loading ? "Claiming..." : "Claim My Discount"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            {result.used ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                You already claimed this promotion and your code has been used.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Here&apos;s your unique code — we also emailed it to you. Copy it and
                enter it at checkout to get your discount — it can only be used once.
              </p>
            )}
            <div className="flex items-center justify-center gap-2 bg-pink-50 border border-pink-200 rounded-2xl px-4 py-4 mb-2">
              <span className="font-mono font-bold text-lg text-pink-600 tracking-wider">
                {result.code}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-white hover:bg-pink-100 text-pink-600 transition-colors shadow-sm"
                title="Copy code"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mb-2">Copied!</p>}
            {promotion.customInstructions && (
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-2 text-left whitespace-pre-wrap">
                {promotion.customInstructions}
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function WebPromotionBanner({ promotion, onClaim }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-14 rounded-[3rem] shadow-2xl border border-pink-100 text-center"
    >
      {promotion.image && (
        <div className="relative w-full h-48 md:h-56 mb-8 rounded-3xl overflow-hidden">
          <Image
            src={promotion.image}
            alt={promotion.name}
            fill
            sizes="(min-width: 768px) 48rem, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <header className="mb-6">
        <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Claim Your Discount
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-pink-600 mb-4 italic tracking-tight">
          {promotion.name}
        </h2>
        {promotion.description && (
          <p className="text-gray-700 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            {promotion.description}
          </p>
        )}
      </header>

      <DiscountBadge
        discountType={promotion.discountType}
        discountValue={promotion.discountValue}
      />

      <p className="text-sm text-gray-500 mb-6">
        {promotion.type === "VOLUME"
          ? `Buy ${promotion.minQuantity}+ ${promotion.cookieId ? promotion.cookie?.name || "cookies" : "cookies (any flavor)"} to unlock this offer`
          : promotion.cookieId
            ? `Applies to ${promotion.cookie?.name || "this cookie"}`
            : "Applies to every cookie"}
      </p>

      <button
        onClick={() => onClaim(promotion)}
        className="px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all transform active:scale-95 bg-pink-500 hover:bg-pink-600 hover:shadow-pink-300"
      >
        Claim My Discount Code
      </button>
    </motion.div>
  );
}

export default function PromoSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [webPromotions, setWebPromotions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    async function fetchActivePromotions() {
      try {
        const [campaignsRes, webPromosRes] = await Promise.all([
          fetch("/api/campaigns/active"),
          fetch("/api/web-promotions/active"),
        ]);
        if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
        if (webPromosRes.ok) setWebPromotions(await webPromosRes.json());
      } catch {
        // silently fail — promotions are non-critical
      } finally {
        setLoaded(true);
      }
    }
    fetchActivePromotions();
  }, []);

  if (!loaded || (campaigns.length === 0 && webPromotions.length === 0)) return null;

  return (
    <section
      id="promotions"
      className="py-24 bg-gradient-to-b from-white to-pink-50 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-40 h-40 bg-pink-200 rounded-full blur-[80px] opacity-40"></div>
        <div className="absolute bottom-1/4 -right-10 w-52 h-52 bg-pink-300 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 space-y-10">
        {campaigns.map((campaign) => (
          <CampaignBanner key={campaign.id} campaign={campaign} />
        ))}
        {webPromotions.map((promotion) => (
          <WebPromotionBanner key={promotion.id} promotion={promotion} onClaim={setClaiming} />
        ))}
      </div>

      <AnimatePresence>
        {claiming && (
          <ClaimPromotionModal promotion={claiming} onClose={() => setClaiming(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
