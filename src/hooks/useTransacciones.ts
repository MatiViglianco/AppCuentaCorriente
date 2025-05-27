import { useState, useEffect, useCallback } from 'react';
import type { Transaccion } from '../services/transaccionService';
import {
  getTransaccionesFromStorage,
  saveTransaccionesToStorage,
  addTransaccionToStorage as addTransaccionService, 
  registrarPagoEnStorage 
} from '../services/transaccionService';

export const useTransacciones = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>(() => getTransaccionesFromStorage());

  const verificarTransaccionesVencidas = useCallback(() => {
    const fechaActual = new Date();
    const primerDiaMesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    primerDiaMesActual.setHours(0,0,0,0);

    setTransacciones(prevTransacciones =>
      prevTransacciones.map(t => {
        if (t.estado === 'pagado' && t.montoPagado >= t.monto) return t;

        let nuevoEstado = t.estado;
        const fechaTransaccion = new Date(t.fecha + "T00:00:00"); 

        if (fechaTransaccion < primerDiaMesActual) { 
            if (t.montoPagado < t.monto) {
                nuevoEstado = 'vencido';
            } else { 
                nuevoEstado = 'pagado';
            }
        } else { 
            if (t.montoPagado >= t.monto) {
                nuevoEstado = 'pagado';
            } else if (t.montoPagado > 0) {
                nuevoEstado = 'parcialmente_pagado';
            } else {
                nuevoEstado = 'activo';
            }
        }
        return { ...t, estado: nuevoEstado };
      })
    );
  }, []); 

  useEffect(() => {
    saveTransaccionesToStorage(transacciones);
  }, [transacciones]);

  const agregarTransaccion = useCallback((nuevaTransaccionData: Omit<Transaccion, 'id' | 'estado' | 'createdAt' | 'montoPagado'>) => {
    const nuevaTransaccionObj = addTransaccionService(nuevaTransaccionData);
    setTransacciones(prevTransacciones => [...prevTransacciones, nuevaTransaccionObj]);
    return nuevaTransaccionObj;
  }, []);

  const registrarPago = useCallback((transaccionId: string, montoDelPago: number) => {
    const transaccionActualizada = registrarPagoEnStorage(transaccionId, montoDelPago);
    if (transaccionActualizada) {
        setTransacciones(prev => prev.map(t => t.id === transaccionId ? transaccionActualizada : t));
    }
    verificarTransaccionesVencidas(); 
    return transaccionActualizada;
  }, [verificarTransaccionesVencidas]); 


  const marcarComoTotalmentePagado = useCallback((transaccionId: string) => {
    const transaccion = transacciones.find(t => t.id === transaccionId);
    if (transaccion) {
        const montoRestante = transaccion.monto - transaccion.montoPagado;
        if (montoRestante > 0) {
            registrarPago(transaccionId, montoRestante);
        } else if (transaccion.estado !== 'pagado') { 
            const transaccionActualizada = registrarPagoEnStorage(transaccionId, 0); 
            if (transaccionActualizada) {
                 setTransacciones(prev => prev.map(t => t.id === transaccionId ? transaccionActualizada : t));
            }
        }
    }
  }, [transacciones, registrarPago]);


  const pagarTodasDeudasCliente = useCallback((clienteId: string) => {
    const transaccionesCliente = transacciones.filter(t => t.clienteId === clienteId && t.estado !== 'pagado');
    transaccionesCliente.forEach(t => marcarComoTotalmentePagado(t.id));
  }, [transacciones, marcarComoTotalmentePagado]);

  const eliminarTransaccionesPorCliente = useCallback((clienteId: string) => {
    setTransacciones(prevTransacciones => prevTransacciones.filter(t => t.clienteId !== clienteId));
  }, []);


  useEffect(() => {
    verificarTransaccionesVencidas();
    const intervalo = setInterval(verificarTransaccionesVencidas, 86400000);
    return () => clearInterval(intervalo);
  }, [verificarTransaccionesVencidas]); 

  const getTransaccionesByCliente = useCallback(
    (clienteId: string) => {
      return transacciones.filter(t => t.clienteId === clienteId);
    },
    [transacciones]
  );

  return {
    transacciones,
    setTransacciones, 
    agregarTransaccion,
    registrarPago, 
    marcarComoTotalmentePagado, 
    pagarTodasDeudasCliente,
    eliminarTransaccionesPorCliente,
    verificarTransaccionesVencidas,
    getTransaccionesByCliente,
  };
};