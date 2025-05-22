export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fechaCreacion: string;
}

const CLIENTES_STORAGE_KEY = 'clientes';

export const getClientesFromStorage = (): Cliente[] => {
  try {
    const clientesGuardados = localStorage.getItem(CLIENTES_STORAGE_KEY);
    return clientesGuardados ? JSON.parse(clientesGuardados) : [];
  } catch (error) {
    console.error("Error parsing clientes from localStorage", error);
    return [];
  }
};

export const saveClientesToStorage = (clientes: Cliente[]): void => {
  try {
    localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(clientes));
  } catch (error) {
    console.error("Error saving clientes to localStorage", error);
  }
};

export const addClienteToStorage = (nuevoClienteData: Omit<Cliente, 'id' | 'fechaCreacion'>): Cliente => {
  const clientes = getClientesFromStorage();
  const nuevoCliente: Cliente = {
    ...nuevoClienteData,
    id: Date.now().toString(),
    fechaCreacion: new Date().toISOString(),
  };
  const updatedClientes = [...clientes, nuevoCliente];
  saveClientesToStorage(updatedClientes);
  return nuevoCliente;
};

export const updateClienteInStorage = (updatedCliente: Cliente): Cliente | null => {
  const clientes = getClientesFromStorage();
  const clienteIndex = clientes.findIndex(c => c.id === updatedCliente.id);
  if (clienteIndex === -1) {
    console.error("Cliente no encontrado para actualizar:", updatedCliente.id);
    return null;
  }
  clientes[clienteIndex] = updatedCliente;
  saveClientesToStorage(clientes);
  return updatedCliente;
};

export const deleteClienteFromStorage = (clienteId: string): void => {
  let clientes = getClientesFromStorage();
  clientes = clientes.filter(c => c.id !== clienteId);
  saveClientesToStorage(clientes);
  // Also delete associated transactions
  // This logic might be better placed in a higher-level service or hook that knows about both clients and transactions
  // For now, let's assume transactions are handled separately or this is a simplified version.
};