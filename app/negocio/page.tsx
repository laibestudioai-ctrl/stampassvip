"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Coffee, 
  Sparkles, 
  Plus, 
  Check, 
  Trophy, 
  Search, 
  X, 
  Scan, 
  UserCheck, 
  History, 
  Volume2, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  Maximize2,
  Minimize2
} from "lucide-react";
import confetti from "canvas-confetti";
import { db, Card, AuditLog } from "@/lib/db";

export default function NegocioTPVPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("TODOS");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [scanBanner, setScanBanner] = useState<string | null>(null);
  const [stampNotification, setStampNotification] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Sound chime using Web Audio API
  const playChime = (type: "scan" | "stamp" | "reward" = "scan") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "scan") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "stamp") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "reward") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
  };

  const refreshData = () => {
    const all = db.getCards();
    setCards([...all]);
    setLogs([...db.getAuditLogs()]);
    if (!selectedCard && all.length > 0) {
      setSelectedCard(all[0]);
    } else if (selectedCard) {
      const updated = all.find(c => c.id === selectedCard.id);
      if (updated) setSelectedCard({ ...updated });
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // GLOBAL USB BARCODE SCANNER LISTENER (ZERO-CLICKS WEDGE)
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // When Enter (CR/LF) is received, process the accumulated scan buffer
      if (e.key === "Enter") {
        if (buffer.trim().length > 1) {
          e.preventDefault();
          processScannedData(buffer.trim());
          buffer = "";
        }
        return;
      }

      // Capture single characters
      if (e.key.length === 1) {
        // Fast scanner burst or continuous input
        if (timeDiff > 250) {
          buffer = e.key;
        } else {
          buffer += e.key;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards]);

  const processScannedData = (rawText: string) => {
    let text = rawText.trim();

    // 1. Sanitize Spanish keyboard dropped shift error (e.g. 2sellos -> "sellos")
    text = text.replace(/([0-9]+)(sellos|id|nombre|email)":/g, '"$2":');

    let targetId = text;

    // 2. Try JSON parsing
    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.id) targetId = parsed.id;
      } catch (e) {
        // Extract id with regex fallback
        const match = text.match(/"id"s*:s*"([^"]+)"/);
        if (match) targetId = match[1];
      }
    }

    // 3. Try URL parsing (e.g. https://.../cliente?id=card-123)
    if (targetId.includes("id=")) {
      const match = targetId.match(/[?&]id=([^&]+)/);
      if (match) targetId = decodeURIComponent(match[1]);
    }

    // 4. Find or create the card
    let card = db.getCardById(targetId) || db.getCardBySearch(targetId);

    if (!card) {
      // If not found, create client seamlessly
      card = db.addCustomer("Cliente VIP (" + targetId.slice(-4) + ")", targetId);
    }

    if (card) {
      setSelectedCard({ ...card });
      setSearchQuery("");
      setScanBanner(`⚡ ¡Escaneado con Pistola USB: ${card.cliente.nombre}!`);
      playChime("scan");
      setTimeout(() => setScanBanner(null), 4000);
      refreshData();
    }
  };

  const handleAddStamp = (count: number = 1) => {
    if (!selectedCard) return;
    const res = db.addStamps(selectedCard.id, count, "Paula (Bar La Iglesia)");
    if (res.success && res.card) {
      setSelectedCard({ ...res.card });
      playChime(res.unlockedReward ? "reward" : "stamp");
      if (res.unlockedReward) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setStampNotification(`🎉 ¡10º CAFÉ COMPLETADO! Premio desbloqueado para ${res.card.cliente.nombre}.`);
      } else {
        setStampNotification(`✅ +${count} Sello sumado a ${res.card.cliente.nombre} (${res.card.sellos_acumulados}/10).`);
      }
      setTimeout(() => setStampNotification(null), 3500);
      refreshData();
    }
  };

  const handleRedeem = () => {
    if (!selectedCard) return;
    const res = db.redeemReward(selectedCard.id, "Paula (Bar La Iglesia)");
    if (res.success) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      playChime("reward");
      setStampNotification("🏆 ¡Premio canjeado! Sellos reiniciados.");
      setTimeout(() => setStampNotification(null), 4000);
      refreshData();
    }
  };

  // Filtered Cards List
  const filteredCards = cards.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      c.cliente.nombre.toLowerCase().includes(q) || 
      (c.cliente.telefono && c.cliente.telefono.includes(q)) ||
      (c.cliente.email && c.cliente.email.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q);

    const matchesLetter = selectedLetter === "TODOS" || 
      c.cliente.nombre.toUpperCase().startsWith(selectedLetter);

    return matchesQuery && matchesLetter;
  });

  const letters = ["TODOS", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0E17] text-white p-3 sm:p-5 font-sans relative overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR */}
      <header className="flex justify-between items-center pb-3 border-b border-white/10 mb-4 z-10">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⛪</span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black text-white leading-none">Bar La Iglesia</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>TPV Activo</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Terminal de Fidelización VIP · InnovaTPV</p>
            </div>
          </div>
        </div>

        {/* Scanner Active Indicator */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs text-amber-300 font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Pistola USB Lista (Dispara en cualquier momento)</span>
          </div>
        </div>
      </header>

      {/* NOTIFICATIONS BANNER */}
      {scanBanner && (
        <div className="mb-4 p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-bounce z-20 font-bold text-xs">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{scanBanner}</span>
          </div>
          <button onClick={() => setScanBanner(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {stampNotification && (
        <div className="mb-4 p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between z-20 font-bold text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{stampNotification}</span>
          </div>
          <button onClick={() => setStampNotification(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 z-10">
        {/* LEFT COLUMN: ACTIVE CUSTOMER CARD & STAMP CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCard ? (
            <div className="bg-[#151324] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Cliente VIP Seleccionado
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedCard.cliente.nombre}</h2>
                  <p className="text-xs text-gray-400 font-mono">
                    {selectedCard.cliente.telefono || selectedCard.cliente.email || `ID: ${selectedCard.id}`}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {selectedCard.sellos_acumulados} <span className="text-sm text-gray-500">/ 10</span>
                  </span>
                  <span className="block text-[10px] text-gray-400 uppercase font-bold">Sellos acumulados</span>
                </div>
              </div>

              {/* STAMP PROGRESS GRID */}
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isActive = i < selectedCard.sellos_acumulados;
                  const is10th = i === 9;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-tr from-amber-500 to-orange-500 border-amber-300 text-black shadow-lg shadow-amber-500/25 scale-105"
                          : is10th
                          ? "bg-purple-950/40 border-purple-500/50 text-purple-300"
                          : "bg-white/5 border-white/10 text-gray-600"
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                      ) : is10th ? (
                        <Trophy className="w-6 h-6 text-amber-400" />
                      ) : (
                        <span className="text-sm font-black">{i + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-2">
                {selectedCard.premio_pendiente || selectedCard.sellos_acumulados >= 10 ? (
                  <button
                    type="button"
                    onClick={handleRedeem}
                    className="w-full py-4 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/40 flex items-center justify-center space-x-2 transition transform active:scale-98 animate-pulse cursor-pointer"
                  >
                    <Trophy className="w-5 h-5 text-amber-300" />
                    <span>🏆 CANJEAR 10º CAFÉ GRATIS (REINICIAR A 0)</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddStamp(1)}
                      className="col-span-2 py-4 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition transform active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                      <span>➕ SUMAR 1 SELLO (1 CAFÉ)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStamp(2)}
                      className="py-4 px-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-black text-xs rounded-2xl flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <span>+2 Sellos</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#151324] border border-white/10 rounded-3xl p-8 text-center space-y-3">
              <Scan className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Dispara la pistola al QR del móvil</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                La aplicación detectará automáticamente el pase VIP del cliente sin que tengas que hacer ningún clic.
              </p>
            </div>
          )}

          {/* AUDIT LOG TABLE */}
          <div className="bg-[#131124] border border-white/10 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Historial de Sellos en Barra</h3>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Hoy · Bar La Iglesia</span>
            </div>

            <div className="divide-y divide-white/5 max-h-48 overflow-y-auto text-xs">
              {logs.length > 0 ? (
                logs.map(log => (
                  <div key={log.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">{log.cliente_nombre}</span>
                      <span className="text-[10px] text-gray-500 ml-2">{log.fecha} por {log.empleado}</span>
                    </div>
                    <span className={`font-mono font-bold ${log.accion.includes("Premio") ? "text-purple-400" : "text-amber-400"}`}>
                      {log.accion}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 py-3 text-center">Aún no se han registrado sellos hoy.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SEARCH & CUSTOMER LIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#131124] border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Buscar / Seleccionar Cliente</h3>
              <p className="text-[11px] text-gray-500">O toca cualquier cliente de la lista</p>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    processScannedData(searchQuery.trim());
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-10 pr-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-medium"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* A-Z TOUCH FILTER BAR */}
            <div className="flex flex-wrap gap-1 border-b border-white/10 pb-3">
              {letters.map(letter => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setSelectedLetter(letter);
                    setSearchQuery("");
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    selectedLetter === letter
                      ? "bg-amber-500 text-black shadow-md font-extrabold"
                      : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* CLIENT LIST */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredCards.length > 0 ? (
                filteredCards.map(c => {
                  const isSelected = selectedCard?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCard({ ...c });
                        playChime("scan");
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/50 text-white shadow-md"
                          : "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300 hover:text-white"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">{c.cliente.nombre}</p>
                        <p className="text-[10px] text-gray-400">{c.cliente.telefono || c.cliente.email || c.id}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-amber-400">
                          {c.sellos_acumulados}/10
                        </span>
                        <span className="block text-[9px] text-gray-500 font-medium">Sellos</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 space-y-1">
                  <p>No se encontraron clientes con ese criterio.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLetter("TODOS");
                      setSearchQuery("");
                    }}
                    className="text-amber-400 underline font-bold"
                  >
                    Mostrar todos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
