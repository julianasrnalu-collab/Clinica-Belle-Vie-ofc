import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import { motion } from 'framer-motion';

export default function RegisterEmployee() {
  const [formData, setFormData] = useState({ 
    full_name: '', phone: '', specialization: '', email: '', password: '',
    cpf: '', birth_date: '',
    address_cep: '', address_street: '', address_number: '',
    address_complement: '', address_neighborhood: '', address_city: '', address_state: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await register(formData, 'employee');
      navigate('/Dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  return (
    <div className="min-h-screen bg-[hsl(30,25%,98%)] flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-primary/10"
        >
          <div className="mb-6">
            <Link to="/Login" className="text-sm text-gray-500 hover:text-accent flex items-center w-fit">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Login
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Cadastro de Profissional</h1>
            <p className="text-gray-500">Acesso exclusivo para equipe clínica</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" required value={formData.full_name} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="Ex: Dra. Ana Sousa" />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" required value={formData.cpf} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="000.000.000-00" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input id="birth_date" type="date" required value={formData.birth_date} onChange={handleChange} className="mt-1.5 bg-gray-50" />
              </div>
              <div>
                <Label htmlFor="phone">Celular / WhatsApp</Label>
                <Input id="phone" required value={formData.phone} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div>
              <Label htmlFor="specialization">Especialidade</Label>
              <Input id="specialization" required value={formData.specialization} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="Ex: Biomédica Esteta" />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="address_cep">CEP</Label>
                  <Input id="address_cep" required value={formData.address_cep} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="00000-000" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address_street">Rua / Logradouro</Label>
                  <Input id="address_street" required value={formData.address_street} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="Avenida Paulista" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="address_number">Número</Label>
                  <Input id="address_number" required value={formData.address_number} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="1000" />
                </div>
                <div>
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input id="address_complement" value={formData.address_complement} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="Apto 45" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input id="address_neighborhood" required value={formData.address_neighborhood} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="Bela Vista" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input id="address_city" required value={formData.address_city} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="São Paulo" />
                </div>
                <div>
                  <Label htmlFor="address_state">UF</Label>
                  <Input id="address_state" required value={formData.address_state} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="SP" maxLength={2} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Corporativo</Label>
                <Input id="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1.5 bg-gray-50" placeholder="ana@bellevie.com" />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} className="mt-1.5 bg-gray-50" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-accent hover:bg-[hsl(38,50%,50%)] text-white rounded-xl text-base font-semibold shadow-md transition-all mt-6">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Briefcase className="w-4 h-4 mr-2" /> Solicitar Acesso</>}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
