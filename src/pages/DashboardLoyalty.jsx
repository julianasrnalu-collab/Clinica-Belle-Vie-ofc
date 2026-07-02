import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Gift, Users, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const emptyBenefit = { title: "", required_points: 100, is_active: true };

export default function DashboardLoyalty() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBenefit);
  
  const [benefits, setBenefits] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [benefitsRes, clientsRes] = await Promise.all([
        supabase.from('loyalty_benefits').select('*').order('required_points', { ascending: true }),
        supabase.from('profiles').select('id, full_name, email, phone, loyalty_points').eq('role', 'client').order('loyalty_points', { ascending: false })
      ]);
        
      if (benefitsRes.error) throw benefitsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      
      setBenefits(benefitsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados de fidelidade", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveBenefit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('loyalty_benefits').update(form).eq('id', editing.id);
        if (error) throw error;
        toast({ title: "Benefício atualizado!" });
      } else {
        const { error } = await supabase.from('loyalty_benefits').insert([form]);
        if (error) throw error;
        toast({ title: "Benefício criado!" });
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      toast({ title: "Erro ao salvar benefício", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este benefício?")) return;
    try {
      const { error } = await supabase.from('loyalty_benefits').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Benefício excluído!" });
      fetchData();
    } catch (err) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handlePointsUpdate = async (clientId, currentPoints, addPoints) => {
    try {
      const newTotal = Math.max(0, currentPoints + addPoints);
      const { error } = await supabase.from('profiles').update({ loyalty_points: newTotal }).eq('id', clientId);
      if (error) throw error;
      toast({ title: "Pontos atualizados!" });
      fetchData();
    } catch (err) {
      toast({ title: "Erro ao atualizar pontos", variant: "destructive" });
    }
  };

  const openEdit = (b) => { setEditing(b); setForm({ title: b.title, required_points: b.required_points, is_active: b.is_active }); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyBenefit); setOpen(true); };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programa de Fidelidade</h1>
        <p className="text-gray-500 text-sm">Gerencie regras, benefícios e acompanhe a pontuação dos clientes.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Benefits Management (Left Col) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[hsl(350,35%,45%)]" /> Benefícios
              </h2>
              <Button onClick={openNew} size="sm" className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full">
                <Plus className="w-4 h-4 mr-1" /> Novo
              </Button>
            </div>
            
            <div className="space-y-4">
              {benefits.map(b => (
                <Card key={b.id} className={`border-gray-100 ${!b.is_active ? 'opacity-60 bg-gray-50' : 'shadow-sm'}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-[hsl(38,50%,55%)] hover:bg-[hsl(38,50%,50%)] text-white text-xs">
                          {b.required_points} pontos
                        </Badge>
                        {!b.is_active && <Badge variant="outline" className="text-gray-500 text-[10px]">Inativo</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(b)} className="h-8 w-8 text-gray-400 hover:text-primary" aria-label="Editar benefício">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="h-8 w-8 text-gray-400 hover:text-red-500" aria-label="Excluir benefício">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {benefits.length === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">Nenhum benefício cadastrado.</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Points (Right Col) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[hsl(350,35%,45%)]" /> Saldo dos Clientes
            </h2>
            
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Pontos Atuais</th>
                      <th className="px-6 py-4 text-right">Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clients.map(client => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{client.full_name}</p>
                          <p className="text-xs text-gray-500">{client.phone || client.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Trophy className={`w-4 h-4 ${client.loyalty_points > 0 ? 'text-yellow-500' : 'text-gray-300'}`} />
                            <span className="font-bold text-gray-700 text-base">{client.loyalty_points}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handlePointsUpdate(client.id, client.loyalty_points, -50)} className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" aria-label={`Remover 50 pontos de ${client.full_name}`}>
                              -50
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handlePointsUpdate(client.id, client.loyalty_points, 50)} className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" aria-label={`Adicionar 50 pontos para ${client.full_name}`}>
                              +50
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
        </div>
      )}

      {/* Benefit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Benefício" : "Novo Benefício"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBenefit} className="space-y-4 mt-2">
            <div>
              <Label>Nome do Benefício (Ex: Limpeza de Pele)</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>Pontos Necessários para Resgate</Label>
              <Input type="number" value={form.required_points} onChange={(e) => setForm({ ...form, required_points: Number(e.target.value) })} required min={1} />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Benefício Ativo</Label>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white h-11 mt-4">
              {saving ? "Salvando..." : "Salvar Benefício"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
