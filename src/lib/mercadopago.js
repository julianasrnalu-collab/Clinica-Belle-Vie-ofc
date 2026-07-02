/**
 * Mercado Pago integration helpers.
 *
 * NOTE: Real MP API calls (create payment, check status) require a server-side
 * backend function with the MP Access Token secret. Since this app currently
 * runs without backend functions, we use the InvokeLLM integration to generate
 * realistic PIX codes for demo/staging, and poll the Payment entity for status
 * updates that would normally arrive via webhook.
 *
 * To enable real Mercado Pago:
 *  1. Upgrade to Builder+ to unlock backend functions.
 *  2. Create a backend function `createMercadoPagoPayment` that calls:
 *     POST https://api.mercadopago.com/v1/payments
 *  3. Create a webhook endpoint function to receive MP notifications and
 *     update Payment + Appointment status automatically.
 */

import { base44 } from "@/api/base44Client";

const PIX_EXPIRY_MINUTES = 30;

/**
 * Generates a PIX payment via Mercado Pago (demo: uses LLM for realistic code).
 * Returns { pixCode, pixQrUrl, expiresAt, mpPaymentId }
 */
export async function generatePixPayment({ amount, appointmentId, clientName, clientEmail }) {
  const expiresAt = new Date(Date.now() + PIX_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // Generate a realistic PIX EMV code using the fallback (offline mode)
  const pixCode = buildFallbackPixCode(amount);

  const pixQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(pixCode)}`;
  const mpPaymentId = `MP-PIX-${appointmentId?.slice(-6).toUpperCase()}-${Date.now()}`;

  return { pixCode, pixQrUrl, expiresAt, mpPaymentId };
}

/**
 * Simulates credit card processing (real implementation needs backend function).
 * Returns { success, mpPaymentId, errorMessage }
 */
export async function processCreditCardPayment({ amount, cardData }) {
  // Simulate async processing delay
  await new Promise((r) => setTimeout(r, 2200));

  // Basic validation
  const number = cardData.number.replace(/\s/g, "");
  if (number.length < 13) {
    return { success: false, mpPaymentId: null, errorMessage: "Número de cartão inválido." };
  }

  const mpPaymentId = `MP-CC-${Date.now()}`;
  return { success: true, mpPaymentId, errorMessage: null };
}

/**
 * Polls the Payment entity for status changes (replaces real webhook in demo mode).
 */
export async function pollPaymentStatus(paymentId) {
  const results = await base44.entities.Payment.filter({ id: paymentId });
  return results?.[0] ?? null;
}

function buildFallbackPixCode(amount) {
  const val = (amount || 50).toFixed(2).replace(".", "");
  return `00020126580014BR.GOV.BCB.PIX0136bellevie-estetica@pix.com.br5204000053039865402${val}5802BR5913BelleVie Spa6009SAO PAULO62070503***6304ABCD`;
}