import { useState, useEffect, useCallback } from 'react';
import type { Cliente } from '../services/clienteService'; 
import { 
    getClientesFromStorage, 
    saveClientesToStorage, 
    addClienteToStorage,
    updateClienteInStorage, 
    deleteClienteFromStorage 
} from '../services/clienteService';
import type { Transaccion } from '../services/transaccionService';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>(() => getClientesFromStorage());
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [ordenClientes, setOrdenClientes] = useState<'nombre' | 'deuda'>('nombre');

  useEffect(() => {
    saveClientesToStorage(clientes);
  }, [clientes]);

  const agregarCliente = useCallback((apellido: string, nombre: string, telefono?: string) => {
    if (!nombre || !apellido) {
      console.warn("Apellido y nombre son obligatorios para agregar cliente.");
      return null;
    }
    const nuevo = addClienteToStorage({ apellido, nombre, telefono });
    setClientes(prevClientes => [...prevClientes, nuevo]);
    return nuevo;
  }, []);

  const actualizarCliente = useCallback((clienteActualizado: Cliente) => {
    const actualizado = updateClienteInStorage(clienteActualizado);
    if (actualizado) {
      setClientes(prevClientes => 
        prevClientes.map(c => c.id === clienteActualizado.id ? clienteActualizado : c)
      );
    }
    return actualizado;
  }, []);

  const eliminarCliente = useCallback((clienteId: string) => {
    deleteClienteFromStorage(clienteId);
    setClientes(prevClientes => prevClientes.filter(c => c.id !== clienteId));
  }, []);


  const calcularTotalDeudaCallback = useCallback((clienteId: string, allTransacciones: Transaccion[]): number => {
    return allTransacciones
      .filter(t => t.clienteId === clienteId && t.estado !== 'pagado')
      .reduce((total, t) => total + (t.monto - t.montoPagado), 0); 
  }, []);

  const clientesFiltradosYOrdenados = useCallback((allTransacciones: Transaccion[]) => {
    return [...clientes]
      .filter(cliente => {
        const nombreCompleto = `${cliente.apellido} ${cliente.nombre}`.toLowerCase();
        const busquedaInvertida = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
        return nombreCompleto.includes(busquedaCliente.toLowerCase()) || busquedaInvertida.includes(busquedaCliente.toLowerCase());
      })
      .sort((a, b) => {
        if (ordenClientes === 'deuda') {
          return calcularTotalDeudaCallback(b.id, allTransacciones) - calcularTotalDeudaCallback(a.id, allTransacciones);
        }
        const nombreCompletoA = `${a.apellido} ${a.nombre}`.toLowerCase();
        const nombreCompletoB = `${b.apellido} ${b.nombre}`.toLowerCase();
        return nombreCompletoA.localeCompare(nombreCompletoB);
      });
  }, [clientes, busquedaCliente, ordenClientes, calcularTotalDeudaCallback]);

  return {
    clientes,
    setClientes,
    agregarCliente,
    actualizarCliente, 
    eliminarCliente,   
    busquedaCliente,
    setBusquedaCliente,
    ordenClientes,
    setOrdenClientes,
    clientesFiltradosYOrdenados,
    calcularTotalDeuda: calcularTotalDeudaCallback
  };
};
