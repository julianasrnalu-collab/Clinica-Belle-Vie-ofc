import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_WHATSAPP } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.entities.ContactMessage.create(form);
    setSending(false);
    setSent(true);
    toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
  };

  return (
    <div className="pt-20">
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
              Fale Conosco
            </p>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              Contato
            </h1>
            <div className="w-16 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Telefone</h3>
                    <p className="text-gray-500 mt-1">{CLINIC_PHONE}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                    <a
                      href={`https://wa.me/${CLINIC_WHATSAPP}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium hover:underline mt-1 block"
                    >
                      Enviar mensagem
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-500 mt-1">{CLINIC_EMAIL}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Endereço</h3>
                    <p className="text-gray-500 mt-1">{CLINIC_ADDRESS}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              {sent ? (
                <div className="bg-secondary rounded-2xl p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-semibold mb-2 text-gray-900">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-gray-500">Entraremos em contato em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-secondary rounded-2xl p-8 space-y-5 shadow-sm border border-primary/5">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 font-semibold transition-all"
                  >
                    {sending ? "Enviando..." : "Enviar Mensagem"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}