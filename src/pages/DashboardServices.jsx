import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

const emptyService = { name: "", category: "facial", description: "", duration_minutes: 60, price: 0, deposit_amount: 0 };

export default function DashboardServices() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      toast({ title: "Erro ao buscar serviços", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('services').update(form).eq('id', editing.id);
        if (error) throw error;
        toast({ title: "Serviço atualizado!" });
      } else {
        const { error } = await supabase.from('services').insert([form]);
        if (error) throw error;
        toast({ title: "Serviço criado!" });
      }
      setOpen(false);
      fetchServices();
    } catch (err) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Serviço excluído" });
      fetchServices();
    } catch (err) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const openEdit = (s) => { 
    setEditing(s); 
    setForm({
      name: s.name,
      category: s.category,
      description: s.description || "",
      duration_minutes: s.duration_minutes,
      price: s.price,
      deposit_amount: s.deposit_amount
    }); 
    setOpen(true); 
  };
  
  const openNew = () => { setEditing(null); setForm(emptyService); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <Button onClick={openNew} className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Novo Serviço
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs">{CATEGORY_LABELS[s.category] || s.category}</Badge>
                    <h3 className="font-semibold">{s.name}</h3>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Editar serviço">
                      <Pencil className="w-4 h-4 text-gray-400 hover:text-[hsl(350,35%,45%)]" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} aria-label="Excluir serviço">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{s.description}</p>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-500"><Clock className="w-3.5 h-3.5" />{s.duration_minutes}min</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">R$ {Number(s.price).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">Sinal: R$ {Number(s.deposit_amount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {services.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Nenhum serviço cadastrado.
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Nome do Serviço</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duração (min)</Label>
                <Input type="number" min="5" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} required />
              </div>
              <div>
                <Label>Preço Total (R$)</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
              </div>
            </div>
            <div>
              <Label>Valor do Sinal Antecipado (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: Number(e.target.value) })} required />
              <p className="text-xs text-gray-400 mt-1">Este valor será cobrado via PIX/Cartão no momento do agendamento online.</p>
            </div>
            
            <Button type="submit" disabled={saving} className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white mt-4 h-11">
              {saving ? "Salvando..." : "Salvar Serviço"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}