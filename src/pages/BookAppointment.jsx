import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Clock, User, Scissors, CalendarDays } from "lucide-react";
import { format, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CATEGORY_LABELS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import PublicNavbar from "@/components/public/PublicNavbar";

const STEPS = ["Serviço", "Profissional", "Data e Hora", "Confirmação"];

export default function BookAppointment() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const initialProfessionalId = searchParams.get('professionalId');

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [existingAppts, setExistingAppts] = useState([]);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Auth Guard
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/Login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoadingAuth, navigate, location]);

  // Load Services and Professionals
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, profilesRes] = await Promise.all([
          supabase.from('services').select('*'),
          supabase.from('profiles').select('*').eq('role', 'employee').eq('is_active', true)
        ]);

        if (servicesRes.data) setServices(servicesRes.data);
        if (profilesRes.data) {
          setProfessionals(profilesRes.data);
          
          if (initialProfessionalId) {
            const pro = profilesRes.data.find(p => p.id === initialProfessionalId);
            if (pro) {
              setSelectedProfessional(pro);
              // We can't jump to step 2 immediately because they need to select a service first
              // But we can remember the professional. 
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do agendamento:", err);
      }
    };
    if (isAuthenticated) loadData();
  }, [isAuthenticated, initialProfessionalId]);

  // Load existing appointments for the selected Date and Professional to prevent double booking
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDate || !selectedProfessional) return;
      try {
        const { data } = await supabase
          .from('appointments')
          .select('time, duration_minutes, status')
          .eq('professional_id', selectedProfessional.id)
          .eq('date', format(selectedDate, "yyyy-MM-dd"))
          .neq('status', 'cancelled');
          
        setExistingAppts(data || []);
      } catch (err) {
        console.error("Erro ao buscar horários", err);
      }
    };
    fetchAppointments();
  }, [selectedDate, selectedProfessional]);

  const filteredProfessionals = useMemo(() => {
    if (!selectedService) return [];
    return professionals; // Simplification: all professionals can do all services for now. To restrict, use `service_ids`.
  }, [selectedService, professionals]);

  // Mock availability for demo: Monday to Friday (1-5), 09:00 to 18:00
  const availableDays = [1, 2, 3, 4, 5, 6]; 
  
  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedService || !selectedProfessional) return [];
    const dayOfWeek = getDay(selectedDate);
    if (!availableDays.includes(dayOfWeek)) return [];

    const slots = [];
    const startH = 9, startM = 0; // 09:00
    const endH = 18, endM = 0; // 18:00
    const duration = selectedService.duration_minutes || 60;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      const isBooked = existingAppts.some((appt) => {
        const apptStart = parseInt(appt.time.split(":")[0]) * 60 + parseInt(appt.time.split(":")[1]);
        const apptEnd = apptStart + (appt.duration_minutes || 60);
        const slotEnd = current + duration;
        return current < apptEnd && slotEnd > apptStart;
      });

      // Filter out past times if it's today
      const now = new Date();
      let isPast = false;
      if (format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
        const currentMins = now.getHours() * 60 + now.getMinutes();
        if (current <= currentMins) isPast = true;
      }

      if (!isBooked && !isPast) {
        slots.push(timeStr);
      }
      current += 30; // 30-minute intervals
    }
    return slots;
  }, [selectedDate, existingAppts, selectedService, selectedProfessional]);

  const handleConfirm = () => {
    if (!user) return;

    navigate("/DepositPayment", {
      state: {
        appointmentData: {
          client_id: user.id,
          client_email: user.email,
          client_name: user.profile?.full_name,
          professional_id: selectedProfessional.id,
          professional_name: selectedProfessional.full_name,
          service_name: selectedService.name,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime,
          duration_minutes: selectedService.duration_minutes,
          price: selectedService.price,
          deposit_amount: selectedService.deposit_amount || 0,
        },
      },
    });
  };

  const canDisableDate = (date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return true;
    const dow = getDay(date);
    return !availableDays.includes(dow);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null; // Wait for redirect

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-28 pb-20 max-w-4xl mx-auto px-4">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? "text-primary" : "text-gray-300"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i < step ? "bg-primary text-white" : i === step ? "bg-primary/10 text-primary border-2 border-primary" : "bg-gray-100 text-gray-400"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 transition-colors ${i < step ? "bg-primary" : "bg-gray-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-serif text-3xl font-bold mb-6 text-gray-900">Escolha um serviço</h2>
              {services.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Carregando serviços...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <Card
                      key={s.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                        selectedService?.id === s.id ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => { setSelectedService(s); setSelectedDate(null); setSelectedTime(null); }}
                    >
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="secondary" className="mb-2 text-xs">{CATEGORY_LABELS[s.category] || s.category}</Badge>
                            <h3 className="font-semibold text-gray-900">{s.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                          </div>
                          {selectedService?.id === s.id && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.duration_minutes}min</span>
                          <span className="font-semibold text-gray-900">R$ {Number(s.price).toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-8">
                <Button
                  disabled={!selectedService}
                  onClick={() => {
                    if (initialProfessionalId && selectedProfessional) {
                       setStep(2); // Skip professional selection if they came from the team page
                    } else {
                       setStep(1);
                    }
                  }}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-serif text-3xl font-bold mb-6 text-gray-900">Escolha um profissional</h2>
              {filteredProfessionals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProfessionals.map((p) => (
                    <Card
                      key={p.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                        selectedProfessional?.id === p.id ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => { setSelectedProfessional(p); setSelectedDate(null); setSelectedTime(null); }}
                    >
                      <CardContent className="p-5 text-center">
                        <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-gray-100">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">{p.full_name}</h3>
                        <p className="text-sm font-medium text-accent mt-1">{p.specialization || "Especialista"}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">
                  Nenhum profissional cadastrado na equipe.
                </p>
              )}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(0)} className="rounded-full px-8 hover:-translate-y-1 transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button
                  disabled={!selectedProfessional}
                  onClick={() => setStep(2)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-serif text-3xl font-bold mb-6 text-gray-900">Escolha data e horário</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                      disabled={canDisableDate}
                      locale={ptBR}
                      className="rounded-md"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDate && timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedTime === t
                                ? "bg-primary text-white shadow-md"
                                : "bg-secondary text-gray-700 hover:bg-primary/10"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : selectedDate ? (
                      <p className="text-gray-500 text-center py-8">Nenhum horário disponível.</p>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Selecione uma data ao lado.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => {
                  if (initialProfessionalId && selectedProfessional?.id === initialProfessionalId) {
                    setStep(0);
                  } else {
                    setStep(1);
                  }
                }} className="rounded-full px-8 hover:-translate-y-1 transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-serif text-3xl font-bold mb-6 text-gray-900">Confirme seu agendamento</h2>
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Scissors className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Serviço</p>
                        <p className="font-semibold">{selectedService?.name}</p>
                        <p className="text-sm text-gray-500">{selectedService?.duration_minutes}min</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Profissional</p>
                        <p className="font-semibold">{selectedProfessional?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Data e Hora</p>
                        <p className="font-semibold">
                          {selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-primary mt-0.5 font-bold text-center">R$</div>
                      <div>
                        <p className="text-sm text-gray-500">Valor</p>
                        <p className="font-semibold text-xl">R$ {Number(selectedService?.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-full px-8 hover:-translate-y-1 transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  Pagar Sinal e Confirmar
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}