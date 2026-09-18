import AboutUs from "@/components/AboutUs";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import MediaGallery from "@/components/MediaGallery";
import MenuSection from "@/components/MenuSection";
import ParallaxBanner from "@/components/ParallaxBanner";
import PromoSection from "@/components/PromoSection";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <ParallaxBanner image="/images/banners/banner-1.png" position="left" />
      <MenuSection />
      <PromoSection />
      <MediaGallery />
      <ParallaxBanner image="/images/banners/banner-2.png" position="right" />
      <Testimonials />
      <ParallaxBanner image="/images/banners/banner-3.png" position="left" />
      <ContactSection />
    </main>
  );
}
