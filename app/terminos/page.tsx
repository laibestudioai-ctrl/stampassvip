"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 max-w-2xl mx-auto space-y-6 font-sans">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs text-amber-400 font-bold hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Inicio</span>
      </Link>
      <h1 className="text-2xl font-black text-white">Términos de Servicio del Programa VIP</h1>
      <div className="bg-[#131124] border border-white/10 rounded-3xl p-6 space-y-3 text-xs text-gray-300 leading-relaxed">
        <p>• Los sellos son personales e intransferibles.</p>
        <p>• La acumulación de 10 sellos da derecho a 1 café gratuito según las condiciones de la campaña.</p>
        <p>• El establecimiento se reserva el derecho de modificar o finalizar la promoción informando a los usuarios.</p>
      </div>
    </div>
  );
}
