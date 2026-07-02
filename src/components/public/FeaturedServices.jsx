import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/constants";

export default function FeaturedServices() {
  const { data: services = [] } = useQuery({
    queryKey: ["services-featured"],
    queryFn: () => base44.entities.Service.filter({ is_active: true, is_featured: true }),
  });

  const displayServices = services.slice(0, 6);

  if (displayServices.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[hsl(350,35%,45%)] text-sm font-semibold uppercase tracking-widest mb-3">
            Nossos Serviços
          </p>
          <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 mb-4">
            Tratamentos em Destaque
          </h2>
          <div className="w-16 h-0.5 bg-[hsl(38,50%,55%)] mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-[hsl(30,25%,98%)] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500"
            >
              {service.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(350,35%,45%)]">
                  {CATEGORY_LABELS[service.category] || service.category}
                </span>
                <h3 className="font-['Playfair_Display'] text-xl font-semibold mt-2 mb-3 text-gray-900">
                  {service.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration_minutes}min
                    </span>
                    <span className="font-semibold text-gray-900">
                      R$ {service.price?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/Services">
            <button className="inline-flex items-center gap-2 text-[hsl(350,35%,45%)] font-medium hover:gap-3 transition-all">
              Ver todos os serviços
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}