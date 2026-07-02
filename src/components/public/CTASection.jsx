import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 bg-[hsl(20,10%,15%)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[hsl(350,35%,45%)] blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-[hsl(38,50%,55%)] blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Calendar className="w-12 h-12 text-[hsl(38,50%,70%)] mx-auto mb-6" />
          <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl font-bold text-white mb-6">
            Agende sua transformação
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Dê o primeiro passo para a melhor versão de você. 
            Nossos especialistas estão prontos para criar um plano personalizado.
          </p>
          <Link to="/BookAppointment">
            <Button size="lg" className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full px-10 h-14 text-base">
              Agendar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}