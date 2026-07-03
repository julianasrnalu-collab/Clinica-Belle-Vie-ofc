import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Will hold { ...authUser, profileData }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth session error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error("Error loading profile:", error);
      }

      setUser({ ...authUser, profile: profile || null });
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  };

  const translateError = (error) => {
    const msg = error?.message || "";
    if (msg.includes("Invalid login credentials")) return "Email ou senha inválidos.";
    if (msg.includes("User already registered")) return "Este email já está cadastrado.";
    if (msg.includes("Password should be at least")) return "A senha deve ter no mínimo 6 caracteres.";
    if (msg.includes("not found")) return "Registro não encontrado.";
    if (msg.includes("Email not confirmed")) return "Por favor, confirme seu email.";
    if (msg.includes("For security purposes, you can only request this once every")) return "Por segurança, aguarde alguns segundos antes de solicitar um novo envio.";
    if (msg.includes("Token has expired or is invalid")) return "O link expirou ou é inválido. Por favor, solicite um novo.";
    if (msg.includes("New password should be different from the old password")) return "A nova senha deve ser diferente da atual.";
    return "Ocorreu um erro inesperado. Tente novamente.";
  };

  const login = async (email, password) => {
    try {
      setAuthError(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      await loadUserProfile(data.user);
      return data.user;
    } catch (error) {
      const translated = translateError(error);
      setAuthError(translated);
      throw new Error(translated);
    }
  };

  const register = async (userData, role = 'client') => {
    try {
      setAuthError(null);
      // 1. Create the user in auth.users
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error("Falha ao criar usuário");

      // 2. Update the profile in public.profiles (the row is automatically created by the Database Trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          specialization: userData.specialization || null,
          role: role,
          cpf: userData.cpf || null,
          birth_date: userData.birth_date || null,
          address_cep: userData.address_cep || null,
          address_street: userData.address_street || null,
          address_number: userData.address_number || null,
          address_complement: userData.address_complement || null,
          address_neighborhood: userData.address_neighborhood || null,
          address_city: userData.address_city || null,
          address_state: userData.address_state || null
        })
        .eq('id', data.user.id);

      if (profileError) throw profileError;

      await loadUserProfile(data.user);
      return data.user;
    } catch (error) {
      const translated = translateError(error);
      setAuthError(translated);
      throw new Error(translated);
    }
  };

  const resetPasswordForEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/ResetPassword`,
      });
      if (error) throw error;
    } catch (error) {
      const translated = translateError(error);
      throw new Error(translated);
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error) {
      const translated = translateError(error);
      throw new Error(translated);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const navigateToLogin = () => {
    // Deprecated: use useNavigate() in components instead
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      login,
      register,
      logout,
      resetPasswordForEmail,
      updatePassword,
      navigateToLogin,
      checkAppState: async () => {} // Kept for backwards compatibility with any remaining code
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
