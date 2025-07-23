// src/components/ParallaxBanner.jsx

export default function ParallaxBanner({ image, position = "center" }) {
  return (
    <div
      className="h-[200px] bg-fixed bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url(${image})`,
        backgroundPosition:
          position === "left"
            ? "left center"
            : position === "right"
            ? "right center"
            : "center",
        backgroundSize: "cover",
      }}
    />
  );
}
