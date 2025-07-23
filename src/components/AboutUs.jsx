"use client";

import { useEffect, useState } from "react";

export default function AboutUs() {
  const [offsetY, setOffsetY] = useState(0);
  const [speed, setSpeed] = useState(0.15);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset);
    };

    // Ajustar velocidad según tamaño de pantalla
    const updateSpeed = () => {
      setSpeed(window.innerWidth < 768 ? 0.3 : 0.15);
    };

    updateSpeed(); // inicial
    window.addEventListener("resize", updateSpeed);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", updateSpeed);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      id="about"
      className="relative w-full min-h-[2300px] md:min-h-0 pt-32 px-6 pb-20 bg-pink-50 overflow-hidden"
    >
      <h2 className="text-center text-3xl md:text-5xl font-script text-pink-700 mb-12">
        About Us
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Texto */}
        <div className="text-gray-700 text-base md:text-lg leading-relaxed text-justify space-y-6 pr-4">
          <p>
            Glow Bake – So Sweet was born from a love for baking and the desire
            to create meaningful moments through something as simple — and
            powerful — as a cookie.
          </p>
          <p>
            Behind every recipe, every soft center and crispy edge, is Eleana
            Machella — a passionate and dedicated pastry chef and baker. She
            studied and graduated from the renowned Eva Perón Gastronomic
            Institute in Buenos Aires, Argentina, where she honed her craft with
            discipline and heart.
          </p>
          <p>
            Eleana’s baking journey began long before Glow Bake, experimenting
            in her home kitchen, creating treats for friends, family, and
            community. Over time, what started as a hobby rooted in love became
            a calling. Her cookies are the result of years of learning,
            creativity, and a deep belief that food made with care can bring
            people together.
          </p>
          <p>
            At Glow Bake, Eleana personally selects every ingredient and pours
            herself into every batch. Whether it's a classic chocolate chip or a
            bold new flavor, each cookie is a little work of art — fresh,
            flavorful, and always made to spark joy.
          </p>
          <p>
            Glow Bake isn’t just about cookies. It’s about warmth. It’s about
            family. It’s about handmade happiness, baked daily by Eleana with
            love and purpose.
          </p>
          <img
            src="/images/sing.png"
            alt="Cookie Tower"
            className="w-[320px] md:w-[480px] lg:w-[400px] object-contain"
          />
        </div>

        {/* Imagen con parallax */}
        <div
          className="w-full flex justify-center z-10 mt-[-600px] md:mt-[-300px]"
          style={{ transform: `translateY(${offsetY * speed}px)` }}
        >
          <img
            src="/images/cookies/cookies-tower.png"
            alt="Cookie Tower"
            className="w-[320px] md:w-[480px] lg:w-[400px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
