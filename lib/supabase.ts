import { createClient } from "@supabase/supabase-js";
import { Card } from "./db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wsrkqxqjahmtqjrcaqig.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcmtxeHFqYWhtdHFqcmNhcWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2OTQyOTMsImV4cCI6MjEwMzI3MDI5M30.PyL68tudM7qkoOognbm_-dCMgsJTfNv2wlIncUPNC3c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function supabaseCardToCard(row: any): Card {
  return {
    id: row.id,
    cliente_id: "cli-" + row.id,
    campana_id: "camp-1",
    sellos_acumulados: Number(row.sellos) || 0,
    sellos_totales_historicos: Number(row.sellos_historicos) || Number(row.sellos) || 0,
    premio_pendiente: !!row.premio_pendiente,
    fecha_creacion: row.created_at || new Date().toISOString(),
    ultima_visita: row.ultima_visita || new Date().toISOString(),
    cliente: {
      id: "cli-" + row.id,
      nombre: row.nombre || "Cliente VIP",
      email: row.email || "",
      telefono: row.telefono || "",
      fecha_registro: row.created_at || new Date().toISOString()
    },
    campana: {
      id: "camp-1",
      nombre: "Fidelización Café VIP",
      max_sellos: 10,
      premio: "10º Café GRATIS",
      negocio: { nombre: "Bar La Iglesia" }
    }
  };
}

export async function fetchCardById(cardId: string): Promise<Card | null> {
  try {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .maybeSingle();

    if (error) {
      console.error("fetchCardById error:", error);
      return null;
    }
    if (!data) return null;
    return supabaseCardToCard(data);
  } catch (err) {
    console.error("fetchCardById exception:", err);
    return null;
  }
}

export async function searchCard(query: string): Promise<Card | null> {
  const q = query.trim();
  if (!q) return null;

  try {
    // 1. Try exact ID
    const { data: byId } = await supabase
      .from("cards")
      .select("*")
      .eq("id", q)
      .maybeSingle();
    if (byId) return supabaseCardToCard(byId);

    // 2. Try exact phone or email
    const { data: byContact } = await supabase
      .from("cards")
      .select("*")
      .or(`telefono.eq.${q},email.eq.${q}`)
      .limit(1);
    if (byContact && byContact.length > 0) return supabaseCardToCard(byContact[0]);

    // 3. Try name match
    const { data: byName } = await supabase
      .from("cards")
      .select("*")
      .ilike("nombre", `%${q}%`)
      .limit(1);
    if (byName && byName.length > 0) return supabaseCardToCard(byName[0]);

    return null;
  } catch (err) {
    console.error("searchCard exception:", err);
    return null;
  }
}

export async function fetchAllCards(): Promise<Card[]> {
  try {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("ultima_visita", { ascending: false });

    if (error || !data) return [];
    return data.map(supabaseCardToCard);
  } catch (err) {
    console.error("fetchAllCards exception:", err);
    return [];
  }
}

export async function upsertCard(card: {
  id: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  sellos?: number;
  sellos_historicos?: number;
  premio_pendiente?: boolean;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("cards").upsert({
      id: card.id,
      nombre: card.nombre,
      telefono: card.telefono || null,
      email: card.email || null,
      sellos: card.sellos ?? 0,
      sellos_historicos: card.sellos_historicos ?? card.sellos ?? 0,
      premio_pendiente: !!card.premio_pendiente,
      ultima_visita: new Date().toISOString()
    });
    if (error) {
      console.error("upsertCard error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("upsertCard exception:", err);
    return false;
  }
}

export async function updateCardStamps(
  id: string,
  sellos: number,
  sellosHistoricos: number,
  premioPendiente: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("cards")
      .update({
        sellos,
        sellos_historicos: sellosHistoricos,
        premio_pendiente: premioPendiente,
        ultima_visita: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("updateCardStamps error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("updateCardStamps exception:", err);
    return false;
  }
}
