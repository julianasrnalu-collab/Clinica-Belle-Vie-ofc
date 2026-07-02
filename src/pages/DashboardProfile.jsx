import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Save, Shield, Plus, X, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Hardcoded common services for the demo to select from
const AVAILABLE_SERVICES = [
  "Limpeza de Pele",
  "Botox",
  "Preenchimento Labial",
  "Drenagem Linfática",
  "Microagulhamento",
  "Peeling Químico",
  "Harmonização Facial",
  "Massagem Modeladora"
];

export default function DashboardProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const profile = user?.profile;
  const role = profile?.role || "client";

  // State
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    services_performed: []
  });
  
  // Security State
  const [securityData, setSecurityData] = useState({
    email: user?.email || "",
    password: ""
  });
  const [securityLoading, setSecurityLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        specialization: profile.specialization || "",
        services_performed: profile.services_performed || []
      });
    }
  }, [profile]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          specialization: formData.specialization,
          services_performed: formData.services_performed
        })
        .eq('id', user.id);

      if (error) throw error;
      toast({ title: "Perfil atualizado com sucesso!" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    try {
      const updates = {};
      if (securityData.email !== user.email) updates.email = securityData.email;
      if (securityData.password) updates.password = securityData.password;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        toast({ title: "Credenciais atualizadas!" });
        setSecurityData({ ...securityData, password: "" });
      }
    } catch (error) {
      toast({ title: "Erro ao atualizar segurança", description: error.message, variant: "destructive" });
    } finally {
      setSecurityLoading(false);
    }
  };

  const addService = (service) => {
    if (!formData.services_performed.includes(service)) {
      setFormData({
        ...formData,
        services_performed: [...formData.services_performed, service]
      });
    }
  };

  const removeService = (serviceToRemove) => {
    setFormData({
      ...formData,
      services_performed: formData.services_performed.filter(s => s !== serviceToRemove)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações de Perfil</h1>
        <p className="text-gray-500">Gerencie suas informações pessoais e de segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Info */}
        <Card className="col-span-1 border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-[hsl(350,35%,45%)]" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>Telefone / WhatsApp</Label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="mt-1" 
                />
              </div>
              
              {role === 'employee' && (
                <div>
                  <Label>Sua Especialização</Label>
                  <Input 
                    value={formData.specialization} 
                    onChange={e => setFormData({...formData, specialization: e.target.value})} 
                    className="mt-1"
                    placeholder="Ex: Biomédica Esteta"
                  />
                </div>
              )}
              
              <Button type="submit" disabled={loading} className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)]">
                {loading ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> Salvar Perfil</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="col-span-1 border-gray-100 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-[hsl(350,35%,45%)]" />
              Segurança
            </CardTitle>
            <CardDescription>
              A atualização de email pode exigir confirmação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSecuritySave} className="space-y-4">
              <div>
                <Label>Email de Acesso</Label>
                <Input 
                  type="email"
                  value={securityData.email} 
                  onChange={e => setSecurityData({...securityData, email: e.target.value})} 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>Nova Senha (deixe em branco para não alterar)</Label>
                <Input 
                  type="password"
                  value={securityData.password} 
                  onChange={e => setSecurityData({...securityData, password: e.target.value})} 
                  className="mt-1"
                  placeholder="••••••••" 
                />
              </div>
              
              <Button type="submit" disabled={securityLoading} variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                {securityLoading ? "Salvando..." : "Atualizar Credenciais"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Employee Services Managed */}
        {role === 'employee' && (
          <Card className="col-span-1 md:col-span-2 border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Procedimentos que você realiza</CardTitle>
              <CardDescription>Estes serviços serão associados a você na hora do agendamento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-xl min-h-[80px] border border-dashed border-gray-200">
                {formData.services_performed.length === 0 && (
                  <p className="text-sm text-gray-400 m-auto">Nenhum serviço adicionado ainda.</p>
                )}
                {formData.services_performed.map(service => (
                  <Badge key={service} variant="secondary" className="px-3 py-1 bg-white border-gray-200 text-gray-700 shadow-sm">
                    {service}
                    <button onClick={() => removeService(service)} className="ml-2 text-red-400 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div>
                <Label className="mb-2 block">Adicionar Serviços</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SERVICES.filter(s => !formData.services_performed.includes(s)).map(service => (
                    <Button 
                      key={service}
                      variant="outline" 
                      size="sm" 
                      onClick={() => addService(service)}
                      className="text-xs rounded-full border-gray-200 hover:border-primary hover:text-primary"
                    >
                      <Plus className="w-3 h-3 mr-1" /> {service}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleProfileSave} disabled={loading} className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)]">
                  Salvar Serviços
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}