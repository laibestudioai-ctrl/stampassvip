"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  Store, 
  Crown, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  CreditCard
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PlanesPage() {
  const [codigoPromo, setCodigoPromo] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [activadoExito, setActivadoExito] = useState(false);

  const codigosValidos = ["PROMO20", "VIP20", "BAR20", "LAIBE20", "PRO20", "BARLAIGLESIA"];

  const handleAplicarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCodigo("");
    const codigo = codigoPromo.trim().toUpperCase();

    if (codigosValidos.includes(codigo)) {
      setDescuentoAplicado(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setErrorCodigo("Código promocional no válido. Prueba con PROMO20 o VIP20.");
    }
  };

  const handleActivarPlan = () => {
    try {
      localStorage.setItem("stampass_plan", "PRO_20");
    } catch (e) {}
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    setActivadoExito(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#0B0F19] text-white p-4 sm:p-6 relative font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-amber-500/15 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <header className="w-full max-w-4xl flex justify-between items-center py-4 z-10 border-b border-white/10 mb-6">
        <Link href="/" className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            👑 StamPass VIP
          </span>
          <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-extrabold uppercase">
            Planes 2026
          </span>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-8 z-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fidelización sin comisiones por cliente</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Elige el Plan para tu Negocio
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Aumenta la recurrencia de tus clientes en hostelería y comercios locales con tarjetas Apple & Google Wallet.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-[#131124] border border-amber-500/30 rounded-3xl p-4 shadow-xl">
          <form onSubmit={handleAplicarCodigo} className="space-y-2">
            <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>¿Tienes un código promocional?</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">Ej: PROMO20</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Introduce código (ej: PROMO20)"
                value={codigoPromo}
                onChange={e => setCodigoPromo(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white uppercase placeholder-gray-500 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black text-xs rounded-2xl transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                Aplicar
              </button>
            </div>
            {descuentoAplicado && (
              <p className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>¡Código VIP aplicado con éxito! Plan Pro a 20€/mes.</span>
              </p>
            )}
            {errorCodigo && (
              <p className="text-[11px] text-red-400 font-medium pt-1">
                {errorCodigo}
              </p>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#131124]/70 border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">Plan Básico</h3>
                  <p className="text-xs text-gray-400">Para probar la fidelización inicial</p>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  Gratis
                </span>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">0€</span>
                <span className="text-xs text-gray-400">/mes para siempre</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300 pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hasta 50 clientes registrados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Campaña de sellos activa</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Escáner QR básico manual</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-500">
                  <span className="w-4 h-4 text-center">✕</span>
                  <span>Sin notificaciones push</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-500">
                  <span className="w-4 h-4 text-center">✕</span>
                  <span>Sin integración directa con TPV</span>
                </li>
              </ul>
            </div>

            <Link
              href="/negocio"
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-2xl text-center transition block"
            >
              Usar Modo Gratuito
            </Link>
          </div>

          <div className="bg-gradient-to-b from-[#1C172E] via-[#151224] to-[#100D1B] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-2xl shadow-md">
              👑 Recomendado Hostelería
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start pt-1">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-white">Plan Pro</h3>
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs text-amber-200/80">Todo ilimitado para bares y restaurantes</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-amber-400 font-mono">20€</span>
                  {descuentoAplicado ? (
                    <>
                      <span className="text-sm text-gray-500 line-through font-mono">39€</span>
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Código VIP aplicado (-19€)
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">/mes (Tarifa Especial)</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">Facturación mensual sin permanencia. Cancela cuando quieras.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-200 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-white">Clientes y tarjetas VIP Ilimitadas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Sincronización directa con Pistola USB / TPV (Zero-Clicks)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Pases compatibles con Apple Wallet & Google Wallet</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Notificaciones push automáticas al móvil del cliente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Historial de sellado y control de camareros con PIN</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Soporte prioritario por WhatsApp de Laibe Studio AI</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              {activadoExito ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-1">
                  <p className="text-xs font-black text-emerald-300">✅ ¡PLAN PRO ACTIVADO A 20€/MES!</p>
                  <Link href="/negocio" className="text-[11px] text-white underline font-bold">
                    Ir al panel de cobros de tu negocio
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleActivarPlan}
                    className="w-full py-4 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black text-xs rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition transform active:scale-95 cursor-pointer"
                  >
                    <span>Activar Plan Pro a 20€/mes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="https://wa.me/34633557024?text=Hola%20Juan%20Pablo%2C%20quiero%20activar%20el%20Plan%20Pro%20de%20StamPass%20VIP%20por%2020%E2%82%AC%2Fmes%20para%20mi%20local."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-2xl flex items-center justify-center space-x-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contratar por WhatsApp (Atención Directa)</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sin permanencia · Cancela en 1 clic</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>Pago seguro encriptado TLS</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Diseñado para Hostelería & Retail</span>
          </div>
        </div>
      </main>
    </div>
  );
}
