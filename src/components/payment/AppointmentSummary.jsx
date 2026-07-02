import React from "react";
import { Scissors, User, CalendarDays, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AppointmentSummary({ data }) {
  const formattedDate = data.date
    ? format(parseISO(data.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[hsl(30,15%,90%)] overflow-hidden sticky top-28">
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-[hsl(350,35%,45%)] to-[hsl(350,35%,35%)] p-6 text-white">
        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Resumo do Agendamento</p>
        <h3 className="font-['Playfair_Display'] text-xl font-bold">{data.service_name}</h3>
      </div>

      <div className="p-6 space-y-5">
        <DetailRow icon={User} label="Profissional" value={data.professional_name} />
        <DetailRow
          icon={CalendarDays}
          label="Data"
          value={formattedDate}
        />
        <DetailRow icon={Clock} label="Horário" value={data.time} />
        <DetailRow icon={Clock} label="Duração" value={`${data.duration_minutes} min`} />

        <div className="border-t border-[hsl(30,15%,90%)] pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Valor do serviço</span>
            <span className="font-medium text-gray-700">R$ {data.price?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center bg-[hsl(350,35%,45%)]/5 rounded-lg px-3 py-2">
            <span className="text-sm font-semibold text-[hsl(350,35%,45%)]">🔒 Sinal (agora)</span>
            <span className="font-bold text-[hsl(350,35%,45%)] text-base">R$ {(data.deposit_amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Restante (no dia)</span>
            <span className="text-gray-400">
              R$ {((data.price || 0) - (data.deposit_amount || 0)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Required deposit notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-2">
          <p className="text-xs text-amber-800 leading-relaxed text-center">
            O pagamento do sinal é obrigatório para garantir e confirmar o seu agendamento.
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[hsl(350,35%,45%)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[hsl(350,35%,45%)]" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="font-medium text-gray-800 text-sm">{value}</p>
      </div>
    </div>
  );
}