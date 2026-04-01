import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import {
  ShieldCheck,
  MessageSquare,
  Wrench,
  ArrowRight,
  Building2,
  Users,
  Car,
  PhoneCall,
  Mail,
  ClipboardList,
  CheckCircle2,
  Zap,
  Globe,
  Wallet,
  Smartphone,
  Lock,
  Calendar,
  MessageCircle,
  Shield,
  ZapIcon,
  Globe2,
  CheckCircle,
  Dog
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const WHATSAPP_LINK = "https://wa.me/573212915001";

  const plans = [
    {
      name: "Pago Único",
      tagline: "Ideal para implementaciones directas",
      price: "$800.000",
      priceSuffix: "COP",
      paymentTerms: "Modalidad 50/50",
      features: [
        "Modalidad 50/50",
        "Beta Implementation",
        "Soporte Técnico"
      ],
      cta: "Elegir Plan",
      highlight: false
    },
    {
      name: "Suscripción",
      tagline: "Continuidad y mantenimiento total",
      price: "$200.000",
      priceSuffix: "COP / mes",
      promoText: "RECOMENDADO",
      features: [
        "Primer mes GRATIS",
        "Mantenimiento incluido",
        "Soporte Ilimitado",
        "Actualizaciones garantizadas"
      ],
      cta: "Comenzar Gratis",
      highlight: true
    }
  ];

  const roadmap = [
    {
      title: "Gestión Financiera",
      icon: Wallet,
      description: "Facturación automática y reportes de cartera en tiempo real."
    },
    {
      title: "Comunicación PRO",
      icon: MessageSquare,
      description: "Central de notificaciones push y avisos de asamblea."
    },
    {
      title: "Operación & Reservas",
      icon: Calendar,
      description: "Reserva de zonas comunes y gestión de mantenimientos."
    },
    {
      title: "Administración & Voto",
      icon: ClipboardList,
      description: "Votaciones digitales seguras y actas automatizadas."
    }
  ];

  const BRAND_BLUE = "text-blue-600";
  const BRAND_BG = "bg-blue-600 hover:bg-blue-700 transition-all text-white";

  return (
    <main className="relative min-h-screen bg-white font-manrope text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <header id="inicio" className="pt-32 pb-20 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wider uppercase border border-blue-100">
              Fase Beta Funcional Activa
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Gestión Inteligente de <span className={BRAND_BLUE}>Conjuntos</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
              La plataforma premium diseñada para digitalizar la propiedad horizontal en Colombia. Transparencia total en cartera, residentes y administración.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/register">
                <Button className={cn(BRAND_BG, "px-8 py-7 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2")}>
                  Comenzar Ahora
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="bg-slate-100 text-blue-700 px-8 py-7 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center gap-2 border border-slate-200">
                  Agendar Demo
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </a>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 p-6 rounded-xl space-y-4 hover:bg-white transition-all shadow-sm group border border-slate-100">
              <div className={cn("w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center", BRAND_BLUE)}>
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Gestión de Apartamentos</h3>
              <div className="h-40 rounded-lg overflow-hidden relative border border-slate-100 font-manrope">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd0MlXQjkMVQlTNuCSqh6_PiCsBZllHKG5tAP7t38uWvjf6uuc6loFQjEAwcGYG0w0gkaBdFKKBH7B0DAPxGGar8t8woGt8pSY16y3B9MtcBilXqli5HksvLlQmPvknHiSP5p5Xj0Z3ayMiXTpABIq4elM4rujQvTTNVsdrr-TAoZF71Ss-RPU99XUgMS2_6rDOvqlH3M1o23TpFzb7pgW4njPEbgGEn1wOigQwEEl_h_Q2vyr32-2-DXuIg3YW6Z6JS8px5yQm4nF"
                  alt="modern minimalist apartment" 
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all" 
                />
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl space-y-4 hover:bg-white transition-all shadow-sm group mt-8 border border-slate-100">
              <div className={cn("w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center", BRAND_BLUE)}>
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Propietarios</h3>
              <div className="h-40 rounded-lg overflow-hidden relative border border-slate-100">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBetfVpu26QTQ50kUdINgQ7UxoOEBd8fpI901bQlzUeCVNeIezF9gUvuv-7D1d20qKmoIAKl8lDmzA0ukWkgu8zYMWoSn9p3jU5qhIutmMteNgFk45zxTjtC37DJ57uc5fdoLddhdy4AvOrJoKAOgKBu5afTlUUAxh9gLePBUPDQEiiToUBjrBeYnKoSsEVAbw1pa2OYVcnj_dC-xsI0B_YzV2OcvgDrQu8eb5dZWPzaN1BngpeC2LY-rbY0DOqkpvhZnKca2H46srj"
                  alt="diverse group of professional people" 
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all" 
                />
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl space-y-4 hover:bg-white transition-all shadow-sm group border border-slate-100">
              <div className={cn("w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center", BRAND_BLUE)}>
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Parqueaderos</h3>
              <div className="h-40 rounded-lg overflow-hidden relative border border-slate-100">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsCH81iy_d8wcZiPfs5hF38BcRfRHwRV9NNL46Y5edmrxDxkp0b04eT0nAQi91mHqqvs2OeduxcuAq5weMc1DKzWRLuBD4GOmd8X8wjHLA9i2KMZ9So0EYIEQbEqj_RkBGFWMb0WeSH1THT_y7j_Jk5x3hbuBmPEJ5DSfJSz62LH-fAVgkegxACJn5gGh1prKDQnprOjXSL2MVEoOvLnsrjnoksByEkdqV4ta8chqpNuLZ_WMibgxKDsA9DGA5_OCVYPw2wnHQ2xdn"
                  alt="modern parking garage" 
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all" 
                />
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl space-y-4 hover:bg-white transition-all shadow-sm group mt-8 border border-slate-100">
              <div className={cn("w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center", BRAND_BLUE)}>
                <Dog className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Registro Digital</h3>
              <div className="h-40 rounded-lg overflow-hidden relative border border-slate-100">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjUXD_onDcJxhtj5AjTYI62IsprKr5th9VfBLnUjnohcy7GWCUppuSgu6M3_5dYsVsPUlPMkBaMcJnbBppS6kFDKl6utk9MVg5mW-w9jILoUgl9bWUJrTLteLGZxGHkiSVxCv8zQB5jXg5jq2g4jPGKTA8P5hopXADv4ezBSjAj8F2B67sPYq69-VNYGuTzZCrVB3b0dpt_91LBdCRtxm8aYshtX8gWOwVfKDJ0DmcXI3LTZvDpM1rmejbqzIZVKJACr6kck7dwhIk"
                  alt="friendly golden retriever" 
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Bar */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-slate-500 font-bold text-sm tracking-widest uppercase mb-10">Confianza y Calidad Garantizada</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
            <div className="flex items-center gap-3">
              <Shield className={cn("w-8 h-8", BRAND_BLUE)} />
              <span className="font-bold text-sm text-slate-700">Ley 675 Certificado</span>
            </div>
            <div className="flex items-center gap-3">
              <PhoneCall className={cn("w-8 h-8", BRAND_BLUE)} />
              <span className="font-bold text-sm text-slate-700">Soporte Local 24/7</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className={cn("w-8 h-8", BRAND_BLUE)} />
              <span className="font-bold text-sm text-slate-700">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe2 className={cn("w-8 h-8", BRAND_BLUE)} />
              <span className="font-bold text-sm text-slate-700">Software Colombiano</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="precios">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-blue-600 rounded-2xl p-6 text-center mb-16 shadow-xl shadow-blue-500/20 text-white font-bold text-lg">
            🎁 ¡Refiere un conjunto y ambos obtienen 1 mes gratis!
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={cn(
                "p-10 rounded-[2rem] border-2 transition-all flex flex-col h-full relative overflow-hidden",
                plan.highlight 
                  ? "bg-white border-blue-600 shadow-2xl shadow-blue-600/10" 
                  : "bg-white border-slate-100 hover:border-blue-600/20"
              )}>
                {plan.highlight && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-2xl font-bold text-xs uppercase tracking-wider">
                    RECOMENDADO
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 mb-6">{plan.tagline}</p>
                <div className="text-4xl font-extrabold text-slate-900 mb-8">
                  {plan.price} <span className="text-lg font-medium text-slate-400">{plan.priceSuffix}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className={cn(feature.includes("GRATIS") && "font-bold text-slate-900")}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Button className={cn(
                    "w-full h-14 rounded-xl font-bold transition-all",
                    plan.highlight 
                      ? BRAND_BG + " shadow-lg shadow-blue-600/30" 
                      : "bg-slate-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                  )}>
                    {plan.cta}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 bg-slate-50" id="futuro">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900">Roadmap de Innovación</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Nuestro compromiso es la evolución constante. Próximos módulos que transformarán tu administración.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {roadmap.map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white relative overflow-hidden" id="contacto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-10"></div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-5xl font-extrabold tracking-tight mb-8 text-slate-900">¿Hablamos hoy?</h2>
          <p className="text-xl text-slate-600 mb-12">Estamos listos para llevar tu conjunto al siguiente nivel tecnológico.</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <a 
              href={WHATSAPP_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-8 h-8" />
              321 291 5001
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-lg font-bold text-blue-600 mb-2">Residential</div>
            <p className="text-xs text-slate-500">© 2026 Residential. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-8">
            <a className="text-xs text-slate-500 hover:text-blue-600 underline transition-all" href="#">Privacidad</a>
            <a className="text-xs text-slate-500 hover:text-blue-600 underline transition-all" href="#">Términos</a>
            <a className="text-xs text-slate-500 hover:text-blue-600 underline transition-all" href="#">Soporte</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
