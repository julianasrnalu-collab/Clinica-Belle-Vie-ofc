import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Building, Phone, MapPin, Instagram, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardSettings() {
  const [form, setForm] = useState({
    clinic_name: "",
    phone: "",
    address: "",
    instagram_url: "",
    business_hours: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('clinic_settings').select('*').eq('id', 1).single();
        if (error) throw error;
        if (data) setForm(data);
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('clinic_settings').update(form).eq('id', 1);
      if (error) throw error;
      toast({ title: "Configurações atualizadas!" });
    } catch (err) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Clínica</h1>
        <p className="text-gray-500 text-sm">Atualize as informações institucionais exibidas no site público.</p>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Dados Principais</CardTitle>
          <CardDescription>Estes dados aparecerão no rodapé, menu e páginas de contato do site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-1.5 mb-2"><Building className="w-4 h-4 text-gray-500" /> Nome da Clínica</Label>
                <Input value={form.clinic_name} onChange={e => setForm({...form, clinic_name: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-2"><Phone className="w-4 h-4 text-gray-500" /> Telefone / WhatsApp</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <Label className="flex items-center gap-1.5 mb-2"><MapPin className="w-4 h-4 text-gray-500" /> Endereço Completo</Label>
                <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-2"><Instagram className="w-4 h-4 text-gray-500" /> Link do Instagram</Label>
                <Input value={form.instagram_url} onChange={e => setForm({...form, instagram_url: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-2"><Clock className="w-4 h-4 text-gray-500" /> Horário de Funcionamento</Label>
                <Input value={form.business_hours} onChange={e => setForm({...form, business_hours: e.target.value})} placeholder="Seg-Sex: 08h às 18h" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" disabled={saving} className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white w-full sm:w-auto px-8">
                {saving ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> Salvar Informações</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
