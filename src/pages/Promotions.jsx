import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import CTASection from "@/components/public/CTASection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPromotions(data || []);
      } catch (err) {
        console.error("Erro ao carregar promoções:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPromos();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('public:promotions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => {
        fetchPromos();
      })
      .subscribe();
      
    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <div className="pt-20">
      <section className="py-24 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-[hsl(350,35%,45%)] text-sm font-semibold uppercase tracking-widest mb-3">
              Ofertas Especiais
            </p>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              Promoções e Pacotes
            </h1>
            <div className="w-16 h-0.5 bg-[hsl(38,50%,55%)] mx-auto" />
            <p className="mt-6 text-gray-500 max-w-2xl mx-auto">
              Aproveite nossas condições exclusivas para cuidar de você com os melhores tratamentos estéticos.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {promotions.map((promo, i) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 group flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={promo.image_url || "https://images.unsplash.com/photo-1614859324967-bdf318ffce53?w=800&q=80"}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {promo.discount_value && (
                      <div className="absolute top-4 right-4 bg-[hsl(38,50%,55%)] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center">
                        <Tag className="w-3.5 h-3.5 mr-1.5" />
                        {promo.discount_value}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-serif text-2xl font-bold text-white text-shadow-sm">
                        {promo.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-gray-600 leading-relaxed mb-8 flex-1">
                      {promo.description}
                    </p>
                    <Link to="/BookAppointment" className="block w-full mt-auto">
                      <Button className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full py-6 text-base font-semibold transition-all">
                        Agendar com Desconto
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && promotions.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">
                Nenhuma promoção ativa no momento.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Fique de olho em nossas redes sociais para futuras novidades!
              </p>
            </div>
          )}
        </div>
      </section>
      <CTASection />
    </div>
  );
}