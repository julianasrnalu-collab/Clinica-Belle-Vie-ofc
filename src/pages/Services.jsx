import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/constants";
import CTASection from "@/components/public/CTASection";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // MOCK DATA: Since the backend is not connected yet, we use mock data so the TCC presentation works perfectly.
  const services = [
    { id: 1, name: "Limpeza de Pele Profunda", category: "facial", description: "Remoção de impurezas, cravos e células mortas, devolvendo o viço e a luminosidade da pele.", duration_minutes: 60, price: 150.00, image_url: "https://images.unsplash.com/photo-1570172619644-defd036b0042?w=500&q=80" },
    { id: 2, name: "Drenagem Linfática", category: "body", description: "Massagem corporal que estimula o sistema linfático, reduzindo o inchaço e a retenção de líquidos.", duration_minutes: 50, price: 120.00, image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80" },
    { id: 3, name: "Depilação a Laser", category: "laser", description: "Remoção definitiva dos pelos utilizando tecnologia de ponta, indolor e eficaz.", duration_minutes: 30, price: 80.00, image_url: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500&q=80" },
    { id: 4, name: "Preenchimento Labial", category: "injectables", description: "Procedimento estético com ácido hialurônico para dar volume, contorno e hidratação aos lábios.", duration_minutes: 45, price: 950.00, image_url: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=500&q=80" },
    { id: 5, name: "Massagem Relaxante", category: "wellness", description: "Técnicas de massagem para alívio de tensões musculares e relaxamento profundo.", duration_minutes: 60, price: 130.00, image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80" }
  ];
  const isLoading = false;

  const categories = ["all", ...Object.keys(CATEGORY_LABELS)];
  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <div className="pt-20">
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
              Catálogo
            </p>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h1>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-8" />

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-md"
                      : "bg-secondary text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat === "all" ? "Todos" : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-secondary rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  {service.image_url && (
                    <div className="h-52 overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {CATEGORY_LABELS[service.category] || service.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold mt-2 mb-3 text-gray-900">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-4 h-4 text-primary" />
                          {service.duration_minutes}min
                        </span>
                      </div>
                      <span className="font-bold text-lg text-primary">
                        R$ {service.price?.toFixed(2)}
                      </span>
                    </div>
                    <Link to="/BookAppointment" className="mt-6 block">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-semibold transition-all duration-300">
                        Agendar Agora
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-gray-500 py-20">
              Nenhum serviço encontrado nesta categoria.
            </p>
          )}
        </div>
      </section>
      <CTASection />
    </div>
  );
}