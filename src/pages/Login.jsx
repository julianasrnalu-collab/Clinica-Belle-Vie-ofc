import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, ArrowRight } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await login(email, password);
      
      const searchParams = new URLSearchParams(location.search);
      const returnUrl = searchParams.get('returnUrl');
      
      if (returnUrl) {
        navigate(returnUrl);
      } else if (user?.profile?.role === 'client') {
        navigate('/DashboardMyAppointments');
      } else {
        navigate('/Dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message === "Invalid login credentials" ? "Email ou senha incorretos." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(30,25%,98%)] flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-primary/10"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Bem-vindo(a)</h1>
            <p className="text-gray-500">Faça login para acessar sua conta</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-12 rounded-xl bg-gray-50 border-gray-200"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <Link to="/ForgotPassword" className="text-xs text-primary hover:underline font-medium">Esqueceu a senha?</Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-12 rounded-xl bg-gray-50 border-gray-200"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-semibold shadow-md transition-all mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar <LogIn className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Ainda não tem uma conta?{' '}
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/RegisterClient" className="text-primary font-semibold hover:underline inline-flex items-center justify-center">
                Cadastre-se como Cliente <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
              <Link to="/RegisterEmployee" className="text-accent font-semibold hover:underline inline-flex items-center justify-center text-xs">
                Sou um Profissional da Clínica
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
