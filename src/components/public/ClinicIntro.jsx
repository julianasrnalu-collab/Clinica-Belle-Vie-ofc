import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ClinicIntro() {
  return (
    <section className="py-24 bg-[hsl(30,25%,98%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <img
                src="https://media.base44.com/images/public/69b86bb2102fe694107036c1/15805cd55_generated_f7312929.png"
                alt="Interior da BelleVie"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[hsl(38,50%,55%)] rounded-2xl -z-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[hsl(350,35%,45%)] text-sm font-semibold uppercase tracking-widest mb-3">
              Sobre Nós
            </p>
            <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Beleza com ciência,{" "}
              <span className="text-[hsl(350,35%,45%)]">resultados com arte</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              A BelleVie nasceu da paixão por transformar vidas através da estética. 
              Com profissionais altamente qualificados e tecnologia de ponta, oferecemos 
              tratamentos personalizados que realçam sua beleza natural.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Nossa missão é proporcionar experiências únicas de cuidado e bem-estar, 
              com resultados que superam expectativas.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="font-['Playfair_Display'] text-3xl font-bold text-[hsl(350,35%,45%)]">5+</p>
                <p className="text-sm text-gray-500 mt-1">Anos de experiência</p>
              </div>
              <div className="text-center">
                <p className="font-['Playfair_Display'] text-3xl font-bold text-[hsl(350,35%,45%)]">2k+</p>
                <p className="text-sm text-gray-500 mt-1">Clientes satisfeitas</p>
              </div>
              <div className="text-center">
                <p className="font-['Playfair_Display'] text-3xl font-bold text-[hsl(350,35%,45%)]">15+</p>
                <p className="text-sm text-gray-500 mt-1">Tratamentos</p>
              </div>
            </div>

            <Link to="/About" className="inline-flex items-center gap-2 text-[hsl(350,35%,45%)] font-medium hover:gap-3 transition-all">
              Conheça nossa história
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}