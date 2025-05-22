export interface Transaccion {
  id: string;
  clienteId: string;
  monto: number; // Monto original de la transacción
  montoPagado: number; // Monto que ya ha sido pagado
  descripcion?: string;
  fecha: string; // YYYY-MM-DD
  estado: 'activo' | 'vencido' | 'pagado' | 'parcialmente_pagado';
  createdAt: string;
}

const TRANSACCIONES_STORAGE_KEY = 'transacciones';

export const getTransaccionesFromStorage = (): Transaccion[] => {
  try {
    const transaccionesGuardadas = localStorage.getItem(TRANSACCIONES_STORAGE_KEY);
    const parsed = transaccionesGuardadas ? JSON.parse(transaccionesGuardadas) : [];
    // Ensure montoPagado exists, default to 0 if not
    // Also ensure all fields of Transaccion are present or have defaults
    return parsed.map((t: Partial<Transaccion>): Transaccion => ({
        id: t.id || Date.now().toString() + Math.random(), // Provide a fallback id
        clienteId: t.clienteId || '', // Provide a fallback clienteId
        monto: typeof t.monto === 'number' ? t.monto : 0,
        montoPagado: typeof t.montoPagado === 'number' ? t.montoPagado : 0,
        descripcion: t.descripcion,
        fecha: t.fecha || new Date().toISOString().split('T')[0], // Fallback fecha
        estado: t.estado || 'activo', // Fallback estado
        createdAt: t.createdAt || new Date().toISOString(), // Fallback createdAt
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
  transaccionData: Omit<Transaccion, 'id' | 'estado' | 'createdAt' | 'montoPagado'>
): Transaccion => {
  const transacciones = getTransaccionesFromStorage();
  const nuevaTransaccion: Transaccion = {
    ...transaccionData,
    id: Date.now().toString(),
    montoPagado: 0,
    estado: 'activo', 
    createdAt: new Date().toISOString(),
  };
  const updatedTransacciones = [...transacciones, nuevaTransaccion];
  saveTransaccionesToStorage(updatedTransacciones);
  return nuevaTransaccion;
};

export const registrarPagoEnStorage = (transaccionId: string, montoDelPago: number): Transaccion | null => {
    const transacciones = getTransaccionesFromStorage();
    const transaccionIndex = transacciones.findIndex(t => t.id === transaccionId);

    if (transaccionIndex === -1) {
        console.error("Transacción no encontrada para registrar pago:", transaccionId);
        return null;
    }

    const transaccion = transacciones[transaccionIndex];
    const nuevoMontoPagado = transaccion.montoPagado + montoDelPago;

    if (nuevoMontoPagado >= transaccion.monto) {
        transaccion.montoPagado = transaccion.monto;
        transaccion.estado = 'pagado';
    } else if (nuevoMontoPagado > 0) {
        transaccion.montoPagado = nuevoMontoPagado;
        transaccion.estado = 'parcialmente_pagado';
    } else {
        transaccion.montoPagado = Math.max(0, nuevoMontoPagado); 
        if (transaccion.montoPagado === 0 && transaccion.estado !== 'vencido') {
             transaccion.estado = 'activo';
        }
    }
    
    transacciones[transaccionIndex] = transaccion;
    saveTransaccionesToStorage(transacciones);
    return transaccion;
};