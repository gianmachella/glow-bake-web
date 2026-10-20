import Image from "next/image";

import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/motion/SectionHeading";

export default function AboutUs() {
  return (
    <section
      id="about"
      className="relative isolate overflow-hidden bg-pink-50 px-6 py-24 md:py-32"
    >
      {/* Soft background glows drifting at different speeds for depth */}
      <Parallax
        distance={120}
        className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80"
      >
        <div className="h-full w-full rounded-full bg-pink-200/60 blur-3xl" />
      </Parallax>
      <Parallax
        distance={-90}
        className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-96 w-96"
      >
        <div className="h-full w-full rounded-full bg-amber-100/70 blur-3xl" />
      </Parallax>

      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-[1.15fr_0.85fr] lg:gap-24">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Our story"
            title="Handmade happiness, one batch at a time"
            className="mb-10!"
          />

          <div className="space-y-5 text-base md:text-lg leading-relaxed text-stone-700 text-pretty">
            <Reveal as="p" delay={0.05}>
              Glow Bake – So Sweet was born from a love for baking and the
              desire to create meaningful moments through something as simple
              — and powerful — as a cookie.
            </Reveal>
            <Reveal as="p" delay={0.1}>
              Behind every recipe, every soft center and crispy edge, is{" "}
              <span className="font-semibold text-stone-900">
                Eleana Machella
              </span>{" "}
              — a passionate and dedicated pastry chef and baker. She studied
              and graduated from the renowned Eva Perón Gastronomic Institute
              in Buenos Aires, Argentina, where she honed her craft with
              discipline and heart.
            </Reveal>
            <Reveal as="p" delay={0.15}>
              Eleana’s baking journey began long before Glow Bake,
              experimenting in her home kitchen, creating treats for friends,
              family, and community. Over time, what started as a hobby rooted
              in love became a calling. Her cookies are the result of years of
              learning, creativity, and a deep belief that food made with care
              can bring people together.
            </Reveal>
            <Reveal as="p" delay={0.2}>
              At Glow Bake, Eleana personally selects every ingredient and
              pours herself into every batch. Whether it&apos;s a classic
              chocolate chip or a bold new flavor, each cookie is a little work
              of art — fresh, flavorful, and always made to spark joy.
            </Reveal>
          </div>

          <Reveal
            as="blockquote"
            delay={0.25}
            className="mt-10 border-l-4 border-pink-400 pl-6 font-display text-2xl md:text-3xl italic leading-snug text-stone-900 text-balance"
          >
            Glow Bake isn’t just about cookies. It’s about warmth. It’s about
            family. It’s about handmade happiness, baked daily by Eleana with love and
            purpose.
          </Reveal>

          <Reveal delay={0.3} className="mt-6">
            <Image
              src="/images/sing.png"
              alt="Eleana Machella's signature"
              width={4688}
              height={2500}
              sizes="280px"
              className="w-56 md:w-72 h-auto object-contain"
            />
          </Reveal>
        </div>

        {/* Cookie tower floats faster than the page */}
        <Parallax distance={-70} className="relative mx-auto w-full max-w-[18rem] md:max-w-sm">
          <div className="absolute inset-x-6 bottom-6 top-1/4 -z-10 rounded-[3rem] bg-gradient-to-b from-pink-200/70 to-pink-100/0" />
          <Image
            src="/images/cookies/cookies-tower.png"
            alt="A tower of Glow Bake cookies"
            width={1563}
            height={4688}
            sizes="(min-width: 768px) 24rem, 18rem"
            className="h-auto w-full object-contain drop-shadow-[0_30px_40px_rgba(68,34,20,0.25)]"
          />
        </Parallax>
      </div>
    </section>
  );
}
