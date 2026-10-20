import Image from "next/image";
import Link from "next/link";

import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";

// Closing call-to-action band, with two cookies floating past at different
// parallax speeds on either side.
export default function OrderCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 px-6 py-24 md:py-32 text-white">
      <Parallax
        distance={-110}
        className="pointer-events-none absolute -left-16 top-6 -z-10 w-44 md:-left-10 md:w-64 opacity-90"
      >
        <div className="relative aspect-square -rotate-12">
          <Image src="/images/cookies/cookie-2.png" alt="" fill sizes="16rem" className="object-contain drop-shadow-2xl" />
        </div>
      </Parallax>
      <Parallax
        distance={-60}
        className="pointer-events-none absolute -right-14 bottom-0 -z-10 w-40 md:-right-6 md:w-56 opacity-90"
      >
        <div className="relative aspect-square rotate-12">
          <Image src="/images/cookies/cookie-5.png" alt="" fill sizes="14rem" className="object-contain drop-shadow-2xl" />
        </div>
      </Parallax>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_60%)]" />

      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="font-script text-3xl md:text-4xl text-pink-100">
          Fresh batches every week
        </p>
        <h2 className="mt-2 font-display text-4xl md:text-6xl font-semibold tracking-tight text-balance">
          Grab yours before they’re gone
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base md:text-lg text-pink-50/90 text-pretty">
          Every batch is small and baked to order. Planning a party, a gift box
          or an event? We’d love to bake something special for you.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/#menu"
            className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-pink-700 shadow-lg shadow-pink-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Shop this week’s menu
          </Link>
          <Link
            href="/#contact"
            className="rounded-full border border-white/50 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            Request a custom order
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
