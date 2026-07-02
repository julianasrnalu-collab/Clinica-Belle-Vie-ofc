import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Tag, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const emptyPromo = { title: "", description: "", discount_value: "", image_url: "", is_active: true };

export default function DashboardPromotions() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPromo);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPromotions(data || []);
    } catch (err) {
      console.error("Erro ao buscar promoções", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('promotions')
          .update(form)
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: "Promoção atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert([form]);
        if (error) throw error;
        toast({ title: "Promoção criada com sucesso!" });
      }
      setOpen(false);
      fetchPromotions();
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta promoção?")) return;
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Promoção excluída!" });
      fetchPromotions();
    } catch (err) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const openEdit = (p) => { 
    setEditing(p); 
    setForm({
      title: p.title,
      description: p.description || "",
      discount_value: p.discount_value || "",
      image_url: p.image_url || "",
      is_active: p.is_active !== false
    }); 
    setOpen(true); 
  };
  
  const openNew = () => { 
    setEditing(null); 
    setForm(emptyPromo); 
    setOpen(true); 
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promoções</h1>
          <p className="text-gray-500 text-sm">Gerencie os pacotes e descontos exibidos no site público.</p>
        </div>
        <Button onClick={openNew} className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Nova Promoção
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((p) => (
            <Card key={p.id} className={`overflow-hidden transition-all ${!p.is_active ? "opacity-60 bg-gray-50" : "shadow-sm hover:shadow-md"}`}>
              {p.image_url && (
                <div className="h-40 w-full overflow-hidden">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="pr-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{p.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {p.discount_value && (
                        <Badge className="bg-[hsl(38,50%,55%)] text-white hover:bg-[hsl(38,50%,50%)]">
                          <Tag className="w-3 h-3 mr-1" /> {p.discount_value}
                        </Badge>
                      )}
                      {!p.is_active && <Badge variant="secondary" className="text-[10px] bg-gray-200 text-gray-600">Inativa</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8 text-gray-400 hover:text-primary" aria-label="Editar promoção">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-gray-400 hover:text-red-500" aria-label="Excluir promoção">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{p.description}</p>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-500 font-medium">Exibir no site?</span>
                  <Switch 
                    checked={p.is_active} 
                    onCheckedChange={async (v) => {
                      await supabase.from('promotions').update({ is_active: v }).eq('id', p.id);
                      fetchPromotions();
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {promotions.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-gray-500 font-medium">Nenhuma promoção cadastrada.</p>
              <p className="text-sm mt-1">Clique em "Nova Promoção" para começar a oferecer descontos.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Promoção" : "Nova Promoção"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <Label>Título do Pacote</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Pacote Verão" required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={3} 
                placeholder="Detalhes sobre os procedimentos inclusos..."
                required 
              />
            </div>
            <div>
              <Label>Valor / Desconto (Ex: '20% OFF' ou 'Por R$ 150')</Label>
              <Input value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="20% OFF" />
            </div>
            <div>
              <Label>URL da Imagem Banner</Label>
              <div className="flex gap-2">
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://exemplo.com/banner.jpg" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Promoção Ativa</Label>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white h-11 mt-2">
              {saving ? "Salvando..." : "Salvar Promoção"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}