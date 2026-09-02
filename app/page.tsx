"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Sparkles, Mail, Store, CreditCard, CheckCircle } from "lucide-react";
import { db } from "@/lib/db";

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"cliente" | "comercio">("cliente");
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setLoading(true);
    const card = db.getCardBySearch(inputVal);
    if (card) {
      router.push(`/cliente?id=${card.id}`);
    } else {
      router.push(`/registro?query=${encodeURIComponent(inputVal)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] text-white p-4 relative overflow-x-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-b from-purple-600/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center py-4 z-10 mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent font-heading">
            👑 StamPass VIP
          </span>
        </div>
        <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
          <ShieldCheck className="w-3 h-3" />
          <span>Acceso Seguro TLS</span>
        </span>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md bg-[#131124] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Fidelización Digital</h1>
          <p className="text-xs text-gray-400">Pases VIP para Apple Wallet, Google Wallet y TPV de hostelería</p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab("cliente")}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              tab === "cliente" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Soy Cliente VIP</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("comercio")}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              tab === "comercio" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Soy Comercio</span>
          </button>
        </div>

        {tab === "cliente" ? (
          <div className="space-y-4">
            <form onSubmit={handleClientSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tu Teléfono o Email</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: 612345678 o tuemail@gmail.com"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-400 transition font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition transform active:scale-95 cursor-pointer"
              >
                <span>{loading ? "Cargando..." : "Ver Mis Sellos y Tarjeta VIP"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="border-t border-white/10 pt-3 text-center space-y-2">
              <p className="text-xs text-gray-400">¿Aún no tienes tu tarjeta de fidelización?</p>
              <Link
                href="/registro"
                className="inline-flex items-center justify-center space-x-1.5 w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-300 font-bold text-xs border border-amber-500/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>✨ Crear Mi Tarjeta VIP Gratis (0 Sellos)</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl text-left space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⛪</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Bar La Iglesia</h3>
                  <p className="text-[11px] text-gray-400">Terminal TPV de Sellado en Barra</p>
                </div>
              </div>
              <p className="text-[11px] text-purple-200">
                Lector USB automático activado. Escanea el móvil del cliente en cualquier momento sin hacer clics.
              </p>
            </div>

            <Link
              href="/negocio"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 transition transform active:scale-95"
            >
              <span>Abrir Pantalla de Cobros (Bar La Iglesia)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-500 space-y-2 z-10 pb-6">
        <div className="flex justify-center items-center space-x-4 text-[11px] text-slate-400">
          <Link href="/privacidad" className="hover:text-amber-400 transition">Privacidad (RGPD)</Link>
          <span>·</span>
          <Link href="/terminos" className="hover:text-amber-400 transition">Términos</Link>
          <span>·</span>
          <Link href="/cookies" className="hover:text-amber-400 transition">Cookies</Link>
        </div>
        <p className="text-[10px] text-slate-600">StamPass VIP v3.1 · Bar La Iglesia (Valladolid) · Conexión Encriptada TLS</p>
      </footer>
    </div>
  );
}
