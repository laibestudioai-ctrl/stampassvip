"use client";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 max-w-2xl mx-auto space-y-6 font-sans">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs text-amber-400 font-bold hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Inicio</span>
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white">Política de Privacidad y Protección de Datos (RGPD)</h1>
        <p className="text-xs text-gray-400">Responsable: Bar La Iglesia & StamPass VIP</p>
      </div>
      <div className="bg-[#131124] border border-white/10 rounded-3xl p-6 space-y-4 text-xs text-gray-300 leading-relaxed">
        <p>En cumplimiento del Reglamento General de Protección de Datos (RGPD UE 2016/679) y la LOPD-GDD 3/2018:</p>
        <h2 className="text-sm font-bold text-white pt-2">1. Finalidad del tratamiento</h2>
        <p>Los datos facilitados (nombre, teléfono o email) se utilizan exclusivamente para la gestión y asignación de sellos y recompensas de fidelización en Bar La Iglesia.</p>
        <h2 className="text-sm font-bold text-white pt-2">2. Derechos del usuario</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, supresión y limitación en cualquier momento comunicándote directamente en el establecimiento.</p>
      </div>
    </div>
  );
}
