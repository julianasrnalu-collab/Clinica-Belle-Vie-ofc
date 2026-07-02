import React from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Star, Shield } from "lucide-react";
import CTASection from "@/components/public/CTASection";

const values = [
  { icon: Heart, title: "Cuidado", desc: "Cada cliente é única. Personalizamos cada tratamento com atenção e dedicação." },
  { icon: Eye, title: "Inovação", desc: "Investimos em tecnologia de ponta e atualização constante de nossos profissionais." },
  { icon: Star, title: "Excelência", desc: "Buscamos os melhores resultados com segurança e ética em cada procedimento." },
  { icon: Shield, title: "Confiança", desc: "Transparência total em cada etapa. Sua segurança é nossa prioridade máxima." },
];

export default function About() {
  return (
    <div className="pt-20">
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1000&q=80"
                alt="BelleVie Clinic Interior"
                className="rounded-2xl shadow-xl"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
                Nossa História
              </p>
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-6">
                Sobre a BelleVie
              </h1>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Fundada com a missão de democratizar a estética de qualidade, a BelleVie 
                  é referência em tratamentos faciais e corporais na cidade de São Paulo.
                </p>
                <p>
                  Nossa equipe de profissionais altamente qualificados combina conhecimento 
                  científico avançado com sensibilidade artística para entregar resultados 
                  que realçam a beleza natural de cada pessoa.
                </p>
                <p>
                  Com um ambiente acolhedor e equipamentos de última geração, oferecemos 
                  uma experiência completa de bem-estar e transformação.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">
              Missão, Visão e Valores
            </h2>
            <div className="w-16 h-0.5 bg-accent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-serif text-xl font-semibold mb-4 text-primary">
                Missão
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Proporcionar tratamentos estéticos de excelência que elevam a autoestima 
                e promovem o bem-estar de nossos clientes, com segurança, ética e resultados comprovados.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-serif text-xl font-semibold mb-4 text-primary">
                Visão
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ser a clínica de estética mais admirada do Brasil, reconhecida pela inovação, 
                qualidade de atendimento e resultados transformadores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{v.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}