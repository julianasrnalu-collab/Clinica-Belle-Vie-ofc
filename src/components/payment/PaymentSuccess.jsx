import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarDays, Home, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function PaymentSuccess({ appointmentData, appointmentId }) {
  const formattedDate = appointmentData.date
    ? format(parseISO(appointmentData.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center"
    >
      {/* Success icon */}
      <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>

      <div className="mb-2">
        <Sparkles className="w-5 h-5 text-[hsl(38,50%,55%)] inline mr-1" />
        <span className="text-xs uppercase tracking-widest text-[hsl(38,50%,55%)] font-semibold">
          Pagamento aprovado
        </span>
      </div>

      <h2 className="font-['Playfair_Display'] text-3xl font-bold text-gray-900 mb-3">
        Agendamento Confirmado!
      </h2>
      <p className="text-gray-500 mb-8">
        Seu sinal foi recebido com sucesso. Seu agendamento está confirmado e te esperamos com carinho!
      </p>

      {/* Details card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[hsl(30,15%,90%)] p-6 mb-8 text-left space-y-4">
        <DetailItem label="Serviço" value={appointmentData.service_name} />
        <DetailItem label="Profissional" value={appointmentData.professional_name} />
        <DetailItem label="Data" value={formattedDate} />
        <DetailItem label="Horário" value={appointmentData.time} />
        <div className="border-t pt-4 flex justify-between">
          <span className="text-sm text-gray-500">Sinal pago</span>
          <span className="font-bold text-green-600">R$ {(appointmentData.deposit_amount || 0).toFixed(2)}</span>
        </div>
        {appointmentId && (
          <p className="text-xs text-gray-400 text-center">
            Código de confirmação: #{appointmentId.slice(-8).toUpperCase()}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/DashboardMyAppointments" className="flex-1">
          <Button className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full">
            <CalendarDays className="w-4 h-4 mr-2" /> Meus Agendamentos
          </Button>
        </Link>
        <Link to="/Home" className="flex-1">
          <Button variant="outline" className="w-full rounded-full">
            <Home className="w-4 h-4 mr-2" /> Voltar ao início
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}