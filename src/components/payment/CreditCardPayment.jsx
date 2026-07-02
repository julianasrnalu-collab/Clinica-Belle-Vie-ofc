import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CreditCard } from "lucide-react";

function formatCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function CreditCardPayment({ form, onChange, onPay, deposit }) {
  const handleChange = (field, raw) => {
    let val = raw;
    if (field === "number") val = formatCardNumber(raw);
    if (field === "expiry") val = formatExpiry(raw);
    if (field === "cvv") val = raw.replace(/\D/g, "").slice(0, 4);
    onChange({ ...form, [field]: val });
  };

  // Detect card brand
  const brand = form.number.startsWith("4") ? "Visa" :
    form.number.startsWith("5") ? "Mastercard" :
    form.number.startsWith("3") ? "Amex" : null;

  return (
    <div className="bg-white rounded-2xl border border-[hsl(30,15%,90%)] p-6 space-y-5">
      {/* Card preview */}
      <div className="bg-gradient-to-br from-[hsl(350,35%,45%)] to-[hsl(350,35%,30%)] rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -ml-8 -mb-8" />
        <p className="text-white/60 text-xs mb-4">BelleVie Aesthetic Clinic</p>
        <p className="font-mono text-lg tracking-widest mb-4">
          {form.number || "•••• •••• •••• ••••"}
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white/60 text-xs">TITULAR</p>
            <p className="font-medium text-sm">{form.name || "NOME NO CARTÃO"}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">VALIDADE</p>
            <p className="font-medium text-sm">{form.expiry || "MM/AA"}</p>
          </div>
          {brand && <p className="text-white/80 text-sm font-bold absolute top-4 right-5">{brand}</p>}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="card-number" className="text-xs text-gray-500 uppercase tracking-wide">
            Número do cartão
          </Label>
          <div className="relative mt-1">
            <Input
              id="card-number"
              placeholder="0000 0000 0000 0000"
              value={form.number}
              onChange={(e) => handleChange("number", e.target.value)}
              className="pl-10"
            />
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div>
          <Label htmlFor="card-name" className="text-xs text-gray-500 uppercase tracking-wide">
            Nome no cartão
          </Label>
          <Input
            id="card-name"
            placeholder="Como aparece no cartão"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="card-expiry" className="text-xs text-gray-500 uppercase tracking-wide">
              Validade
            </Label>
            <Input
              id="card-expiry"
              placeholder="MM/AA"
              value={form.expiry}
              onChange={(e) => handleChange("expiry", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="card-cvv" className="text-xs text-gray-500 uppercase tracking-wide">
              CVV
            </Label>
            <Input
              id="card-cvv"
              placeholder="•••"
              type="password"
              value={form.cvv}
              onChange={(e) => handleChange("cvv", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={onPay}
        className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full h-12 text-base"
      >
        <Lock className="w-4 h-4 mr-2" />
        Pagar R$ {deposit.toFixed(2)}
      </Button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Seus dados são criptografados e protegidos
      </p>
    </div>
  );
}