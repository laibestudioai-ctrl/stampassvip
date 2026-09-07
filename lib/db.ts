export interface Customer {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_registro: string;
}

export interface Business {
  id: string;
  nombre: string;
  tipo: string;
  empleados: { id: string; nombre: string; pin: string }[];
}

export interface Card {
  id: string;
  cliente_id: string;
  campana_id: string;
  sellos_acumulados: number;
  sellos_totales_historicos: number;
  premio_pendiente: boolean;
  fecha_creacion: string;
  ultima_visita: string;
  cliente: Customer;
  campana: {
    id: string;
    nombre: string;
    max_sellos: number;
    premio: string;
    negocio?: { nombre: string };
    configuracion_visual?: any;
  };
}

export interface AuditLog {
  id: string;
  fecha: string;
  cliente_nombre: string;
  accion: string;
  sellos: number;
  empleado: string;
}

const DEFAULT_BUSINESS: Business = {
  id: "biz-la-iglesia",
  nombre: "Bar La Iglesia",
  tipo: "hosteleria",
  empleados: [
    { id: "emp-1", nombre: "Paula", pin: "1234" },
    { id: "emp-2", nombre: "Camarero 1", pin: "0000" }
  ]
};

const DEFAULT_CARDS: Card[] = [
  {
    id: "card-vip-default",
    cliente_id: "cli-1",
    campana_id: "camp-1",
    sellos_acumulados: 3,
    sellos_totales_historicos: 3,
    premio_pendiente: false,
    fecha_creacion: new Date().toISOString(),
    ultima_visita: new Date().toISOString(),
    cliente: {
      id: "cli-1",
      nombre: "Juan Pablo",
      email: "juanpablo@cliente.vip",
      telefono: "612345678",
      fecha_registro: new Date().toISOString()
    },
    campana: {
      id: "camp-1",
      nombre: "Fidelización Café VIP",
      max_sellos: 10,
      premio: "10º Café GRATIS",
      negocio: { nombre: "Bar La Iglesia" }
    }
  }
];

