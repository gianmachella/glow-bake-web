"use client";

import CookieCard from "./CookieCard";
import CookieModal from "./CookieModal";
import { useState } from "react";

const cookies = [
  {
    id: "smores",
    name: "S’mores Cookie",
    price: 6,
    image: "/images/cookies/smores.png",
    images: ["/images/cookies/smores.png", "/images/cookies/smores-cut.png"],
    description:
      "Campfire vibes in every bite – gooey marshmallow, rich chocolate, and golden graham bliss.",
  },
  {
    id: "pecan",
    name: "Pecan Pie Cookie",
    price: 7,
    image: "/images/cookies/pecanPie.png",
    images: ["/images/cookies/pecanPie.png", "/images/cookies/pecan-cut.png"],
    description:
      "Inspired by the South’s most iconic dessert – buttery, nutty, and irresistibly rich.",
  },
  {
    id: "cinnamon",
    name: "Cinnamon Rolls Cookie",
    price: 7,
    image: "/images/cookies/cinnamonRoll.png",
    images: [
      "/images/cookies/cinnamonRoll.png",
      "/images/cookies/cinnamon-cut.png",
    ],
    description:
      "Cinnamon-swirled heaven – soft, sweet, and drizzled with love.",
  },
  {
    id: "birthday",
    name: "Birthday Cake Cookie",
    price: 6,
    image: "/images/cookies/birthdayCake.png",
    images: [
      "/images/cookies/birthdayCake.png",
      "/images/cookies/birthdaycake-cut.png",
    ],
    description:
      "Like a party in your mouth – sweet vanilla, colorful sprinkles, and pure celebration.",
  },
  {
    id: "redVelvet",
    name: "Red Velvet Cookie",
    price: 7,
    image: "/images/cookies/redVelvet.png",
    images: [
      "/images/cookies/redVelvet.png",
      "/images/cookies/redVelvet-cut.png",
    ],
    description:
      "Velvety, chocolatey, and topped with a creamy twist – pure indulgence in red.",
  },
  {
    id: "nutella",
    name: "Nutella Cookie",
    price: 6,
    image: "/images/cookies/nutella.png",
    images: ["/images/cookies/nutella.png", "/images/cookies/nutella-cut.png"],
    description:
      "Stuffed with smooth, chocolate-hazelnut magic – it melts hearts and spoons.",
  },
  {
    id: "birthdayChoco",
    name: "Birthday Cake Chocolate Cookie",
    price: 6.5,
    image: "/images/cookies/birthdayCakeChoco.png",
    images: [
      "/images/cookies/birthdayCakeChoco.png",
      "/images/cookies/birthdaycakechoco-cut.png",
    ],
    description:
      "Crispy outside, gooey inside – a bold NYC-style classic packed with chunky chocolate dreams.",
  },
  {
    id: "penautbutter",
    name: "Peanut Butter & Jelly Cookie",
    price: 7,
    image: "/images/cookies/penautbutterjelly.png",
    images: [
      "/images/cookies/penautbutterjelly.png",
      "/images/cookies/penautbutter-cut.png",
    ],
    description: "Your childhood sandwich, reimagined as a cookie.",
  },

  {
    id: "big-box",
    name: "Big Box of Cookies",
    price: 49,
    image: "/images/cookies/bigbox.png",
    images: ["/images/cookies/bigbox.png"],
    description:
      "A cookie lover’s dream! 🍪 A deluxe box with 8 cookies, one of each flavor — perfect for sharing, gifting, or treating yourself like royalty.",
  },
  {
    id: "cookie & cream",
    name: "Cookie & Cream",
    price: 7,
    image: "/images/cookies/cookiecream.png",
    images: [
      "/images/cookies/cookiecream.png",
      "/images/cookies/cookiecream-cut.png",
    ],
    new: true,
    description:
      "A soft, chewy cookie packed with crushed Oreos and creamy white chocolate chips. Cookies & cream, but make it dreamy. 😍🍪",
  },
  {
    id: "luki cookie",
    name: '"Luki" Cookie (M&Ms)',
    price: 6,
    image: "/images/cookies/mms.png",
    images: ["/images/cookies/mms.png", "/images/cookies/mms-cut.png"],
    new: true,
    description:
      "The Luki Cookie is inspired by my son Luca’s favorite treat – soft, chewy, and packed with colorful M&Ms for a burst of joy in every bite. Made with love, approved by kids (and grown-ups too!).",
  },
];

export default function MenuSection() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="menu" className="w-full px-6 py-20 bg-white">
      <h2 className="text-center text-3xl md:text-5xl font-script text-pink-700 mb-12">
        Our Cookies
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {cookies.map((cookie, index) => (
          <CookieCard
            key={cookie.id}
            cookie={cookie}
            index={index}
            onClick={() => setSelected(cookie)}
          />
        ))}
      </div>

      {selected && (
        <CookieModal cookie={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
