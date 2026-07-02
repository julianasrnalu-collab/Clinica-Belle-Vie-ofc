import React from "react";
import HeroSection from "@/components/public/HeroSection";
import ClinicIntro from "@/components/public/ClinicIntro";
import FeaturedServices from "@/components/public/FeaturedServices";
import TestimonialsSection from "@/components/public/TestimonialsSection";
import CTASection from "@/components/public/CTASection";
import { CLINIC_WHATSAPP } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ClinicIntro />
      <FeaturedServices />
      <TestimonialsSection />
      <CTASection />

      {/* WhatsApp floating button — Home page only */}
      <a
        href={`https://wa.me/${CLINIC_WHATSAPP}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}