export const db = {
  getCards(): Card[] {
    if (typeof window === "undefined") return DEFAULT_CARDS;
    try {
      const data = localStorage.getItem("stampsync_tarjetas");
      if (data) return JSON.parse(data);
    } catch (e) {}
    this.saveCards(DEFAULT_CARDS);
    return DEFAULT_CARDS;
  },

  saveCards(cards: Card[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("stampsync_tarjetas", JSON.stringify(cards));
    } catch (e) {}
  },

  getAllCards(): Card[] {
    return this.getCards();
  },

  getCardById(id: string): Card | null {
    const cards = this.getCards();
    return cards.find(c => c.id === id || c.cliente_id === id) || null;
  },

  getCardBySearch(query: string): Card | null {
    let q = query.trim();
    if (!q) return null;

    // Check if query is a JSON string from QR
    if (q.startsWith("{") || q.includes('"id"') || q.includes('"nombre"') || q.includes('"email"')) {
      try {
        let cleanJson = q;
        // Fix dropped quotes from keyboard layouts
        cleanJson = cleanJson.replace(/([0-9]+)(sellos|id|nombre|email)":/g, '"$2":');
        const parsed = JSON.parse(cleanJson);
        return this.importCardFromQR(parsed);
      } catch (e) {
        // Fallback with regex
        const idMatch = q.match(/"id"\s*:\s*"([^"]+)"/);
        const nameMatch = q.match(/"nombre"\s*:\s*"([^"]+)"/);
        const emailMatch = q.match(/"email"\s*:\s*"([^"]+)"/);
        const sellosMatch = q.match(/"sellos"\s*:\s*([0-9]+)/);
        if (idMatch || nameMatch || emailMatch) {
          return this.importCardFromQR({
            id: idMatch ? idMatch[1] : undefined,
            nombre: nameMatch ? nameMatch[1] : undefined,
            email: emailMatch ? emailMatch[1] : undefined,
            sellos: sellosMatch ? parseInt(sellosMatch[1], 10) : 0
          });
        }
      }
    }

    const cards = this.getCards();
    const qLower = q.toLowerCase();
    return cards.find(c =>
      c.id.toLowerCase() === qLower ||
      c.cliente.nombre.toLowerCase().includes(qLower) ||
      (c.cliente.telefono && c.cliente.telefono.includes(q)) ||
      (c.cliente.email && c.cliente.email.toLowerCase().includes(qLower))
    ) || null;
  },

  importCardFromQR(data: { id?: string; nombre?: string; email?: string; telefono?: string; sellos?: number }): Card {
    const cards = this.getCards();
    const targetId = data.id || "card-" + Date.now().toString().slice(-6);

    let existing = cards.find(c => 
      c.id === targetId || 
      (data.email && c.cliente.email && c.cliente.email.toLowerCase() === data.email.toLowerCase()) ||
      (data.nombre && c.cliente.nombre.toLowerCase() === data.nombre.toLowerCase())
    );

    if (existing) {
      if (data.nombre && (existing.cliente.nombre.startsWith("Cliente VIP") || !existing.cliente.nombre)) {
        existing.cliente.nombre = data.nombre;
      }
      if (data.email && !existing.cliente.email) {
        existing.cliente.email = data.email;
      }
      this.saveCards(cards);
      return existing;
    }

    const newCard: Card = {
      id: targetId,
      cliente_id: "cli-" + Date.now().toString().slice(-6),
      campana_id: "camp-1",
      sellos_acumulados: data.sellos || 0,
      sellos_totales_historicos: data.sellos || 0,
      premio_pendiente: (data.sellos || 0) >= 10,
      fecha_creacion: new Date().toISOString(),
      ultima_visita: new Date().toISOString(),
      cliente: {
        id: "cli-" + Date.now().toString().slice(-6),
        nombre: data.nombre?.trim() || "Cliente VIP (" + targetId.slice(-4) + ")",
        email: data.email?.trim() || "",
        telefono: data.telefono?.trim() || "",
        fecha_registro: new Date().toISOString()
      },
      campana: {
        id: "camp-1",
        nombre: "Fidelización Café VIP",
        max_sellos: 10,
        premio: "10º Café GRATIS",
        negocio: { nombre: "Bar La Iglesia" }
      }
    };
    cards.unshift(newCard);
    this.saveCards(cards);
    return newCard;
  },

  addCustomer(nombre: string, emailOrPhone: string): Card {
    const isPhone = /^[0-9+ ]+$/.test(emailOrPhone.trim());
    return this.importCardFromQR({
      nombre,
      email: isPhone ? "" : emailOrPhone.trim(),
      telefono: isPhone ? emailOrPhone.trim() : ""
    });
  },

  addStamps(cardId: string, count: number = 1, empleado: string = "Paula"): { success: boolean; card?: Card; unlockedReward?: boolean } {
    const cards = this.getCards();
    const card = cards.find(c => c.id === cardId);
    if (!card) return { success: false };

    const newAccum = (card.sellos_acumulados + count) % 10;
    const reached10 = card.sellos_acumulados + count >= 10;
    
    card.sellos_acumulados = newAccum;
    card.sellos_totales_historicos += count;
    card.ultima_visita = new Date().toISOString();
    if (reached10) {
      card.premio_pendiente = true;
    }

    this.saveCards(cards);
    this.addAuditLog(card.cliente.nombre, `+${count} Sello(s)`, count, empleado);

    return { success: true, card, unlockedReward: reached10 };
  },

  redeemReward(cardId: string, empleado: string = "Paula"): { success: boolean; message: string } {
    const cards = this.getCards();
    const card = cards.find(c => c.id === cardId);
    if (!card) return { success: false, message: "Tarjeta no encontrada" };

    card.premio_pendiente = false;
    card.ultima_visita = new Date().toISOString();
    this.saveCards(cards);
    this.addAuditLog(card.cliente.nombre, "Canje de Premio VIP (10º Café)", 0, empleado);

    return { success: true, message: "¡Premio canjeado con éxito! Que lo disfrute." };
  },

  getAuditLogs(): AuditLog[] {
    if (typeof window === "undefined") return [];
    try {
      const logs = localStorage.getItem("stampsync_logs");
      if (logs) return JSON.parse(logs);
    } catch (e) {}
    return [];
  },

  addAuditLog(cliente: string, accion: string, sellos: number, empleado: string) {
    if (typeof window === "undefined") return;
    try {
      const logs = this.getAuditLogs();
      logs.unshift({
        id: "log-" + Date.now(),
        fecha: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        cliente_nombre: cliente,
        accion,
        sellos,
        empleado
      });
      localStorage.setItem("stampsync_logs", JSON.stringify(logs.slice(0, 30)));
    } catch (e) {}
  },

  getBusiness(): Business {
    return DEFAULT_BUSINESS;
  }
};
