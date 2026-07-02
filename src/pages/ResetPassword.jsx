import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LockKeyhole, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const { updatePassword, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  // Validate the URL hash to detect expired/invalid tokens or valid recovery sessions
  useEffect(() => {
    const hash = window.location.hash;
    
    // Supabase appends error info to the hash if the token is expired or invalid
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errDesc = params.get('error_description');
      
      if (errDesc?.includes('expired') || errDesc?.includes('invalid')) {
        setTokenError("O link de recuperação expirou ou é inválido. Por favor, solicite um novo.");
      } else {
        setTokenError(errDesc || "Ocorreu um erro ao validar o link de recuperação.");
      }
      return;
    }

    if (!isLoadingAuth && !isAuthenticated && !hash.includes('access_token')) {
      // If there's no hash and not authenticated, redirect to login
      navigate('/Login');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg("A nova senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/Dashboard');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message);
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
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockKeyhole className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Nova Senha</h1>
            <p className="text-gray-500 text-sm">
              Crie uma nova senha segura para sua conta.
            </p>
          </div>

          {tokenError ? (
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100 mb-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-red-800 mb-2">Link Inválido</h3>
              <p className="text-sm text-red-700 mb-6">
                {tokenError}
              </p>
              <Button onClick={() => navigate('/ForgotPassword')} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" /> Solicitar novo link
              </Button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium border border-red-100">
                  {errorMsg}
                </div>
              )}

              {success ? (
                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                  <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-green-800 mb-2">Senha atualizada!</h3>
                  <p className="text-sm text-green-700">
                    Sua senha foi redefinida com sucesso. Redirecionando...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div>
                    <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 h-12 rounded-xl bg-gray-50 border-gray-200"
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 h-12 rounded-xl bg-gray-50 border-gray-200"
                  placeholder="Repita a nova senha"
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
                  "Salvar nova senha"
                )}
              </Button>
            </form>
          )}
        </>
      )}
    </motion.div>
  </div>
    </div>
  );
}
