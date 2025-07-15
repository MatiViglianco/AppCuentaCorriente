export interface Transaccion {
  id: string;
  clienteId: string;
  monto: number; 
  montoPagado: number; 
  descripcion?: string;
  fecha: string; 
  estado: 'activo' | 'vencido' | 'pagado' | 'parcialmente_pagado';
  createdAt: string;
}

const TRANSACCIONES_STORAGE_KEY = 'transacciones';

export const getTransaccionesFromStorage = (): Transaccion[] => {
  try {
    const transaccionesGuardadas = localStorage.getItem(TRANSACCIONES_STORAGE_KEY);
    const parsed = transaccionesGuardadas ? JSON.parse(transaccionesGuardadas) : [];
    // Realiza una validación y asignación de valores por defecto más robusta
    return parsed.map((t: Partial<Transaccion>): Transaccion => ({
        id: typeof t.id === 'string' ? t.id : `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`, 
        clienteId: typeof t.clienteId === 'string' ? t.clienteId : 'unknown_client', 
        monto: typeof t.monto === 'number' ? t.monto : 0,
        montoPagado: typeof t.montoPagado === 'number' ? t.montoPagado : 0,
        descripcion: typeof t.descripcion === 'string' ? t.descripcion : undefined,
        fecha: typeof t.fecha === 'string' ? t.fecha : new Date().toISOString().split('T')[0], 
        estado: t.estado && ['activo', 'vencido', 'pagado', 'parcialmente_pagado'].includes(t.estado) ? t.estado : 'activo', 
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(), 
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

    const transaccion = { ...transacciones[transaccionIndex] }; 
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

// --- Nueva función de servicio ---
export const registrarPagoParcialTotalEnStorage = (clienteId: string, montoTotalDelPago: number): Transaccion[] | null => {
  if (montoTotalDelPago <= 0) return null;

  const todasLasTransacciones = getTransaccionesFromStorage();
  let montoRestanteDelPago = montoTotalDelPago;

  // Filtrar y ordenar las deudas pendientes del cliente (de la más antigua a la más nueva)
  const deudasPendientes = todasLasTransacciones
    .filter(t => t.clienteId === clienteId && t.estado !== 'pagado')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  // Aplicar el pago a las deudas en orden
  for (const transaccion of deudasPendientes) {
    if (montoRestanteDelPago <= 0) break;

    const deudaTransaccion = transaccion.monto - transaccion.montoPagado;
    const pagoParaEstaTransaccion = Math.min(montoRestanteDelPago, deudaTransaccion);

    transaccion.montoPagado += pagoParaEstaTransaccion;
    montoRestanteDelPago -= pagoParaEstaTransaccion;

    // Actualizar estado de la transacción
    if (transaccion.montoPagado >= transaccion.monto) {
      transaccion.montoPagado = transaccion.monto; // Asegurar que no se pague de más
      transaccion.estado = 'pagado';
    } else {
      transaccion.estado = 'parcialmente_pagado';
    }

    // Actualizar la transacción en la lista principal
    const indexEnListaPrincipal = todasLasTransacciones.findIndex(t => t.id === transaccion.id);
    if (indexEnListaPrincipal !== -1) {
      todasLasTransacciones[indexEnListaPrincipal] = transaccion;
    }
  }

  saveTransaccionesToStorage(todasLasTransacciones);
  return todasLasTransacciones;
};
// --- Fin de la nueva función ---

export const deleteTransaccionFromStorage = (transaccionId: string): void => {
  let transacciones = getTransaccionesFromStorage();
  transacciones = transacciones.filter(t => t.id !== transaccionId);
  saveTransaccionesToStorage(transacciones);
};
