import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ArrowLeft, MailCheck } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPasswordForEmail } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      await resetPasswordForEmail(email);
      setSuccess(true);
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
          <div className="mb-6">
            <Link to="/Login" className="text-sm text-gray-500 hover:text-primary flex items-center w-fit">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Login
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Recuperar Senha</h1>
            <p className="text-gray-500 text-sm">
              Digite o e-mail cadastrado e enviaremos um link seguro para você redefinir sua senha.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {success ? (
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
              <MailCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-800 mb-2">E-mail enviado!</h3>
              <p className="text-sm text-green-700">
                Se o e-mail <strong>{email}</strong> estiver cadastrado em nosso sistema, você receberá um link de recuperação em instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <Label htmlFor="email">E-mail</Label>
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-semibold shadow-md transition-all mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
