export default function ParallaxBanner({ imageClass }) {
  return (
    <div className="relative w-full h-[200px] overflow-hidden z-10 pointer-events-none">
      <div
        className={`absolute inset-0 bg-cover bg-center will-change-transform bg-fixed ${imageClass}`}
      />
    </div>
  );
}
