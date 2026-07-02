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
import { Pencil, User, Globe, EyeOff, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const emptyPro = { full_name: "", specialization: "", bio: "", avatar_url: "", is_active: true, show_on_website: true };

export default function DashboardProfessionals() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPro);
  
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee')
        .order('full_name');
        
      if (error) throw error;
      setProfessionals(data || []);
    } catch (err) {
      console.error("Error fetching professionals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          specialization: form.specialization,
          bio: form.bio,
          avatar_url: form.avatar_url,
          is_active: form.is_active,
          show_on_website: form.show_on_website
        })
        .eq('id', editing.id);

      if (error) throw error;
      
      toast({ title: "Profissional atualizado com sucesso!" });
      setOpen(false);
      fetchProfessionals();
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_on_website: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      fetchProfessionals(); // Refresh list to reflect changes
      toast({ title: !currentStatus ? "Adicionado ao site público!" : "Removido do site público." });
    } catch (err) {
      toast({ title: "Erro ao alterar visibilidade", variant: "destructive" });
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: currentStatus === 'pending' ? 'approved' : 'pending' })
        .eq('id', id);
        
      if (error) throw error;
      fetchProfessionals();
      toast({ title: currentStatus === 'pending' ? "Profissional Aprovado!" : "Acesso Revogado." });
    } catch (err) {
      toast({ title: "Erro ao aprovar", variant: "destructive" });
    }
  };

  const openEdit = (p) => { 
    setEditing(p); 
    setForm({
      full_name: p.full_name || "",
      specialization: p.specialization || "",
      bio: p.bio || "",
      avatar_url: p.avatar_url || "",
      is_active: p.is_active !== false,
      show_on_website: p.show_on_website !== false
    }); 
    setOpen(true); 
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão da Equipe</h1>
          <p className="text-gray-500 text-sm">Gerencie o perfil e a visibilidade dos profissionais no site.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((p) => (
            <Card key={p.id} className={`transition-all ${!p.is_active ? "opacity-60 bg-gray-50" : "shadow-sm hover:shadow-md"}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-gray-400" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate text-gray-900">{p.full_name}</h3>
                    <p className="text-sm text-[hsl(350,35%,45%)] truncate font-medium">{p.specialization || "Sem especialidade"}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {p.approval_status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-[10px] flex items-center gap-1 border-yellow-200">
                          <Clock className="w-3 h-3" /> Aguardando Aprovação
                        </Badge>
                      )}
                      {!p.is_active && <Badge variant="secondary" className="text-[10px] bg-gray-200 text-gray-600">Inativo</Badge>}
                      {p.show_on_website ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[10px] flex items-center gap-1 border-emerald-200">
                          <Globe className="w-3 h-3" /> No Site
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-300 text-[10px] flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Oculto
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8 text-gray-400 hover:text-primary" aria-label="Editar profissional">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Services Tags */}
                {p.services_performed && p.services_performed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-gray-100">
                    {p.services_performed.map((svc) => (
                      <Badge key={svc} variant="secondary" className="text-[10px] font-normal bg-gray-100 text-gray-600">
                        {svc}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Quick Toggles */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                  {p.approval_status === 'pending' && (
                    <div className="flex items-center justify-between bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                      <span className="text-xs text-yellow-800 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Aprovar cadastro?
                      </span>
                      <Button size="sm" onClick={() => toggleApproval(p.id, p.approval_status)} className="h-7 text-[10px] bg-yellow-500 hover:bg-yellow-600">
                        Aprovar
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Mostrar no site público?
                    </span>
                    <Switch 
                      checked={p.show_on_website !== false} 
                      onCheckedChange={() => toggleVisibility(p.id, p.show_on_website !== false)}
                      disabled={!p.is_active || p.approval_status === 'pending'} // Cannot show on website if inactive or pending
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {professionals.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
              Nenhum profissional cadastrado. Eles devem se cadastrar através da página de Registro.
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Perfil Profissional</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <Label>Nome Completo</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div>
              <Label>Especialização (Ex: Biomédica Esteta)</Label>
              <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
            </div>
            <div>
              <Label>Biografia para o site</Label>
              <Textarea 
                value={form.bio} 
                onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                rows={4} 
                placeholder="Breve resumo sobre a formação e experiência do profissional..."
              />
            </div>
            <div>
              <Label>URL da Foto de Perfil</Label>
              <Input 
                value={form.avatar_url} 
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} 
                placeholder="https://exemplo.com/foto.jpg"
              />
              <p className="text-[10px] text-gray-400 mt-1">Cole o link de uma imagem da internet para ser exibida no site.</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-100 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Mostrar no Site Público</Label>
                  <p className="text-[10px] text-gray-500">Exibe o card deste profissional na página "Equipe".</p>
                </div>
                <Switch checked={form.show_on_website} onCheckedChange={(v) => setForm({ ...form, show_on_website: v })} disabled={!form.is_active} />
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <Label className="text-gray-700">Acesso Ativo</Label>
                  <p className="text-[10px] text-gray-500">Se desativado, o profissional não poderá acessar o painel e será oculto do site.</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(v) => {
                  setForm({ ...form, is_active: v, show_on_website: v ? form.show_on_website : false })
                }} />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white mt-4 h-11">
              {saving ? "Salvando..." : <><CheckCircle className="w-4 h-4 mr-2"/> Salvar Alterações</>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}