import { getPublicCatalog } from '@/lib/catalog/get-public-catalog'
import { getStaticCatalogFallback } from '@/lib/catalog/static-fallback'
import Navbar from "@/components/web/Navbar";
import Hero from "@/components/web/Hero";
import ProductsSection from "@/components/web/ProductsSection";
import GallerySection from "@/components/web/GallerySection";
import SizesSection from "@/components/web/SizesSection";
import ShippingSection from "@/components/web/ShippingSection";
import TestimonialsSection from "@/components/web/TestimonialsSection";
import FAQSection from "@/components/web/FAQSection";
import Footer from "@/components/web/Footer";
import { CatalogProvider } from "@/components/catalog/catalog-provider";

export const dynamic = 'force-dynamic'

async function loadCatalog() {
  try {
    return await getPublicCatalog()
  } catch {
    return getStaticCatalogFallback()
  }
}

export default async function Home() {
  const catalog = await loadCatalog()

  return (
    <CatalogProvider catalog={catalog}>
      <Navbar />
      <main>
        <Hero />
        <ProductsSection productPrices={catalog.productPrices} />
        <GallerySection baseColors={catalog.baseColors} />
        <SizesSection />
        <ShippingSection shippingPrices={catalog.shippingPrices} />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </CatalogProvider>
  );
}
