import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard, Calendar, Users, Scissors, BarChart3,
  MessageSquare, Settings, LogOut, Menu, X, User, ChevronDown, Star, Gift, Image
} from "lucide-react";
import { CLINIC_NAME } from "@/lib/constants";

const adminLinks = [
  { label: "Painel", path: "/Dashboard", icon: LayoutDashboard },
  { label: "Agenda", path: "/DashboardSchedule", icon: Calendar },
  { label: "Profissionais", path: "/DashboardProfessionals", icon: Users },
  { label: "Serviços", path: "/DashboardServices", icon: Scissors },
  { label: "Clientes", path: "/DashboardClients", icon: User },
  { label: "Relatórios", path: "/DashboardReports", icon: BarChart3 },
  { label: "Promoções", path: "/DashboardPromotions", icon: Gift },
  { label: "Fidelidade", path: "/DashboardLoyalty", icon: Star },
  { label: "Depoimentos", path: "/DashboardTestimonials", icon: MessageSquare },
  { label: "Galeria", path: "/DashboardGallery", icon: Image },
  { label: "Mensagens", path: "/DashboardMessages", icon: MessageSquare },
  { label: "Configurações", path: "/DashboardSettings", icon: Settings },
];

const professionalLinks = [
  { label: "Meu Painel", path: "/Dashboard", icon: LayoutDashboard },
  { label: "Minha Agenda", path: "/DashboardSchedule", icon: Calendar },
  { label: "Meu Perfil", path: "/DashboardProfile", icon: User },
  { label: "Relatórios", path: "/DashboardReports", icon: BarChart3 },
];

const clientLinks = [
  { label: "Meu Painel", path: "/Dashboard", icon: LayoutDashboard },
  { label: "Agendamentos", path: "/DashboardMyAppointments", icon: Calendar },
  { label: "Meu Perfil", path: "/DashboardProfile", icon: User },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.profile?.role || "client";
  const links = role === "admin" ? adminLinks : role === "employee" ? professionalLinks : clientLinks;

  // teste logout

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <Link to="/Home" className="font-['Playfair_Display'] text-xl font-semibold text-[hsl(350,35%,45%)]">
              {CLINIC_NAME}
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu lateral">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-[hsl(350,35%,45%)]/10 text-[hsl(350,35%,45%)]"
                    : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[hsl(350,35%,45%)]/10 flex items-center justify-center">
                <User className="w-4 h-4 text-[hsl(350,35%,45%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.profile?.full_name || user?.email || "Usuário"}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full px-2 py-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-8 gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu lateral">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link to="/Home" className="text-sm text-gray-500 hover:text-[hsl(350,35%,45%)]">
            Ver site
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}