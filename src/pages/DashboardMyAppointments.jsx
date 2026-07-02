import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Plus, XCircle } from "lucide-react";
import { format } from "date-fns";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardMyAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, professional:professional_id(full_name)')
        .eq('client_id', user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      toast({ title: "Erro ao carregar", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) throw error;
      toast({ title: "Agendamento cancelado com sucesso." });
      fetchAppointments();
    } catch (err) {
      toast({ title: "Erro ao cancelar", variant: "destructive" });
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = appointments.filter((a) => a.date >= today && a.status !== "cancelled" && a.status !== "completed");
  const past = appointments.filter((a) => a.date < today || a.status === "completed" || a.status === "cancelled");

  const AppointmentCard = ({ appt, showCancel }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4">
      <div className="flex items-center gap-4">
        <div className="text-center flex-shrink-0 w-16 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-lg font-bold text-[hsl(350,35%,45%)]">{appt.time.substring(0,5)}</p>
          <p className="text-xs text-gray-500 font-medium">{format(new Date(appt.date + "T00:00:00"), "dd/MM")}</p>
        </div>
        <div>
          <p className="font-medium text-gray-900">{appt.service_name}</p>
          <p className="text-sm text-gray-500">{appt.professional?.full_name || "Profissional"} • {appt.duration_minutes}min</p>
          <p className="text-sm font-medium mt-1 text-[hsl(350,35%,45%)]">R$ {Number(appt.price)?.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <Badge className={`${STATUS_COLORS[appt.status]} font-normal px-2.5 py-0.5`}>{STATUS_LABELS[appt.status] || appt.status}</Badge>
        {showCancel && (appt.status === "confirmed" || appt.status === "pending_payment") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCancel(appt.id)}
            title="Cancelar Agendamento"
            aria-label={`Cancelar agendamento de ${appt.service_name}`}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
          >
            <XCircle className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
          <p className="text-gray-500 text-sm">Acompanhe seus horários marcados e histórico.</p>
        </div>
        <Link to="/BookAppointment">
          <Button className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <TabsList className="mb-6 bg-gray-50 border border-gray-100">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Próximos ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Histórico ({past.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((a) => <AppointmentCard key={a.id} appt={a} showCancel />)}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum agendamento futuro.</p>
                <Link to="/BookAppointment" className="text-sm text-[hsl(350,35%,45%)] hover:underline mt-2 inline-block">
                  Agendar agora
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {past.length > 0 ? (
              <div className="space-y-3">
                {past.map((a) => <AppointmentCard key={a.id} appt={a} />)}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">Nenhum histórico encontrado.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}