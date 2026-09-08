"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Coffee, Sparkles, Check, Download, Share2, Info, Trophy, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { db, Card } from "@/lib/db";

function ClienteContent() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get("id") || "card-vip-default";
  const esNuevo = searchParams.get("nuevo") === "1";

  const [card, setCard] = useState<Card | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const c = db.getCardById(cardId) || db.getCards()[0];
    if (c) {
      setCard({ ...c });
      if (esNuevo || c.sellos_acumulados === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }
  }, [cardId, esNuevo]);

  const qrPayload = useMemo(() => {
    if (!card) return "card-vip-default";
    // Clean, robust payload: simple direct ID to prevent Spanish keyboard dropped shift quotes
    return card.id;
  }, [card]);

  if (!card) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4">
        <p className="text-sm text-gray-400">Cargando tu tarjeta VIP...</p>
      </div>
    );
  }

  const maxSellos = 10;
  const sellos = card.sellos_acumulados;
  const progresoPorcentaje = Math.min(100, Math.round((sellos / maxSellos) * 100));

  const copiarEnlace = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#0B0F19] text-white p-4 relative font-sans pb-12">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center py-4 z-10">
        <Link href="/" className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </Link>
        <span className="text-xs font-black text-amber-400 flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Tarjeta VIP Activa</span>
        </span>
      </div>

      <div className="w-full max-w-md space-y-6 z-10 my-auto">
        {/* VIP PASS CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1829] via-[#151221] to-[#0D0B14] border border-amber-500/30 p-6 shadow-2xl shadow-amber-500/10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90">Pase de Fidelización</span>
              <h2 className="text-xl font-black text-white tracking-tight">{card.cliente.nombre}</h2>
              <p className="text-xs text-gray-400">{card.campana.negocio?.nombre || "Bar La Iglesia"}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* STAMP GRID (10 SLOTS) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">Tus Sellos de Café</span>
              <span className="font-mono font-black text-amber-400">{sellos} / {maxSellos}</span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {Array.from({ length: maxSellos }).map((_, i) => {
                const isActive = i < sellos;
                const isTrophy = i === maxSellos - 1;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-tr from-amber-500 to-orange-500 border-amber-300 text-black shadow-lg shadow-amber-500/30 scale-105"
                        : isTrophy
                        ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                        : "bg-white/5 border-white/10 text-gray-600"
                    }`}
                  >
                    {isActive ? (
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    ) : isTrophy ? (
                      <Trophy className="w-5 h-5 text-amber-400" />
                    ) : (
                      <span className="text-xs font-black">{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progresoPorcentaje}%` }}
              />
            </div>
          </div>

          {/* REWARD BANNER */}
          {card.premio_pendiente || sellos >= maxSellos ? (
            <div className="p-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-center space-y-1 shadow-lg shadow-purple-600/30 animate-bounce">
              <p className="text-xs font-black text-white">🏆 ¡ENHORABUENA! ¡10º CAFÉ GRATIS!</p>
              <p className="text-[11px] text-purple-100">Muestra este código en la barra para canjear tu consumición gratis.</p>
            </div>
          ) : (
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] text-gray-300">Premio: 10º Café 100% GRATIS</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Faltan {maxSellos - sellos}
              </span>
            </div>
          )}

          {/* QR CODE FOR BARISTA SCANNING */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 text-black shadow-xl">
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="M"
              includeMargin={false}
            />
            <div className="text-center pt-1">
              <p className="text-[11px] font-mono font-bold text-gray-800 tracking-wider">ID: {card.id}</p>
              <p className="text-[10px] text-gray-500 font-medium">Muestra este QR en la barra para que el camarero sume tu sello</p>
            </div>
          </div>

          {/* WALLET BUTTONS */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => alert("Tarjeta guardada en la caché de tu navegador. Puedes guardarte este enlace en Favoritos o en la pantalla de inicio.")}
              className="py-2.5 px-3 bg-black hover:bg-black/80 border border-white/20 rounded-xl text-[11px] font-bold text-white flex items-center justify-center space-x-1.5 transition"
            >
              <span className="text-base leading-none"></span>
              <span>Apple Wallet</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Pase Google Wallet sincronizado para Bar La Iglesia.")}
              className="py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[11px] font-bold text-white flex items-center justify-center space-x-1.5 transition"
            >
              <span>💳 Google Wallet</span>
            </button>
          </div>
        </div>

        {/* Action Share Link */}
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={copiarEnlace}
            className="inline-flex items-center justify-center space-x-2 text-xs text-amber-400 hover:text-amber-300 font-bold underline transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiado ? "✅ ¡Enlace copiado al portapapeles!" : "🔗 Guardar enlace directo a mi tarjeta"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4"><p className="text-sm text-gray-400">Cargando tarjeta VIP...</p></div>}>
      <ClienteContent />
    </Suspense>
  );
}
