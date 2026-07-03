import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Clock, AlertCircle, RefreshCw,
  Shield, Lock, Home, CreditCard, Smartphone, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import PublicNavbar from "@/components/public/PublicNavbar";
import AppointmentSummary from "@/components/payment/AppointmentSummary";
import PixPayment from "@/components/payment/PixPayment";
import CreditCardPayment from "@/components/payment/CreditCardPayment";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import { generatePixPayment, processCreditCardPayment } from "@/lib/mercadopago";
import { supabase } from "@/lib/supabaseClient";

const PIX_EXPIRY_SECONDS = 30 * 60;

// Payment flow statuses
// idle → generating → waiting (PIX) | processing (CC) → approved | failed | expired

export default function DepositPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pollRef = useRef(null);

  const appointmentData = location.state?.appointmentData;

  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [flowStatus, setFlowStatus] = useState("idle");
  // idle | generating | waiting | processing | approved | failed | expired

  const [appointmentId, setAppointmentId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [pixCode, setPixCode] = useState("");
  const [pixQrUrl, setPixQrUrl] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(PIX_EXPIRY_SECONDS);
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [errorMsg, setErrorMsg] = useState("");

  // Guard: redirect if arrived without booking data
  useEffect(() => {
    if (!appointmentData) navigate("/BookAppointment");
  }, [appointmentData, navigate]);

  // PIX countdown
  useEffect(() => {
    if (flowStatus !== "waiting") return;
    if (secondsLeft <= 0) {
      setFlowStatus("expired");
      handleExpirePayment();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [flowStatus, secondsLeft]);

  // Poll Payment entity for status (simulates webhook in demo)
  // MOCK: Polling is disabled for offline local database mode, status is managed by local simulation buttons
  useEffect(() => {
    // Disabled in offline mode
  }, [flowStatus, paymentId, queryClient]);

  // ── Supabase Database Mutations ──────────────────────────────────────────────

  const createAppointmentMutation = {
    mutateAsync: async (data) => {

      const {
        client_email,
        ...appointmentData
      } = data;

      const { data: result, error } = await supabase
        .from("appointments")
        .insert([{
          client_id: data.client_id,
          professional_id: data.professional_id,
          date: data.date,
          time: data.time,
          duration_minutes: data.duration_minutes,
          price: data.price,
          deposit_amount: data.deposit_amount,
          status: "pending_payment",
          payment_status: "pending",
        }])
        .select()
        .single();

      if (error) throw error;

      return result;
    }
  };
  const createPaymentMutation = {
    mutateAsync: async (data) => {
      const { data: result, error } = await supabase
        .from('payments')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    }
  };

  const updatePaymentMutation = {
    mutateAsync: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('payments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    }
  };

  const updateAppointmentMutation = {
    mutateAsync: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    }
  };

  const cancelAppointmentMutation = {
    isPending: false,
    mutate: async ({ id }) => {
      await supabase
        .from('appointments')
        .update({ status: "cancelled" })
        .eq('id', id);
      navigate("/BookAppointment");
    }
  };

  // ── Helpers ────────────────────────────────────────────────

  /** Ensure appointment exists in DB; returns its ID */
  const ensureAppointment = useCallback(async () => {
    if (appointmentId) return appointmentId;
    const created = await createAppointmentMutation.mutateAsync(appointmentData);
    setAppointmentId(created.id);
    return created.id;
  }, [appointmentId, appointmentData, createAppointmentMutation]);

  const handleExpirePayment = async () => {
    if (paymentId) {
      await updatePaymentMutation.mutateAsync({ id: paymentId, data: { payment_status: "expired" } });
    }
  };

  // ── PIX flow ───────────────────────────────────────────────

  const handleGeneratePix = async () => {
    try {
      setErrorMsg("");
      setFlowStatus("generating");

      // Cria o agendamento caso ainda não exista
      const appointment = await ensureAppointment();

      if (!appointment) {
        throw new Error("Não foi possível criar o agendamento.");
      }

      // Salva o ID do agendamento
      setAppointmentId(appointment.id);

      // Cria o registro de pagamento
      const payment = await createPaymentMutation.mutateAsync({
        appointment_id: appointment.id,
        amount: deposit,
        payment_method: "pix",
        payment_status: "pending",
      });

      setPaymentId(payment.id);

      // Simula geração do PIX
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPixCode(
        "00020126580014BR.GOV.BCB.PIX0114PIXDEMO520400005303986540550.005802BR5925BELLE VIE6009SAO PAULO62070503***6304ABCD"
      );

      setPixQrUrl(
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PIX-DEMO"
      );

      setSecondsLeft(30 * 60);

      setFlowStatus("waiting");

      toast({
        title: "PIX gerado!",
        description: "Escaneie o QR Code ou copie o código PIX.",
      });

    } catch (err) {
      console.error(err);

      setErrorMsg(err.message || "Erro ao gerar PIX.");

      setFlowStatus("failed");

      toast({
        title: "Erro",
        description: "Não foi possível gerar o PIX.",
        variant: "destructive",
      });
    }
  };

  const handlePixCopy = async () => {
    if (!pixCode) return;

    await navigator.clipboard.writeText(pixCode);
    toast.success("Código PIX copiado!");
  };
  // Demo only: simulate payment approved
  const handleSimulateApproval = async () => {
    if (!paymentId || !appointmentId) return;
    await Promise.all([
      updatePaymentMutation.mutateAsync({ id: paymentId, data: { payment_status: "approved" } }),
      updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: { status: "confirmed", payment_status: "paid" },
      }),
    ]);
    setFlowStatus("approved");
    queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-appointments"] });
  };

  // ── Credit Card flow ───────────────────────────────────────

  const handleCreditCardPay = async () => {
    const { number, name, expiry, cvv } = cardForm;
    if (!number || !name || !expiry || !cvv) {
      toast({ title: "Preencha todos os campos do cartão.", variant: "destructive" });
      return;
    }
    setFlowStatus("processing");
    setErrorMsg("");

    try {
      const apptId = await ensureAppointment();
      const { success, mpPaymentId, errorMessage } = await processCreditCardPayment({
        amount: appointmentData.deposit_amount || 50,
        cardData: cardForm,
      });

      const payment = await createPaymentMutation.mutateAsync({
        appointment_id: apptId,
        deposit_amount: appointmentData.deposit_amount || 50,
        payment_method: "credit_card",
        payment_status: success ? "approved" : "rejected",
        mp_payment_id: mpPaymentId,
        error_message: errorMessage,
      });
      setPaymentId(payment.id);

      if (success) {
        await updateAppointmentMutation.mutateAsync({
          id: apptId,
          data: { status: "confirmed", payment_status: "paid" },
        });
        setFlowStatus("approved");
        queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-appointments"] });
      } else {
        setErrorMsg(errorMessage || "Pagamento recusado. Verifique os dados do cartão.");
        setFlowStatus("failed");
      }
    } catch (err) {
      setErrorMsg("Erro ao processar o pagamento. Tente novamente.");
      setFlowStatus("failed");
    }
  };

  // ── Cancel ─────────────────────────────────────────────────

  const handleCancel = () => {
    if (appointmentId) {
      cancelAppointmentMutation.mutate({ id: appointmentId });
    } else {
      navigate("/BookAppointment");
    }
  };

  const handleRetry = () => {
    setFlowStatus("idle");
    setErrorMsg("");
    setPixCode("");
    setPixQrUrl("");
    setSecondsLeft(PIX_EXPIRY_SECONDS);
    setPaymentId(null);
  };

  // ── Render guard ───────────────────────────────────────────
  if (!appointmentData) return null;

  const deposit = appointmentData.deposit_amount || 0;
  const isLoading = flowStatus === "generating" || flowStatus === "processing";

  return (
    <div className="min-h-screen bg-[hsl(30,25%,98%)]">
      <PublicNavbar />

      <div className="pt-28 pb-20 max-w-5xl mx-auto px-4">

        {/* Urgency banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-center gap-2 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            ⚡ Disponibilidade limitada — este horário será liberado se o sinal não for pago em breve.
          </p>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-[hsl(350,35%,45%)] text-xs font-semibold uppercase tracking-widest mb-2">
            Etapa final
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-gray-900">
            Confirmar Agendamento
          </h1>
          <div className="w-16 h-0.5 bg-[hsl(38,50%,55%)] mx-auto mt-4" />
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── SUCCESS ────────────────────────────────────────── */}
          {flowStatus === "approved" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <PaymentSuccess appointmentData={appointmentData} appointmentId={appointmentId} />
            </motion.div>
          )}

          {/* ── MAIN FLOW ──────────────────────────────────────── */}
          {flowStatus !== "approved" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Left: Summary */}
              <div className="lg:col-span-2">
                <AppointmentSummary data={appointmentData} />
              </div>

              {/* Right: Payment */}
              <div className="lg:col-span-3 space-y-6">

                {/* Title */}
                <div>
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-gray-900 mb-1">
                    Complete seu agendamento
                  </h2>
                  <p className="text-gray-500 text-sm">
                    O sinal é obrigatório para confirmar sua reserva. O restante é pago no dia do procedimento.
                  </p>
                </div>

                {/* Deposit highlight */}
                <div className="bg-gradient-to-r from-[hsl(350,35%,45%)]/10 to-[hsl(38,50%,55%)]/10 rounded-2xl p-5 border-2 border-[hsl(350,35%,45%)]/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[hsl(350,35%,45%)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    OBRIGATÓRIO
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">🔒 Sinal para garantir o horário</p>
                      <p className="font-['Playfair_Display'] text-3xl font-bold text-[hsl(350,35%,45%)]">
                        R$ {deposit.toFixed(2)}
                      </p>
                      <p className="text-xs text-[hsl(350,35%,45%)] font-medium mt-1">
                        Sem o sinal, o horário não é confirmado
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Valor total</p>
                      <p className="text-lg font-semibold text-gray-700">R$ {appointmentData.price?.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">restante no dia</p>
                    </div>
                  </div>
                </div>

                {/* Method selector — only when idle */}
                {flowStatus === "idle" && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "pix", icon: Smartphone, label: "PIX", badge: "Instantâneo", badgeColor: "bg-green-100 text-green-700" },
                      { id: "credit_card", icon: CreditCard, label: "Cartão de Crédito", badge: "Visa / Master", badgeColor: "bg-blue-100 text-blue-700" },
                    ].map(({ id, icon: Icon, label, badge, badgeColor }) => (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === id
                          ? "border-[hsl(350,35%,45%)] bg-[hsl(350,35%,45%)]/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                      >
                        <Icon className={`w-6 h-6 ${paymentMethod === id ? "text-[hsl(350,35%,45%)]" : "text-gray-400"}`} />
                        <span className={`text-sm font-semibold ${paymentMethod === id ? "text-[hsl(350,35%,45%)]" : "text-gray-600"}`}>
                          {label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* ── PIX ── */}
                {paymentMethod === "pix" && !["approved", "processing"].includes(flowStatus) && (
                  <PixPayment
                    status={flowStatus}
                    pixCode={pixCode}
                    pixQrUrl={pixQrUrl}
                    secondsLeft={secondsLeft}
                    deposit={deposit}
                    onGenerate={handleGeneratePix}
                    onCopy={handlePixCopy}
                    onSimulate={handleSimulateApproval}
                    onRetry={handleRetry}
                  />
                )}

                {/* ── Credit Card ── */}
                {paymentMethod === "credit_card" && flowStatus === "idle" && (
                  <CreditCardPayment
                    form={cardForm}
                    onChange={setCardForm}
                    onPay={handleCreditCardPay}
                    deposit={deposit}
                  />
                )}

                {/* ── Loading spinner ── */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-14"
                  >
                    <div className="w-14 h-14 border-4 border-[hsl(350,35%,45%)]/20 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">
                      {flowStatus === "generating" ? "Gerando código PIX..." : "Processando pagamento..."}
                    </p>
                    <p className="text-xs text-gray-400">Aguarde, isso pode levar alguns segundos.</p>
                  </motion.div>
                )}

                {/* ── Failed ── */}
                {flowStatus === "failed" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 rounded-2xl p-6 text-center border border-red-100 space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-700 text-lg mb-1">Pagamento não aprovado</p>
                      <p className="text-sm text-red-500">{errorMsg || "Verifique os dados e tente novamente."}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={handleRetry} className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                        <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
                      </Button>
                      <Button onClick={() => { setPaymentMethod(paymentMethod === "pix" ? "credit_card" : "pix"); handleRetry(); }} variant="outline" className="rounded-full">
                        Trocar forma de pagamento
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── Expired ── */}
                {flowStatus === "expired" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-200 space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                      <Clock className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800 text-lg mb-1">PIX expirado</p>
                      <p className="text-sm text-amber-600">O tempo para pagamento esgotou. Gere um novo código para continuar.</p>
                    </div>
                    <Button
                      onClick={handleRetry}
                      className="bg-[hsl(350,35%,45%)] text-white rounded-full hover:bg-[hsl(350,35%,38%)]"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Gerar novo PIX
                    </Button>
                  </motion.div>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-5 pt-1 text-gray-400 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>Dados criptografados</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(350,35%,45%)]" />
                    <span>Mercado Pago</span>
                  </div>
                </div>

                {/* Cancel / go home */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelAppointmentMutation.isPending}
                    className="rounded-full flex-1 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    {cancelAppointmentMutation.isPending ? "Cancelando..." : "Cancelar agendamento"}
                  </Button>
                  <Link to="/Home" className="flex-1">
                    <Button variant="ghost" className="w-full rounded-full text-gray-500">
                      <Home className="w-4 h-4 mr-2" /> Voltar ao início
                    </Button>
                  </Link>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}