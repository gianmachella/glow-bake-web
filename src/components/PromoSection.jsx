"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

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

function WebPromotionBanner({ promotion }) {
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

      <header>
        <h2 className="text-4xl md:text-5xl font-black text-pink-600 mb-4 italic tracking-tight">
          {promotion.name}
        </h2>
        {promotion.description && (
          <p className="text-gray-700 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            {promotion.description}
          </p>
        )}
      </header>
    </motion.div>
  );
}

export default function PromoSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [webPromotions, setWebPromotions] = useState([]);
  const [loaded, setLoaded] = useState(false);

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
          <WebPromotionBanner key={promotion.id} promotion={promotion} />
        ))}
      </div>
    </section>
  );
}
