import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import CTASection from "@/components/public/CTASection";

export default function Results() {
  // MOCK DATA: Since the backend is not connected yet, we use mock data so the TCC presentation works perfectly.
  const gallery = [
    {
      id: 1,
      before_image_url: "https://images.unsplash.com/photo-1512495962040-62187f4749f7?w=500&q=80",
      after_image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&q=80",
      title: "Rejuvenescimento Facial",
      service_name: "Protocolo Clear Skin",
      description: "Protocolo combinando peeling químico e microagulhamento. Benefícios: Renovação celular, clareamento de manchas, melhora da textura e viço da pele em 4 sessões."
    },
    {
      id: 2,
      before_image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80",
      after_image_url: "https://images.unsplash.com/photo-1570172619644-defd036b0042?w=500&q=80",
      title: "Redução de Medidas",
      service_name: "Protocolo LipoSlim",
      description: "Associação de ultrassom cavitacional e drenagem linfática. Benefícios: Redução de gordura localizada, melhora no contorno corporal e diminuição da retenção de líquidos."
    },
    {
      id: 3,
      before_image_url: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=500&q=80",
      after_image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80",
      title: "Contorno Labial",
      service_name: "Preenchimento com Ácido Hialurônico",
      description: "Procedimento minimamente invasivo. Benefícios: Hidratação profunda, correção de assimetrias e aumento de volume com naturalidade e segurança."
    }
  ];
  const isLoading = false;

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
              Galeria
            </p>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              Antes e Depois
            </h1>
            <div className="w-16 h-0.5 bg-accent mx-auto" />
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {gallery.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-secondary rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="grid grid-cols-2">
                    <div className="relative">
                      <img src={item.before_image_url} alt="Antes" className="w-full h-56 object-cover" />
                      <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                        Antes
                      </span>
                    </div>
                    <div className="relative">
                      <img src={item.after_image_url} alt="Depois" className="w-full h-56 object-cover" />
                      <span className="absolute bottom-3 right-3 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                        Depois
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                    {item.service_name && (
                      <p className="text-sm font-semibold uppercase tracking-wide text-accent mt-2">{item.service_name}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-20">
              Em breve publicaremos nossos resultados.
            </p>
          )}
        </div>
      </section>
      <CTASection />
    </div>
  );
}