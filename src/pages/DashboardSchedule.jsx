import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardSchedule() {
  const { user } = useAuth();
  const role = user?.profile?.role || "client";
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("daily"); // 'daily', 'weekly', 'monthly'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase.from('appointments').select(`
        *,
        client:client_id(full_name),
        professional:professional_id(full_name)
      `);

      if (role === 'employee') {
        query = query.eq('professional_id', user.id);
      } else if (role === 'client') {
        query = query.eq('client_id', user.id);
      }

      // Date filtering based on view
      if (view === 'daily') {
        query = query.eq('date', format(selectedDate, "yyyy-MM-dd"));
      } else if (view === 'weekly') {
        const start = format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
        const end = format(endOfWeek(selectedDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
        query = query.gte('date', start).lte('date', end);
      } else if (view === 'monthly') {
        const start = format(startOfMonth(selectedDate), "yyyy-MM-dd");
        const end = format(endOfMonth(selectedDate), "yyyy-MM-dd");
        query = query.gte('date', start).lte('date', end);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, selectedDate, view]);

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      toast({ title: "Status atualizado com sucesso!" });
      fetchAppointments();
    } catch (err) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  // Group weekly/monthly appointments by date for cleaner UI
  const groupedAppointments = appointments.reduce((acc, appt) => {
    if (!acc[appt.date]) acc[appt.date] = [];
    acc[appt.date].push(appt);
    return acc;
  }, {});
  
  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort();

  const AppointmentCard = ({ appt }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-gray-100">
      <div className="text-left sm:text-center flex-shrink-0 sm:w-16">
        <p className="text-lg font-bold text-[hsl(350,35%,45%)] flex items-center gap-1 sm:block sm:gap-0">
          <Clock className="w-4 h-4 sm:hidden text-gray-400" />
          {appt.time}
        </p>
        <p className="text-xs text-gray-500">{appt.duration_minutes} min</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate text-base">{appt.service_name}</p>
        <p className="text-sm text-gray-600 truncate mt-0.5">
          {role === 'employee' || role === 'admin' ? (
            <span className="font-medium text-gray-800">Cliente: {appt.client?.full_name || 'Desconhecido'}</span>
          ) : (
            <span className="font-medium text-gray-800">Profissional: {appt.professional?.full_name || 'A definir'}</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3 mt-2 sm:mt-0 justify-between sm:justify-end w-full sm:w-auto">
        <Badge className={`${STATUS_COLORS[appt.status]} px-3 py-1`}>
          {STATUS_LABELS[appt.status]}
        </Badge>
        
        {/* Action Buttons for Employees/Admins */}
        {(role === 'employee' || role === 'admin') && appt.status === 'confirmed' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => updateStatus(appt.id, 'completed')} className="bg-green-600 hover:bg-green-700 h-8" aria-label={`Concluir agendamento de ${appt.service_name}`}>
              Concluir
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minha Agenda</h1>
          <p className="text-gray-500">Acompanhe seus procedimentos e clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Calendar Filter */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                locale={ptBR}
                className="rounded-md border border-gray-100"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Schedule View */}
        <div className="lg:col-span-8">
          <Card className="border-gray-100 shadow-sm min-h-[500px]">
            <CardHeader className="border-b border-gray-50 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg font-serif">
                  {view === 'daily' && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  {view === 'weekly' && `Semana de ${format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })}`}
                  {view === 'monthly' && format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Dia</TabsTrigger>
                    <TabsTrigger value="weekly">Semana</TabsTrigger>
                    <TabsTrigger value="monthly">Mês</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Clock className="w-12 h-12 mb-3 opacity-20" />
                  <p>Nenhum agendamento encontrado para este período.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {view === 'daily' ? (
                    <div className="space-y-3">
                      {appointments.sort((a,b) => a.time.localeCompare(b.time)).map(appt => (
                        <AppointmentCard key={appt.id} appt={appt} />
                      ))}
                    </div>
                  ) : (
                    sortedDates.map(date => (
                      <div key={date} className="space-y-3">
                        <h3 className="font-medium text-gray-900 border-b pb-2 mb-3">
                          {format(new Date(date + "T00:00:00"), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </h3>
                        {groupedAppointments[date].sort((a,b) => a.time.localeCompare(b.time)).map(appt => (
                          <AppointmentCard key={appt.id} appt={appt} />
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}