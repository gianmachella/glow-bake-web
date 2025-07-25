"use client";

import { useEffect, useState } from "react";

import Swal from "sweetalert2";

const cookies = [
  {
    src: "/images/cookies/cookie-1.png",
    left: "20%",
    bottom: "70px",
    mobileLeft: "10%",
    mobileBottom: "20px",
  },
  {
    src: "/images/cookies/cookie-2.png",
    left: "48%",
    bottom: "140px",
    mobileLeft: "45%",
    mobileBottom: "100px",
  },
  {
    src: "/images/cookies/cookie-3.png",
    left: "60%",
    bottom: "100px",
    mobileLeft: "65%",
    mobileBottom: "60px",
  },
  {
    src: "/images/cookies/cookie-4.png",
    left: "32%",
    bottom: "180px",
    mobileLeft: "30%",
    mobileBottom: "110px",
  },
  {
    src: "/images/cookies/cookie-5.png",
    left: "50%",
    bottom: "80px",
    mobileLeft: "50%",
    mobileBottom: "40px",
  },
  {
    src: "/images/cookies/cookie-6.png",
    left: "30%",
    bottom: "70px",
    mobileLeft: "20%",
    mobileBottom: "30px",
  },
  {
    src: "/images/cookies/cookie-7.png",
    left: "40%",
    bottom: "70px",
    mobileLeft: "35%",
    mobileBottom: "30px",
  },
];

export default function Hero() {
  const [offsetY, setOffsetY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    Swal.fire({
      title:
        '<img src="/images/banners/Glow Bake.png" alt="Glow Bake Logo" style="max-width: 200px; margin-bottom: 1rem;" />',
      html: `
        <h2 style="margin-bottom: 0.5rem;">Remember!</h2>
        <p style="text-align: left;">
          Orders are accepted from <b>Monday to Wednesday</b> for delivery on <b>Thursday and Friday</b>.<br><br>
          Orders placed on <b>Thursday</b> will be delivered on <b>Friday</b>.<br><br>
          Orders placed on <b>Friday</b> will be delivered the following week.<br><br>
          For special orders, please contact us first.
        </p>
      `,
      confirmButtonText: "Got it!",
      width: 500,
      padding: "1.5rem",
      showCloseButton: true,
    });
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="relative w-full h-screen overflow-hidden">
        {/* Tu contenido de Hero */}
      </div>
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: "url('/images/banners/kitchen-bg.png')",
          transform: `translateY(${offsetY * 0.2}px)`,
        }}
      />

      {/* Cesta Back */}
      <div
        className="absolute bottom-0 w-full flex justify-center z-10"
        style={{
          transform: `translateY(${offsetY * 0.6}px)`,
        }}
      >
        <img
          src="/images/basket-back.png"
          alt="Basket Back"
          className="w-[500px] sm:w-[700px] md:w-[800px] lg:w-[1200px] object-contain max-w-none"
        />
      </div>

      {/* Galletas */}
      {cookies.map((cookie, i) => {
        const baseSize = isMobile ? 160 : i === 3 ? 350 : 350;
        const extraBottom = isMobile ? -30 : 0;

        return (
          <img
            key={i}
            src={cookie.src}
            alt={`cookie-${i}`}
            className="absolute object-contain pointer-events-none z-20"
            style={{
              left: isMobile ? cookie.mobileLeft : cookie.left,
              bottom: isMobile ? cookie.mobileBottom : cookie.bottom,
              width: `${baseSize}px`,
              transform: `translateY(-${offsetY * 0.4}px) rotate(${
                offsetY * 0.1 * (i % 2 === 0 ? 1 : -1)
              }deg)`,
              transition: "transform 0.1s ease-out",
            }}
          />
        );
      })}

      {/* Cesta Front */}
      <div
        className="absolute bottom-0 w-full flex justify-center z-30"
        style={{
          transform: `translateY(${offsetY * 0.6}px)`,
        }}
      >
        <img
          src="/images/basket-front.png"
          alt="Basket Front"
          className="w-[500px] sm:w-[700px] md:w-[800px] lg:w-[1200px] object-contain max-w-none"
        />
      </div>

      {/* Logo Glow Bake */}
      <div
        className="absolute inset-0 flex items-start justify-center pt-20 z-40"
        style={{
          transform: `translateY(${offsetY * 0.4}px)`,
        }}
      >
        <img
          src="/images/banners/Glow Bake.png"
          alt="Glow Bake Logo"
          className="w-[600px] md:w-[800px] lg:w-[500px] object-contain"
        />
      </div>
    </div>
  );
}
