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
      <ParallaxBanner imageClass="bg-banner1" />
      <MenuSection />
      <ParallaxBanner imageClass="bg-banner2" />
      <Testimonials />
      <ParallaxBanner imageClass="bg-banner3" />
      <ContactSection />
      <Footer />
    </main>
  );
}
