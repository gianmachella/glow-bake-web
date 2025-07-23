import AboutUs from "@/components/AboutUs";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import ParallaxBanner from "@/components/ParallaxBanner";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <ParallaxBanner image="/images/banners/banner-1.png" position="left" />
      <MenuSection />
      <ParallaxBanner image="/images/banners/banner-2.png" position="right" />
      <Testimonials />
      <ParallaxBanner image="/images/banners/banner-3.png" position="left" />
      <ContactSection />
      <Footer />
    </main>
  );
}
