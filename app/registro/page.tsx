"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, ShieldCheck, ArrowRight, Lock, Check } from "lucide-react";
import { db } from "@/lib/db";

export default function RegistroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState(initialQuery);
  const [rgpdAccepted, setRgpdAccepted] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !contacto.trim() || !rgpdAccepted) return;
    setLoading(true);

    const card = db.addCustomer(nombre, contacto);
    router.push(`/cliente?id=${card.id}&nuevo=1`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#0B0F19] text-white p-4 relative font-sans">
      <div className="w-full max-w-md flex justify-between items-center py-4 z-10">
        <Link href="/" className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Inicio</span>
        </Link>
        <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% RGPD</span>
        </span>
      </div>

      <div className="w-full max-w-md space-y-6 z-10 my-auto py-4">
        <div className="bg-[#131124] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-left">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-purple-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#131124] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Bar La Iglesia · Tarjeta VIP</span>
              <h1 className="text-2xl font-black text-white tracking-tight font-heading">Crea tu tarjeta VIP</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Tu Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carmen Ruiz"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Teléfono o Email *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: 612345678 o carmen@gmail.com"
                  value={contacto}
                  onChange={e => setContacto(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-2.5 text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rgpdAccepted}
                  onChange={e => setRgpdAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/40 cursor-pointer shrink-0"
                />
                <span className="leading-snug text-[11px]">
                  Acepto la <Link href="/privacidad" className="text-amber-400 underline font-bold">Política de Privacidad</Link> y gestión de mi tarjeta VIP en Bar La Iglesia.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-3.5 px-4 rounded-2xl transition shadow-lg shadow-amber-500/25 text-xs flex items-center justify-center space-x-2 cursor-pointer active:scale-95 mt-2"
            >
              <span>{loading ? "Generando Tarjeta..." : "Obtener Mi Tarjeta VIP"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-white/10 pt-4 flex items-center justify-center space-x-2 text-[11px] text-gray-400 text-center">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Acceso seguro SSL · Cumplimiento estricto RGPD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
