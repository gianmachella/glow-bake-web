import {
  ArrowUp,
  ArrowUpRight,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";

const EMAIL = "glow.bake.tx@gmail.com";
const PHONE_DISPLAY = "(945) 400-5808";
const PHONE_TEL = "+19454005808";
const WHATSAPP_URL = "https://wa.me/19454005808";

const exploreLinks = [
  { href: "/#about", label: "Our story" },
  { href: "/#menu", label: "This week’s menu" },
  { href: "/#promotions", label: "Promotions" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#contact", label: "Contact" },
  { href: "/cart", label: "Your basket" },
];

const socials = [
  { href: "https://www.instagram.com/glow.bake/", label: "Instagram", Icon: Instagram },
  {
    href: "https://www.facebook.com/profile.php?id=61578248566814",
    label: "Facebook",
    Icon: Facebook,
  },
  { href: WHATSAPP_URL, label: "WhatsApp", Icon: MessageCircle },
];

// Pink icing dripping over the top edge of the footer. Built from a fixed
// list of drips (center x, width, length in a 1440-wide viewBox) so the shape
// is deterministic between server and client renders.
const ICING_BASE = 22;
function icingPath(drips) {
  const sorted = [...drips].sort((a, b) => b.x - a.x);
  let d = `M0 0 H1440 V${ICING_BASE}`;
  for (const { x, w, len } of sorted) {
    const r = w / 2;
    const y = ICING_BASE + len;
    d +=
      ` L${x + r} ${ICING_BASE}` +
      ` C${x + r} ${ICING_BASE + len * 0.55} ${x + r * 0.9} ${y} ${x} ${y}` +
      ` C${x - r * 0.9} ${y} ${x - r} ${ICING_BASE + len * 0.55} ${x - r} ${ICING_BASE}`;
  }
  return `${d} L0 ${ICING_BASE} Z`;
}

const frontDrips = icingPath([
  { x: 70, w: 34, len: 26 },
  { x: 190, w: 46, len: 54 },
  { x: 330, w: 30, len: 18 },
  { x: 455, w: 52, len: 66 },
  { x: 610, w: 36, len: 30 },
  { x: 740, w: 44, len: 48 },
  { x: 880, w: 30, len: 20 },
  { x: 1010, w: 54, len: 62 },
  { x: 1150, w: 34, len: 28 },
  { x: 1275, w: 46, len: 50 },
  { x: 1395, w: 30, len: 22 },
]);

const backDrips = icingPath([
  { x: 125, w: 30, len: 40 },
  { x: 260, w: 40, len: 70 },
  { x: 535, w: 34, len: 44 },
  { x: 680, w: 28, len: 58 },
  { x: 815, w: 38, len: 76 },
  { x: 950, w: 30, len: 40 },
  { x: 1215, w: 36, len: 72 },
  { x: 1340, w: 28, len: 38 },
]);

function FooterHeading({ children }) {
  return (
    <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-pink-300/90">
      {children}
    </h3>
  );
}

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#2a1a17] text-stone-300">
      {/* Icing drip edge */}
      <svg
        aria-hidden
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 z-10 h-14 w-full md:h-20"
      >
        <path d={backDrips} className="fill-pink-400" />
        <path d={frontDrips} className="fill-pink-300" />
        <path
          d={`M0 6 H1440`}
          className="stroke-white/40"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 22"
        />
      </svg>

      {/* Warm glows */}
      <div className="pointer-events-none absolute -left-40 top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-pink-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-500/10 blur-[120px]" />

      {/* Floating cookie */}
      <Parallax
        distance={-90}
        className="pointer-events-none absolute right-[4%] top-28 -z-10 hidden w-40 lg:block xl:w-52"
      >
        <div className="relative aspect-square rotate-12 opacity-90">
          <Image
            src="/images/cookies/cookie-3.png"
            alt=""
            fill
            sizes="13rem"
            className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
          />
        </div>
      </Parallax>

      <div className="relative mx-auto max-w-6xl px-6 pt-32 md:pt-40">
        {/* Closing headline + CTAs */}
        <Reveal className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-14 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="font-script text-3xl md:text-4xl text-pink-300">
              Stay sweet
            </p>
            <h2 className="mt-1 font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-white text-balance">
              Let’s bake something special together.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:-translate-y-0.5 hover:bg-pink-400"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/5"
            >
              <Mail className="h-4 w-4" />
              Email us
            </a>
          </div>
        </Reveal>

        {/* Columns */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Brand */}
          <Reveal delay={0.05}>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="relative block h-16 w-16 rounded-full bg-white/95 p-1.5 shadow-lg transition-transform duration-500 group-hover:rotate-[20deg]">
                <Image
                  src="/images/logo-gb.png"
                  alt="Glow Bake logo"
                  width={128}
                  height={128}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="font-script text-4xl text-white">Glow Bake</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone-400">
              Small-batch cookies handmade in Princeton, TX by pastry chef
              Eleana Machella. Fresh flavors every week, baked to order.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-stone-200 transition duration-300 hover:-translate-y-1 hover:border-pink-400 hover:bg-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/30"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Explore */}
          <Reveal delay={0.1}>
            <FooterHeading>Explore</FooterHeading>
            <ul className="space-y-3 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-stone-300 transition-colors hover:text-white"
                  >
                    <span className="h-px w-0 bg-pink-400 transition-all duration-300 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.15}>
            <FooterHeading>Say hello</FooterHeading>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-300" />
                <span>
                  Princeton, TX
                  <span className="block text-xs text-stone-500">
                    Pickup &amp; local delivery
                  </span>
                </span>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-pink-300" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-pink-300" />
                  {PHONE_DISPLAY}
                </a>
              </li>
            </ul>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-300/10 px-4 py-2 text-xs font-medium text-pink-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-300" />
              </span>
              New batch on the menu every week
            </div>
          </Reveal>
        </div>
      </div>

      {/* Giant outlined signature, rising slower than the page */}
      <Parallax
        distance={40}
        className="pointer-events-none relative -mt-6 select-none overflow-hidden"
      >
        <p
          aria-hidden
          className="whitespace-nowrap text-center font-script text-[26vw] leading-[0.95] text-transparent [-webkit-text-stroke:1.5px_rgba(249,168,212,0.28)] md:text-[20vw]"
        >
          Glow Bake
        </p>
      </Parallax>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Glow Bake – So Sweet. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Baked with <Heart className="h-3.5 w-3.5 fill-pink-400 text-pink-400" /> · Designed by{" "}
            <a
              href="https://www.linkedin.com/in/gian-machella-1b9a90187/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-300 transition-colors hover:text-pink-200"
            >
              Gian Machella
            </a>
          </p>
          <a
            href="#"
            aria-label="Back to top"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-stone-300 transition hover:border-pink-400 hover:text-white"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
