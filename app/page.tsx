import Navbar from "@/components/web/Navbar";
import Hero from "@/components/web/Hero";
import ProductsSection from "@/components/web/ProductsSection";
import GallerySection from "@/components/web/GallerySection";
import SizesSection from "@/components/web/SizesSection";
import ShippingSection from "@/components/web/ShippingSection";
import TestimonialsSection from "@/components/web/TestimonialsSection";
import FAQSection from "@/components/web/FAQSection";
import Footer from "@/components/web/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductsSection />
        <GallerySection />
        <SizesSection />
        <ShippingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}

