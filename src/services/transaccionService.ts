// Define la estructura de un pago individual
export interface Pago {
  fecha: string; // Fecha en formato YYYY-MM-DD
  monto: number;
}

export interface Transaccion {
  id: string;
  clienteId: string;
  monto: number; 
  montoPagado: number; 
  descripcion?: string;
  fecha: string; 
  estado: 'activo' | 'vencido' | 'pagado' | 'parcialmente_pagado';
  createdAt: string;
  pagos: Pago[]; // Array para almacenar el historial de pagos
}

const TRANSACCIONES_STORAGE_KEY = 'transacciones';

export const getTransaccionesFromStorage = (): Transaccion[] => {
  try {
    const transaccionesGuardadas = localStorage.getItem(TRANSACCIONES_STORAGE_KEY);
    const parsed = transaccionesGuardadas ? JSON.parse(transaccionesGuardadas) : [];
    // Asegura que todas las transacciones tengan el campo 'pagos'
    return parsed.map((t: Partial<Transaccion>): Transaccion => ({
        id: typeof t.id === 'string' ? t.id : `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`, 
        clienteId: typeof t.clienteId === 'string' ? t.clienteId : 'unknown_client', 
        monto: typeof t.monto === 'number' ? t.monto : 0,
        montoPagado: typeof t.montoPagado === 'number' ? t.montoPagado : 0,
        descripcion: typeof t.descripcion === 'string' ? t.descripcion : undefined,
        fecha: typeof t.fecha === 'string' ? t.fecha : new Date().toISOString().split('T')[0], 
        estado: t.estado && ['activo', 'vencido', 'pagado', 'parcialmente_pagado'].includes(t.estado) ? t.estado : 'activo', 
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(), 
        pagos: Array.isArray(t.pagos) ? t.pagos : [], // Inicializa 'pagos' si no existe
    }));
  } catch (error) {
    console.error("Error parsing transacciones from localStorage", error);
    return [];
  }
};

export const saveTransaccionesToStorage = (transacciones: Transaccion[]): void => {
  try {
    localStorage.setItem(TRANSACCIONES_STORAGE_KEY, JSON.stringify(transacciones));
  } catch (error) {
    console.error("Error saving transacciones to localStorage", error);
  }
};

export const addTransaccionToStorage = (
  transaccionData: Omit<Transaccion, 'id' | 'estado' | 'createdAt' | 'montoPagado' | 'pagos'>
): Transaccion => {
  const transacciones = getTransaccionesFromStorage();
  const nuevaTransaccion: Transaccion = {
    ...transaccionData,
    id: Date.now().toString(),
    montoPagado: 0,
    estado: 'activo', 
    createdAt: new Date().toISOString(),
    pagos: [], // Inicializa el historial de pagos vacío
  };
  const updatedTransacciones = [...transacciones, nuevaTransaccion];
  saveTransaccionesToStorage(updatedTransacciones);
  return nuevaTransaccion;
};

// Ahora acepta la fecha del pago como argumento
export const registrarPagoEnStorage = (transaccionId: string, montoDelPago: number, fechaPago: string): Transaccion | null => {
    const transacciones = getTransaccionesFromStorage();
    const transaccionIndex = transacciones.findIndex(t => t.id === transaccionId);

    if (transaccionIndex === -1) {
        console.error("Transacción no encontrada para registrar pago:", transaccionId);
        return null;
    }

    const transaccion = { ...transacciones[transaccionIndex] }; 
    
    // Añade el nuevo pago al historial
    transaccion.pagos.push({ fecha: fechaPago, monto: montoDelPago });

    // Recalcula el monto total pagado
    const nuevoMontoPagado = transaccion.pagos.reduce((total, pago) => total + pago.monto, 0);

    if (nuevoMontoPagado >= transaccion.monto) {
        transaccion.montoPagado = transaccion.monto;
        transaccion.estado = 'pagado';
    } else {
        transaccion.montoPagado = nuevoMontoPagado;
        transaccion.estado = 'parcialmente_pagado';
    }
    
    transacciones[transaccionIndex] = transaccion;
    saveTransaccionesToStorage(transacciones);
    return transaccion;
};

// Ahora acepta la fecha del pago como argumento
export const registrarPagoParcialTotalEnStorage = (clienteId: string, montoTotalDelPago: number, fechaPago: string): Transaccion[] | null => {
  if (montoTotalDelPago <= 0) return null;

  const todasLasTransacciones = getTransaccionesFromStorage();
  let montoRestanteDelPago = montoTotalDelPago;

  const deudasPendientes = todasLasTransacciones
    .filter(t => t.clienteId === clienteId && t.estado !== 'pagado')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  for (const transaccion of deudasPendientes) {
    if (montoRestanteDelPago <= 0) break;

    const deudaTransaccion = transaccion.monto - transaccion.montoPagado;
    const pagoParaEstaTransaccion = Math.min(montoRestanteDelPago, deudaTransaccion);

    // Registra el pago con su fecha
    transaccion.pagos.push({ fecha: fechaPago, monto: pagoParaEstaTransaccion });
    transaccion.montoPagado += pagoParaEstaTransaccion;
    montoRestanteDelPago -= pagoParaEstaTransaccion;

    if (transaccion.montoPagado >= transaccion.monto) {
      transaccion.montoPagado = transaccion.monto;
      transaccion.estado = 'pagado';
    } else {
      transaccion.estado = 'parcialmente_pagado';
    }

    const indexEnListaPrincipal = todasLasTransacciones.findIndex(t => t.id === transaccion.id);
    if (indexEnListaPrincipal !== -1) {
      todasLasTransacciones[indexEnListaPrincipal] = transaccion;
    }
  }

  saveTransaccionesToStorage(todasLasTransacciones);
  return todasLasTransacciones;
};

export const deleteTransaccionFromStorage = (transaccionId: string): void => {
  let transacciones = getTransaccionesFromStorage();
  transacciones = transacciones.filter(t => t.id !== transaccionId);
  saveTransaccionesToStorage(transacciones);
};
