import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials-public"],
    queryFn: () => base44.entities.Testimonial.filter({ is_approved: true }),
  });

  const displayTestimonials = testimonials.slice(0, 3);

  if (displayTestimonials.length === 0) return null;

  return (
    <section className="py-24 bg-[hsl(30,25%,98%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[hsl(350,35%,45%)] text-sm font-semibold uppercase tracking-widest mb-3">
            Depoimentos
          </p>
          <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 mb-4">
            O que nossas clientes dizem
          </h2>
          <div className="w-16 h-0.5 bg-[hsl(38,50%,55%)] mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-500"
            >
              <Quote className="w-8 h-8 text-[hsl(38,50%,70%)] mb-4" />
              <p className="text-gray-600 leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${idx < t.rating ? "fill-[hsl(38,50%,55%)] text-[hsl(38,50%,55%)]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="font-semibold text-gray-900">{t.client_name}</p>
              {t.service_name && (
                <p className="text-sm text-gray-500">{t.service_name}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}