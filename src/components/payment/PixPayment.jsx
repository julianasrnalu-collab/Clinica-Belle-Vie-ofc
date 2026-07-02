import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, CheckCircle2, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PixPayment({ status, pixCode, pixQrUrl, secondsLeft, deposit, onGenerate, onCopy, onSimulate, onRetry }) {
  const isUrgent = secondsLeft < 300; // last 5 min

  if (status === "idle") {
    return (
      <div className="bg-white rounded-2xl border border-[hsl(30,15%,90%)] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
          <Smartphone className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Pagar com PIX</h3>
          <p className="text-sm text-gray-500">
            Pagamento instantâneo. Escaneie o QR Code ou use o código copia e cola.
          </p>
        </div>
        <Button
          onClick={onGenerate}
          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full h-12 text-base"
        >
          Gerar QR Code PIX
        </Button>
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[hsl(30,15%,90%)] p-6 space-y-5"
      >
        {/* Countdown */}
        <div className={`rounded-xl px-4 py-3 border ${isUrgent ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${isUrgent ? "text-red-700" : "text-green-700"}`}>
              <span className={`w-2 h-2 rounded-full ${isUrgent ? "bg-red-500 animate-pulse" : "bg-green-500 animate-pulse"}`} />
              {isUrgent ? "⚠️ Este código expira em" : "⏱ Pague dentro de"}
            </span>
            <span className={`text-2xl font-bold font-mono tabular-nums ${isUrgent ? "text-red-700" : "text-green-700"}`}>
              {formatTime(secondsLeft)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/60 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${isUrgent ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${(secondsLeft / (30 * 60)) * 100}%` }}
            />
          </div>
          {isUrgent && (
            <p className="text-xs text-red-600 mt-1.5 font-medium">
              Após expirar, o horário pode ser liberado para outra pessoa.
            </p>
          )}
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={pixQrUrl}
            alt="QR Code PIX"
            className="w-44 h-44 rounded-xl border border-gray-200 shadow-sm"
          />
          <p className="text-xs text-gray-400 text-center">
            Escaneie com o app do seu banco
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">
            PIX Copia e Cola
          </p>
          <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
            <p className="text-xs text-gray-600 font-mono break-all flex-1 leading-relaxed">
              {pixCode}
            </p>
            <button
              onClick={onCopy}
              className="text-[hsl(350,35%,45%)] hover:text-[hsl(350,35%,35%)] flex-shrink-0 mt-0.5"
              title="Copiar código"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={onCopy}
            variant="outline"
            className="w-full mt-3 rounded-full border-green-300 text-green-700 hover:bg-green-50"
          >
            <Copy className="w-4 h-4 mr-2" /> Copiar código PIX
          </Button>
        </div>

        {/* Waiting status */}
        <div className="flex items-center gap-3 bg-amber-50 rounded-xl px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          <p className="text-sm text-amber-700">Aguardando confirmação do pagamento...</p>
        </div>

        {/* Demo simulate button */}
        <Button
          onClick={onSimulate}
          variant="ghost"
          size="sm"
          className="w-full text-xs text-gray-400 hover:text-gray-600"
        >
          [Demo] Simular pagamento aprovado
        </Button>
      </motion.div>
    );
  }

  return null;
}