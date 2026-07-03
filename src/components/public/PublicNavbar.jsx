import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLINIC_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";

const navLinks = [
  { label: "Início", path: "/Home" },
  { label: "Sobre", path: "/About" },
  { label: "Serviços", path: "/Services" },
  { label: "Equipe", path: "/Team" },
  { label: "Resultados", path: "/Results" },
  { label: "Promoções", path: "/Promotions" },
  { label: "Contato", path: "/Contact" },
];

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const getDashboardRoute = () => {
    if (!isAuthenticated) return "/Login";
    return user?.profile?.role === 'client' ? "/DashboardMyAppointments" : "/Dashboard";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_2px_24px_0_rgba(0,0,0,0.10)] transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22 py-3">

          {/* ── LOGO ── */}
          <Link to="/Home" className="flex items-center gap-3 group">
            {/* Monogram badge */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary shadow-md transition-all duration-300">
              <span className="font-serif text-base font-bold leading-none text-white">B</span>
            </div>

            {/* Wordmark */}
            <div className="flex flex-col leading-none">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.08em] text-gray-900 transition-colors duration-300">
                {CLINIC_NAME}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-accent transition-colors duration-300">
                Clínica Estética
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === link.path
                    ? "text-primary font-bold"
                    : "text-gray-600 hover:text-primary"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/BookAppointment">
              <Button className="rounded-full px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-all">
                Agendar
              </Button>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to={getDashboardRoute()}>
                  <Button variant="outline" className="rounded-full px-6 text-sm border-primary text-primary hover:bg-primary/5 transition-all">
                    Minha Conta
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="rounded-full px-4 text-sm text-gray-500 hover:text-red-600 transition-all">
                  Sair
                </Button>
              </div>
            ) : (
              <Link to={getDashboardRoute()}>
                <Button variant="outline" className="rounded-full px-6 text-sm border-primary text-primary hover:bg-primary/5 transition-all">
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          {/* Mobile logo strip */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="font-serif text-sm font-bold text-white">B</span>
            </div>
            <div>
              <p className="font-serif text-base font-bold text-gray-900 leading-none">{CLINIC_NAME}</p>
              <p className="text-[9px] uppercase tracking-widest text-accent">Clínica Estética</p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t border-gray-100">
              <Link to="/BookAppointment" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-semibold">
                  Agendar Consulta
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardRoute()} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/5">
                      Minha Conta
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout} className="w-full rounded-full text-gray-500 hover:text-red-600">
                    Sair da Conta
                  </Button>
                </>
              ) : (
                <Link to={getDashboardRoute()} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/5">
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}