import Reveal from "./Reveal";

// Shared section header: script eyebrow, serif display title, optional lead.
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  className = "",
}) {
  const alignment = align === "left" ? "text-left" : "text-center mx-auto";

  return (
    <Reveal className={`max-w-2xl mb-14 md:mb-16 ${alignment} ${className}`}>
      {eyebrow && (
        <p className="font-script text-3xl md:text-4xl text-pink-500 mb-1">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 text-balance">
        {title}
      </h2>
      {lead && (
        <p className="mt-5 text-base md:text-lg text-stone-600 leading-relaxed text-pretty">
          {lead}
        </p>
      )}
    </Reveal>
  );
}
