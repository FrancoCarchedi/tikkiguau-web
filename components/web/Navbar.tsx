"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scroll-to-section";

const NAV_LINKS = [
  { label: "Productos", sectionId: "productos" },
  { label: "Medidas", sectionId: "medidas" },
  { label: "Envíos", sectionId: "envios" },
  { label: "Preguntas frecuentes", sectionId: "faq" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setOpen(false);
    scrollToSection(sectionId);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/images/tikkiguau-logo.webp"
              alt="TikkiGuau"
              width={140}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <button
                key={link.sectionId}
                type="button"
                onClick={() => handleNavClick(link.sectionId)}
                className="text-sm font-medium text-zinc-500 hover:text-[#C70F11] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/disenar"
              className={cn(
                buttonVariants({ size: "default" }),
                "bg-[#C70F11] text-white hover:bg-[#a50d0f] border-transparent px-5 font-semibold"
              )}
            >
              Diseñar mi collar
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.sectionId}
              type="button"
              onClick={() => handleNavClick(link.sectionId)}
              className="text-sm font-medium text-zinc-600 hover:text-[#C70F11] transition-colors py-1 text-left"
            >
              {link.label}
            </button>
          ))}
          <Link
            href="/disenar"
            className={cn(
              buttonVariants({ size: "default" }),
              "bg-[#C70F11] text-white hover:bg-[#a50d0f] border-transparent font-semibold justify-center mt-1"
            )}
            onClick={() => setOpen(false)}
          >
            Diseñar mi collar
          </Link>
        </div>
      )}
    </header>
  );
}
