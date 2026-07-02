import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import CTASection from "@/components/public/CTASection";

export default function Team() {
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'employee')
          .eq('is_active', true)
          .eq('show_on_website', true)
          .order('full_name');
          
        if (error) throw error;
        setProfessionals(data || []);
      } catch (err) {
        console.error("Erro ao carregar a equipe:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeam();
    
    // Set up real-time subscription for immediate updates on the public page
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchTeam(); // Refresh when any profile changes
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="pt-20">
      <section className="py-24 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-[hsl(350,35%,45%)] text-sm font-semibold uppercase tracking-widest mb-3">
              Nossa Equipe
            </p>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              Profissionais Especializados
            </h1>
            <div className="w-16 h-0.5 bg-[hsl(38,50%,55%)] mx-auto" />
            <p className="mt-6 text-gray-500 max-w-2xl mx-auto">
              Conheça as especialistas responsáveis por realçar a sua beleza e cuidar do seu bem-estar com excelência e segurança.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {professionals.map((pro, i) => (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group text-center bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-gray-100"
                >
                  <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-md ring-4 ring-white">
                    <img
                      src={pro.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80"}
                      alt={pro.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(350,35%,45%)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-gray-900">
                    {pro.full_name}
                  </h3>
                  <p className="text-[hsl(350,35%,45%)] text-sm font-semibold mt-1 mb-4 uppercase tracking-wide">
                    {pro.specialization || "Especialista"}
                  </p>
                  
                  {pro.bio && (
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed mb-6">
                      {pro.bio}
                    </p>
                  )}
                  
                  {pro.services_performed && pro.services_performed.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mt-auto border-t border-gray-100 pt-5 mb-5">
                      {pro.services_performed.map(svc => (
                        <span key={svc} className="text-[10px] uppercase font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          {svc}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    <Link to={`/BookAppointment?professionalId=${pro.id}`}>
                      <Button className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full">
                        <Calendar className="w-4 h-4 mr-2" /> Agendar com {pro.full_name.split(' ')[0]}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && professionals.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">
                Em breve apresentaremos nossa equipe.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Nossos profissionais estão preparando seus perfis.
              </p>
            </div>
          )}
        </div>
      </section>
      <CTASection />
    </div>
  );
}