import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1920&q=80"
          alt="BelleVie Clinic"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20 transition-transform hover:-translate-y-1 duration-300">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-white/90 text-sm font-medium">Excelência em Estética</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
            Sua beleza,{" "}
            <span className="text-accent italic">nossa arte</span>
          </h1>

          <p className="text-lg text-white/90 font-light leading-relaxed mb-10 max-w-lg">
            Tratamentos estéticos de excelência com tecnologia de ponta e profissionais especializados. 
            Descubra a melhor versão de você.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/BookAppointment">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                Agendar Consulta
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/Services">
              <Button size="lg" className="bg-white/90 hover:bg-white text-gray-900 border-none rounded-full px-8 h-14 text-base font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                Nossos Serviços
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}