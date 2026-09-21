"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { 
  Coffee, 
  Sparkles, 
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
  Minimize2, 
  Edit3, 
  UserPlus,
  QrCode,
  Users,
  BarChart3,
  Settings,
  Printer,
  Download,
  Share2,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  ExternalLink,
  Plus
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { db, Card, AuditLog, Business } from "@/lib/db";

export default function NegocioTPVPage() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"tpv" | "qr" | "crm" | "dashboard" | "camareros" | "ajustes">("tpv");

  // State
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [crmSearchQuery, setCrmSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("TODOS");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [scanBanner, setScanBanner] = useState<string | null>(null);
  const [stampNotification, setStampNotification] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Business & Waiters
  const [business, setBusiness] = useState<Business>(db.getBusiness());
  const [activeWaiter, setActiveWaiter] = useState<string>("Paula");
  const [newWaiterName, setNewWaiterName] = useState("");
  const [newWaiterPin, setNewWaiterPin] = useState("");
  const [isAddingWaiter, setIsAddingWaiter] = useState(false);

  // Settings
  const [bizName, setBizName] = useState("Bar La Iglesia");
  const [rewardName, setRewardName] = useState("10º Café GRATIS");
  const [maxStamps, setMaxStamps] = useState(10);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Edit customer modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Quick add customer modal state
  const [isAdding, setIsAdding] = useState(false);
  const [addNombre, setAddNombre] = useState("");
  const [addTelefono, setAddTelefono] = useState("");

  // QR share state
  const [copiedLink, setCopiedLink] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://stampassvip.vercel.app");

  // Load origin on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

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
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "stamp") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06); // E5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "reward") {
        // Fanfare
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = "sine";
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.5);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.5);
        });
      }
    } catch (e) {}
  };

  // Refresh data from DB
  const refreshData = () => {
    const all = db.getCards();
    setCards([...all]);
    setLogs(db.getAuditLogs());

    // Auto-select Paula Milena or first card if no selection
    if (!selectedCard && all.length > 0) {
      const paula = all.find(c => c.id === "card-1788348700801-s4sm" || c.id.includes("1788348700801"));
      setSelectedCard(paula || all[0]);
    } else if (selectedCard) {
      const updated = all.find(c => c.id === selectedCard.id);
      if (updated) setSelectedCard(updated);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Global Hardware USB Scanner Listener (Zero-Click)
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      // If user/scanner pressed Enter inside an input field
      if (e.key === "Enter" && isInput) {
        const val = (target as HTMLInputElement).value?.trim();
        if (val && (val.includes("card-") || val.startsWith("{") || val.includes("http") || val.length >= 4)) {
          e.preventDefault();
          processScannedBarcode(val);
          (target as HTMLInputElement).value = "";
          buffer = "";
          return;
        }
      }

      // If inside regular text input and NOT rapid barcode entry, let user type normally
      if (isInput && e.key !== "Enter") {
        return;
      }

      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      // Scanners type keystrokes extremely rapidly (< 90ms)
      if (diff > 120 && buffer.length > 0) {
        buffer = "";
      }

      if (e.key === "Enter") {
        if (buffer.length >= 3) {
          e.preventDefault();
          processScannedBarcode(buffer.trim());
          buffer = "";
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards]);

  // Process scanned input from hardware barcode/QR wedge or search
  const processScannedBarcode = (code: string) => {
    if (!code) return;
    let cleanCode = code.trim();
    console.log("[Hardware Scanner Ingestion]:", cleanCode);

    // If code is a URL (e.g. from mobile camera or QR link)
    if (cleanCode.includes("id=")) {
      const match = cleanCode.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        cleanCode = decodeURIComponent(match[1]);
      }
    } else if (cleanCode.includes("/cliente/")) {
      const parts = cleanCode.split("/cliente/");
      if (parts[1]) cleanCode = parts[1].split("?")[0];
    }

    let resolved = db.getCardBySearch(cleanCode);

    // Fallback: If code is or contains Paula's ID or name
    if (!resolved && (cleanCode.includes("1788348700801") || cleanCode.toLowerCase().includes("paula") || cleanCode.includes("633557024"))) {
      resolved = db.getCards().find(c => c.id === "card-1788348700801-s4sm" || c.id.includes("1788348700801") || c.cliente.telefono?.includes("633557024")) || null;
    }

    if (!resolved) {
      // Create new customer automatically from code
      resolved = db.importCardFromQR({ id: cleanCode });
    }

    if (resolved) {
      setSelectedCard({ ...resolved });
      setActiveTab("tpv"); // Bring bartender directly to TPV Barra
      refreshData();
      playChime("scan");

      setScanBanner(`¡Tarjeta VIP de ${resolved.cliente.nombre} Detectada!`);
      setTimeout(() => setScanBanner(null), 4500);

      // Trigger small confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.3 }
      });
    }
  };

  // Add stamps to current client
  const handleAddStamps = (count: number = 1) => {
    if (!selectedCard) return;

    const result = db.addStamps(selectedCard.id, count, activeWaiter);
    if (result.success && result.card) {
      setSelectedCard({ ...result.card });
      refreshData();

      if (result.unlockedReward) {
        playChime("reward");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        setStampNotification(`🎉 ¡PREMIO DESBLOQUEADO! 10º Café GRATIS para ${result.card.cliente.nombre}`);
      } else {
        playChime("stamp");
        setStampNotification(`☕ +${count} Sello${count > 1 ? "s" : ""} añadido con éxito (${result.card.sellos_acumulados}/10)`);
      }
      setTimeout(() => setStampNotification(null), 4000);
    }
  };

  // Redeem free coffee
  const handleRedeem = () => {
    if (!selectedCard) return;
    const res = db.redeemReward(selectedCard.id, activeWaiter);
    if (res.success) {
      playChime("reward");
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 }
      });
      refreshData();
      setStampNotification(`🏆 ¡10º CAFÉ GRATIS CANJEADO! Registrado por ${activeWaiter}`);
      setTimeout(() => setStampNotification(null), 5000);
    }
  };

  // Quick add customer
  const saveNewCustomer = () => {
    if (!addNombre.trim()) return;
    const newCard = db.addCustomer(addNombre.trim(), addTelefono.trim());
    setIsAdding(false);
    setAddNombre("");
    setAddTelefono("");
    setSelectedCard(newCard);
    setActiveTab("tpv");
    refreshData();
    playChime("scan");
    setStampNotification(`✅ Nuevo cliente ${newCard.cliente.nombre} dado de alta`);
    setTimeout(() => setStampNotification(null), 4000);
  };

  // Edit customer
  const openEditModal = (card: Card) => {
    setSelectedCard(card);
    setEditNombre(card.cliente.nombre);
    setEditTelefono(card.cliente.telefono || "");
    setEditEmail(card.cliente.email || "");
    setIsEditing(true);
  };

  const saveEditCustomer = () => {
    if (!selectedCard) return;
    const updated = db.updateCustomer(selectedCard.id, {
      nombre: editNombre,
      telefono: editTelefono,
      email: editEmail
    });
    if (updated) {
      setSelectedCard({ ...updated });
      refreshData();
      setIsEditing(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = (cardId: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar la tarjeta de ${name}? Esta acción no se puede deshacer.`)) {
      const all = db.getCards().filter(c => c.id !== cardId);
      db.saveCards(all);
      if (selectedCard?.id === cardId) {
        setSelectedCard(all[0] || null);
      }
      refreshData();
    }
  };

  // Add waiter
  const handleAddWaiter = () => {
    if (!newWaiterName.trim()) return;
    const updatedBiz = { ...business };
    updatedBiz.empleados.push({
      id: "emp-" + Date.now(),
      nombre: newWaiterName.trim(),
      pin: newWaiterPin.trim() || "0000"
    });
    setBusiness(updatedBiz);
    setNewWaiterName("");
    setNewWaiterPin("");
    setIsAddingWaiter(false);
  };

  // Save Settings
  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Export JSON backup
  const handleExportData = () => {
    const data = {
      business,
      cards: db.getCards(),
      logs: db.getAuditLogs(),
      exportDate: new Date().toISOString(),
      version: "3.2"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Copia_Seguridad_Bar_La_Iglesia_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.cards && Array.isArray(json.cards)) {
          db.saveCards(json.cards);
          if (json.logs && Array.isArray(json.logs)) {
            localStorage.setItem("stampsync_logs", JSON.stringify(json.logs));
          }
          refreshData();
          alert("¡Copia de seguridad restaurada con éxito!");
        } else {
          alert("Archivo no válido.");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Toggle Full Screen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  // Copy registration link
  const copyRegistrationLink = () => {
    const link = `${baseUrl}/registro`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filtered cards for TPV sidebar / selector
  const filteredCards = useMemo(() => {
    let result = cards;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.cliente.nombre.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.cliente.telefono && c.cliente.telefono.includes(q)) ||
        (c.cliente.email && c.cliente.email.toLowerCase().includes(q))
      );
    }
    if (selectedLetter !== "TODOS") {
      result = result.filter(c =>
        c.cliente.nombre.toUpperCase().startsWith(selectedLetter)
      );
    }
    return result;
  }, [cards, searchQuery, selectedLetter]);

  // Filtered cards for CRM table
  const crmFilteredCards = useMemo(() => {
    if (!crmSearchQuery.trim()) return cards;
    const q = crmSearchQuery.toLowerCase().trim();
    return cards.filter(c =>
      c.cliente.nombre.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.cliente.telefono && c.cliente.telefono.includes(q)) ||
      (c.cliente.email && c.cliente.email.toLowerCase().includes(q))
    );
  }, [cards, crmSearchQuery]);

  // Dashboard calculations
  const totalStampsHistoric = useMemo(() => {
    return cards.reduce((acc, c) => acc + (c.sellos_totales_historicos || c.sellos_acumulados), 0);
  }, [cards]);

  const totalRewardsRedeemed = useMemo(() => {
    return logs.filter(l => l.accion.includes("Premio") || l.accion.includes("Canje")).length;
  }, [logs]);

  const frequentClients = useMemo(() => {
    return cards.filter(c => (c.sellos_totales_historicos || 0) >= 3).length;
  }, [cards]);

  const topClients = useMemo(() => {
    return [...cards]
      .sort((a, b) => (b.sellos_totales_historicos || 0) - (a.sellos_totales_historicos || 0))
      .slice(0, 5);
  }, [cards]);

  const alphabet = ["TODOS", "A", "B", "C", "D", "E", "F", "G", "J", "M", "P", "R", "S", "V"];

  return (
    <div className="min-h-screen bg-[#0A0815] text-white flex flex-col font-sans select-none pb-24">
      {/* HEADER SUPERIOR TPV */}
      <header className="border-b border-white/10 bg-[#0F0C20]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 flex items-center justify-center shadow-xl shadow-amber-500/25 overflow-hidden flex-shrink-0">
            <img 
              src="/logo_iglesia.png" 
              alt="Bar La Iglesia Cervecería Cafetería" 
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black text-white leading-none">{bizName}</h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>TPV Activo</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center space-x-1.5 mt-0.5">
              <span>Terminal VIP · InnovaTPV</span>
              <span>· Barra:</span>
              <span className="text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                {activeWaiter}
              </span>
            </p>
          </div>
        </div>

        {/* Acciones Rápidas Header */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-[11px] text-amber-300 font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Pistola USB Lista</span>
          </div>

          <button 
            onClick={toggleFullScreen}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition cursor-pointer"
            title="Pantalla Completa"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* BANNER NOTIFICACIÓN ESCANEO HARDWARE */}
      {scanBanner && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs z-20 animate-bounce">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>{scanBanner}</span>
          </div>
          <button onClick={() => setScanBanner(null)} className="text-white/80 hover:text-white px-2 py-0.5 bg-black/20 rounded cursor-pointer">✕</button>
        </div>
      )}

      {/* NOTIFICACIÓN ACCIÓN SELLO */}
      {stampNotification && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold rounded-2xl shadow-xl flex items-center justify-between text-xs z-20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span>{stampNotification}</span>
          </div>
          <button onClick={() => setStampNotification(null)} className="text-black/80 hover:text-black px-2 py-0.5 bg-black/10 rounded cursor-pointer">✕</button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL POR PESTAÑAS */}
      <div className="flex-1 p-4 max-w-7xl mx-auto w-full">

        {/* ============================================================ */}
        {/* TAB 1: TPV BARRA (PANTALLA PRINCIPAL DE SELLADO EN DIRECTO)  */}
        {/* ============================================================ */}
        {activeTab === "tpv" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Columna Izquierda: Tarjeta VIP Activa */}
            <div className="lg:col-span-7 space-y-4">
              {selectedCard ? (
                <div className="bg-[#151324] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative">
                  {/* Encabezado Cliente */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          Cliente VIP en Barra
                        </span>
                        <button 
                          onClick={() => openEditModal(selectedCard)}
                          className="text-[10px] text-gray-400 hover:text-amber-300 underline font-medium cursor-pointer flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {selectedCard.cliente.nombre}
                      </h2>
                      <p className="text-xs text-gray-400 font-mono">
                        {selectedCard.cliente.email || "Sin email"} · {selectedCard.cliente.telefono || "Sin teléfono"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-black text-amber-400 font-mono">
                        {selectedCard.sellos_acumulados} <span className="text-sm text-gray-500">/ 10</span>
                      </span>
                      <span className="block text-[10px] text-gray-400 uppercase font-bold">Sellos de Café</span>
                    </div>
                  </div>

                  {/* Grid de 10 Sellos */}
                  <div className="grid grid-cols-5 gap-3 pt-1">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const isStamped = index < selectedCard.sellos_acumulados;
                      const isTenth = index === 9;

                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-300 border ${
                            isStamped
                              ? "bg-gradient-to-tr from-amber-500 to-amber-300 border-amber-300 text-black shadow-lg shadow-amber-500/30 scale-100"
                              : isTenth
                              ? "bg-purple-900/30 border-purple-500/50 text-purple-400 animate-pulse"
                              : "bg-white/5 border-white/10 text-gray-500"
                          }`}
                        >
                          {isStamped ? (
                            <>
                              <Coffee className="w-6 h-6 mb-1 text-black fill-black" />
                              <span className="text-[10px] font-black">{index + 1}º</span>
                            </>
                          ) : isTenth ? (
                            <>
                              <Trophy className="w-6 h-6 mb-1 text-purple-400" />
                              <span className="text-[9px] font-extrabold uppercase">GRATIS</span>
                            </>
                          ) : (
                            <>
                              <span className="text-base font-bold text-gray-600">{index + 1}</span>
                              <span className="text-[9px] text-gray-600">Café</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Botones de Acción de Sellado */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleAddStamps(1)}
                        className="col-span-2 py-4 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition transform active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                        <span>SUMAR 1 SELLO (1 CAFÉ)</span>
                      </button>

                      <button
                        onClick={() => handleAddStamps(2)}
                        className="py-4 px-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-black text-xs rounded-2xl flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <span>+2 Sellos</span>
                      </button>
                    </div>

                    {/* Botón Canjear Premio si tiene 10 sellos o premio pendiente */}
                    {(selectedCard.sellos_acumulados >= 10 || selectedCard.premio_pendiente) && (
                      <button
                        onClick={handleRedeem}
                        className="w-full py-4 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/40 flex items-center justify-center space-x-2 transition transform active:scale-98 animate-pulse cursor-pointer"
                      >
                        <Trophy className="w-5 h-5" />
                        <span>¡CANJEAR 10º CAFÉ GRATIS!</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#151324] border border-dashed border-white/20 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-3xl">
                    🔍
                  </div>
                  <h3 className="text-lg font-bold text-white">Escanea una tarjeta VIP o busca un cliente</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Apunta la pistola lectora USB a la pantalla del cliente o selecciona un cliente en la lista lateral.
                  </p>
                </div>
              )}

              {/* Historial en Barra Sesión Actual */}
              <div className="bg-[#131124] border border-white/10 rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <History className="w-3.5 h-3.5 text-gray-400" />
                    <span>Historial de Sellos en Barra</span>
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">Sesión Actual · {bizName}</span>
                </div>
                <div className="divide-y divide-white/5 max-h-44 overflow-y-auto text-xs">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay sellos registrados aún en esta sesión.</p>
                  ) : (
                    logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-400 font-bold font-mono text-[11px]">{log.fecha}</span>
                          <span className="text-white font-medium">{log.cliente_nombre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-purple-300 font-bold">{log.accion}</span>
                          <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                            {log.empleado}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Buscador Rápido y Clientes Frecuentes */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#151324] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-2">
                    Búsqueda Rápida de Clientes
                  </h3>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="global-search-input"
                      type="text"
                      placeholder="Nombre, teléfono o escanear QR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          processScannedBarcode(searchQuery);
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtro Alfabeto */}
                <div className="flex flex-wrap gap-1 border-b border-white/10 pb-3">
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition cursor-pointer ${
                        selectedLetter === letter
                          ? "bg-amber-400 text-black shadow"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                {/* Lista de Clientes */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredCards.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      No se encontraron clientes coincidentes.
                    </div>
                  ) : (
                    filteredCards.map((c) => {
                      const isSelected = selectedCard?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCard(c)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10"
                              : "bg-white/5 border-white/5 hover:border-white/20 text-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isSelected ? "bg-amber-400 text-black" : "bg-white/10 text-white"
                            }`}>
                              {c.cliente.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-white leading-tight">{c.cliente.nombre}</p>
                              <p className="text-[10px] text-gray-400 font-mono">
                                {c.cliente.telefono || c.cliente.email || c.id.slice(-6)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-amber-400 font-mono">
                              {c.sellos_acumulados}/10
                            </span>
                            {c.premio_pendiente && (
                              <span className="block text-[8px] font-extrabold text-purple-400 uppercase">
                                🎁 Premio
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MI QR (CARTEL DE BARRA Y ENLACE DE REGISTRO)          */}
        {/* ============================================================ */}
        {activeTab === "qr" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">Cartel Interactivo de Barra</h2>
              <p className="text-xs text-gray-400">
                Coloca este código QR en la barra para que los clientes se registren en 5 segundos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Vista Previa del Cartel de Barra */}
              <div 
                id="printable-poster" 
                className="bg-gradient-to-b from-[#1C1836] to-[#120F24] border-2 border-amber-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Club VIP · Fidelización
                  </span>
                  <h3 className="text-3xl font-black text-white tracking-tight">{bizName}</h3>
                  <p className="text-sm font-extrabold text-amber-300">¡Consigue tu 10º Café GRATIS!</p>
                </div>

                {/* Código QR Vectorial Nítido */}
                <div className="bg-white p-4 rounded-3xl w-56 h-56 mx-auto shadow-2xl flex items-center justify-center border-4 border-amber-400">
                  <QRCodeSVG
                    value={`${baseUrl}/registro?negocio=bar-la-iglesia`}
                    size={190}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-1 text-xs text-gray-300">
                  <p className="font-bold text-white">1. Apunta con la cámara de tu móvil</p>
                  <p className="text-[11px] text-gray-400">Guárdala en Apple Wallet o Google Wallet al instante</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-center items-center space-x-2 text-[10px] text-gray-500">
                  <span>⚡ Sin descargas de apps pesadas</span>
                  <span>·</span>
                  <span>100% Automático</span>
                </div>
              </div>

              {/* Controles de Cartel & Acciones */}
              <div className="space-y-4">
                <div className="bg-[#151324] border border-white/10 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Acciones del Cartel</h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => window.print()}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 hover:opacity-95 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Cartel A4 para la Barra</span>
                    </button>

                    <button
                      onClick={copyRegistrationLink}
                      className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-purple-400" />
                      <span>{copiedLink ? "¡Enlace Copiado al Portapapeles!" : "Copiar Enlace Directo de Registro"}</span>
                    </button>

                    <a
                      href={`${baseUrl}/registro`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer text-center"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <span>Abrir Formulario de Registro en Nueva Pestaña</span>
                    </a>
                  </div>
                </div>

                {/* Explicación de Funcionamiento */}
                <div className="bg-[#151324] border border-white/10 rounded-3xl p-5 space-y-3 text-xs text-gray-400">
                  <h4 className="font-bold text-white uppercase text-[11px]">¿Cómo funciona en la barra?</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>El cliente escanea el cartel con su cámara y escribe su nombre y teléfono (5 segundos).</li>
                    <li>Recibe su tarjeta interactiva con su QR personal.</li>
                    <li>Cuando pide un café, te muestra su pantalla y tú disparas el lector USB.</li>
                    <li>El sistema suma su sello en menos de 0.2 segundos sin tocar el ratón.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CRM (DIRECTORIO COMPLETO DE CLIENTES VIP)             */}
        {/* ============================================================ */}
        {activeTab === "crm" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Directorio CRM de Clientes VIP</h2>
                <p className="text-xs text-gray-400">Base de datos de fidelización y métricas de consumo</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportData}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar JSON</span>
                </button>
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Alta Cliente</span>
                </button>
              </div>
            </div>

            {/* Buscador CRM */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono, email o ID de tarjeta..."
                value={crmSearchQuery}
                onChange={(e) => setCrmSearchQuery(e.target.value)}
                className="w-full bg-[#151324] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Tabla de Clientes */}
            <div className="bg-[#151324] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider bg-white/5">
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Contacto</th>
                      <th className="py-3 px-4">Sellos</th>
                      <th className="py-3 px-4">Histórico</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {crmFilteredCards.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No hay clientes registrados o que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      crmFilteredCards.map((c) => (
                        <tr key={c.id} className="hover:bg-white/5 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{c.cliente.nombre}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{c.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-300">{c.cliente.telefono || "—"}</div>
                            <div className="text-[10px] text-gray-500">{c.cliente.email || "—"}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {c.sellos_acumulados} / 10
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 font-mono">
                            {c.sellos_totales_historicos || c.sellos_acumulados} cafés
                          </td>
                          <td className="py-3 px-4">
                            {c.premio_pendiente ? (
                              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                🎁 Premio Pendiente
                              </span>
                            ) : (
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCard(c);
                                setActiveTab("tpv");
                              }}
                              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg text-[10px] transition cursor-pointer"
                              title="Seleccionar en TPV Barra"
                            >
                              Sellar en Barra
                            </button>
                            <button
                              onClick={() => openEditModal(c)}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-[10px] transition cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-3 h-3 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c.id, c.cliente.nombre)}
                              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg text-[10px] transition cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: DASHBOARD (MÉTRICAS Y ESTADÍSTICAS DEL NEGOCIO)        */}
        {/* ============================================================ */}
        {activeTab === "dashboard" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Panel de Rendimiento & Fidelización</h2>
              <p className="text-xs text-gray-400">Analítica de consumo, recurrencia y premios entregados en {bizName}</p>
            </div>

            {/* 4 KPIs Principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-[#131124] border border-white/10 rounded-3xl space-y-2 shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">☕</div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400">Cafés Sellados</span>
                <p className="text-3xl font-black text-white">{totalStampsHistoric}</p>
              </div>

              <div className="p-5 bg-[#131124] border border-white/10 rounded-3xl space-y-2 shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">🏆</div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400">Premios Regalados</span>
                <p className="text-3xl font-black text-purple-300">{totalRewardsRedeemed}</p>
              </div>

              <div className="p-5 bg-[#131124] border border-white/10 rounded-3xl space-y-2 shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">👥</div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400">Clientes VIP Activos</span>
                <p className="text-3xl font-black text-blue-300">{cards.length}</p>
              </div>

              <div className="p-5 bg-[#131124] border border-white/10 rounded-3xl space-y-2 shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">📈</div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400">Clientes Frecuentes</span>
                <p className="text-3xl font-black text-emerald-400">{frequentClients}</p>
              </div>
            </div>

            {/* Ranking Top Clientes & Actividad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#131124] border border-white/10 rounded-3xl p-5 space-y-3 shadow-lg">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Top Clientes Más Fieles</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {topClients.map((client, idx) => (
                    <div key={client.id} className="p-3 bg-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-black text-amber-400 w-5">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </span>
                        <div>
                          <p className="font-bold text-white">{client.cliente.nombre}</p>
                          <p className="text-[10px] text-gray-400">{client.cliente.telefono || client.cliente.email || "Cliente VIP"}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        {client.sellos_totales_historicos || client.sellos_acumulados} cafés
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#131124] border border-white/10 rounded-3xl p-5 space-y-3 shadow-lg">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Últimos Movimientos de Fidelidad</span>
                </h3>
                <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                  {logs.slice(0, 8).map((l) => (
                    <div key={l.id} className="p-2.5 bg-white/5 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-white">{l.cliente_nombre}</span>
                        <span className="text-gray-400 block text-[9px] font-mono">{l.fecha} · {l.empleado}</span>
                      </div>
                      <span className="font-bold text-amber-400">{l.accion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: CAMAREROS (EQUIPO DE BARRA Y FIRMA DE SELLOS)         */}
        {/* ============================================================ */}
        {activeTab === "camareros" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white">Equipo de Barra & Camareros</h2>
                <p className="text-xs text-gray-400">Control de quién sella cada café y firma las operaciones</p>
              </div>

              <button
                onClick={() => setIsAddingWaiter(true)}
                className="px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Camarero</span>
              </button>
            </div>

            {/* Camarero en Turno Actual */}
            <div className="bg-[#151324] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                Camarero Activo en Turno de Barra
              </h3>
              <div className="flex flex-wrap gap-3">
                {business.empleados.map((emp) => {
                  const isCurrent = activeWaiter === emp.nombre;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setActiveWaiter(emp.nombre);
                        playChime("scan");
                      }}
                      className={`px-4 py-3 rounded-2xl border font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
                        isCurrent
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                          : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{emp.nombre}</span>
                      {isCurrent && <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded">EN TURNO</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listado de Camareros Registrados */}
            <div className="bg-[#151324] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                Personal Autorizado
              </h3>
              <div className="divide-y divide-white/5">
                {business.empleados.map((emp) => (
                  <div key={emp.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-amber-400">
                        {emp.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{emp.nombre}</p>
                        <p className="text-[10px] text-gray-500 font-mono">PIN: ••••</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {activeWaiter === emp.nombre ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          Activo en Barra
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveWaiter(emp.nombre)}
                          className="text-[10px] text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded cursor-pointer"
                        >
                          Poner en Turno
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: AJUSTES (CONFIGURACIÓN DE NEGOCIO Y COPIAS DE SEGURIDAD)*/}
        {/* ============================================================ */}
        {activeTab === "ajustes" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Ajustes & Personalización</h2>
              <p className="text-xs text-gray-400">Configura los parámetros del local, premios y copias de seguridad</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Formulario de Parámetros */}
              <div className="bg-[#151324] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Datos del Negocio</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1 font-bold">Nombre del Establecimiento</label>
                    <input
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-bold">Premio de Fidelización</label>
                    <input
                      type="text"
                      value={rewardName}
                      onChange={(e) => setRewardName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-bold">Sellos Necesarios para el Premio</label>
                    <input
                      type="number"
                      value={maxStamps}
                      min={5}
                      max={20}
                      onChange={(e) => setMaxStamps(parseInt(e.target.value) || 10)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black rounded-xl hover:opacity-95 transition cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    {settingsSaved ? "¡Cambios Guardados!" : "Guardar Cambios"}
                  </button>
                </div>
              </div>

              {/* Copias de Seguridad & Dispositivos */}
              <div className="bg-[#151324] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center space-x-2">
                  <Save className="w-4 h-4 text-purple-400" />
                  <span>Copias de Seguridad & Datos</span>
                </h3>

                <div className="space-y-3 text-xs text-gray-400">
                  <p>
                    Descarga una copia completa de tus clientes y sellos en formato JSON o restáurala en cualquier momento.
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={handleExportData}
                      className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Descargar Copia de Seguridad JSON</span>
                    </button>

                    <label className="w-full py-3 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 font-bold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer">
                      <Upload className="w-4 h-4 text-purple-300" />
                      <span>Restaurar Copia de Seguridad</span>
                      <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    </label>
                  </div>

                  <div className="border-t border-white/10 pt-3 text-[11px] space-y-1">
                    <p className="text-gray-500 font-mono">StamPass VIP v3.2 · Bar La Iglesia</p>
                    <p className="text-emerald-400 flex items-center space-x-1">
                      <span>●</span>
                      <span>Lector USB Scanner wedge sincronizado</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MENÚ DE ABAJO FIJO (BOTTOM NAVIGATION BAR)                   */}
      {/* ============================================================ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D111D]/95 backdrop-blur-md border-t border-white/10 z-40 px-2 py-2 flex justify-around items-center max-w-4xl mx-auto shadow-2xl">
        <button
          onClick={() => setActiveTab("tpv")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "tpv"
              ? "text-amber-400 bg-amber-500/10 font-bold border border-amber-500/20"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Coffee className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">TPV Barra</span>
        </button>

        <button
          onClick={() => setActiveTab("qr")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "qr"
              ? "text-purple-400 bg-purple-500/10 font-bold border border-purple-500/20"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <QrCode className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Mi QR</span>
        </button>

        <button
          onClick={() => setActiveTab("crm")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "crm"
              ? "text-blue-400 bg-blue-500/10 font-bold border border-blue-500/20"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">CRM</span>
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "dashboard"
              ? "text-emerald-400 bg-emerald-500/10 font-bold border border-emerald-500/20"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab("camareros")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "camareros"
              ? "text-amber-300 bg-amber-500/10 font-bold border border-amber-500/20"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Camareros</span>
        </button>

        <button
          onClick={() => setActiveTab("ajustes")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "ajustes"
              ? "text-indigo-400 bg-indigo-500/10 font-bold border border-indigo-500/20"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Ajustes</span>
        </button>
      </nav>

      {/* ============================================================ */}
      {/* MODAL: EDITAR CLIENTE                                        */}
      {/* ============================================================ */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151324] border border-amber-500/40 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Editar Datos del Cliente VIP</span>
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Nombre completo:</label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Teléfono / WhatsApp:</label>
                <input
                  type="text"
                  value={editTelefono}
                  onChange={(e) => setEditTelefono(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Correo Electrónico:</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-1/2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveEditCustomer}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ALTA RÁPIDA DE NUEVO CLIENTE                         */}
      {/* ============================================================ */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151324] border border-purple-500/40 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>Alta Rápida de Nuevo Cliente VIP</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Nombre completo (*):</label>
                <input
                  type="text"
                  placeholder="Ej. Paula Milena"
                  value={addNombre}
                  onChange={(e) => setAddNombre(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-400 font-bold"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Teléfono / WhatsApp (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ej. 633557024"
                  value={addTelefono}
                  onChange={(e) => setAddTelefono(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-1/2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveNewCustomer}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer"
              >
                Crear y Seleccionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: AÑADIR CAMARERO                                      */}
      {/* ============================================================ */}
      {isAddingWaiter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151324] border border-amber-500/40 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Añadir Camarero a Barra</span>
              </h3>
              <button onClick={() => setIsAddingWaiter(false)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Nombre del camarero:</label>
                <input
                  type="text"
                  placeholder="Ej. Carlos"
                  value={newWaiterName}
                  onChange={(e) => setNewWaiterName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-bold"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">PIN de 4 dígitos:</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="1234"
                  value={newWaiterPin}
                  onChange={(e) => setNewWaiterPin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingWaiter(false)}
                className="w-1/2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddWaiter}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                Guardar Camarero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
