import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_EMAIL, CLINIC_ADDRESS } from "@/lib/constants";

export default function PublicFooter() {
  return (
    <footer className="bg-[hsl(20,10%,15%)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="font-['Playfair_Display'] text-2xl font-semibold mb-4 text-[hsl(38,50%,70%)]">
              {CLINIC_NAME}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Excelência em estética e bem-estar. Transformando beleza com ciência e arte.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[hsl(38,50%,70%)]">
              Links Rápidos
            </h4>
            <div className="space-y-2">
              {[
                { label: "Sobre", path: "/About" },
                { label: "Serviços", path: "/Services" },
                { label: "Equipe", path: "/Team" },
                { label: "Contato", path: "/Contact" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-gray-400 text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[hsl(38,50%,70%)]">
              Contato
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{CLINIC_PHONE}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{CLINIC_EMAIL}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{CLINIC_ADDRESS}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[hsl(38,50%,70%)]">
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(350,35%,45%)] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(350,35%,45%)] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} {CLINIC_NAME}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}