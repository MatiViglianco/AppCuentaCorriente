import React from 'react';
import type { Transaccion } from '../../services/transaccionService';

interface TransaccionesTableProps {
  transacciones: Transaccion[]; // This will be the paginated list
  onAbrirModalPago: (transaccion: Transaccion) => void; 
  clienteNombre: string; 
}

interface GrupoTransaccion {
  key: string;
  titulo: string;
  transacciones: Transaccion[];
  subtotalOriginal: number;
  subtotalPagado: number;
  subtotalRestante: number;
}

const agruparTransaccionesPorMes = (transacciones: Transaccion[]): GrupoTransaccion[] => {
    const grupos: { [key: string]: { titulo: string; transacciones: Transaccion[]; key: string; subtotalOriginal: number; subtotalPagado: number; subtotalRestante: number; } } = {};
    
    transacciones.forEach(transaccion => {
      const fecha = new Date(transaccion.fecha + 'T00:00:00');
      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();
      const clave = `${anio}-${mes}`;
      
      if (!grupos[clave]) {
        const nombreMes = fecha.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
        grupos[clave] = {
          titulo: `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}`,
          transacciones: [],
          key: clave,
          subtotalOriginal: 0,
          subtotalPagado: 0,
          subtotalRestante: 0,
        };
      }
      grupos[clave].transacciones.push(transaccion);
      grupos[clave].subtotalOriginal += transaccion.monto;
      grupos[clave].subtotalPagado += transaccion.montoPagado;
      grupos[clave].subtotalRestante += (transaccion.monto - transaccion.montoPagado);
    });
    
    return Object.values(grupos)
      .sort((a, b) => {
        const [anioA, mesA] = a.key.split('-').map(Number);
        const [anioB, mesB] = b.key.split('-').map(Number);
        if (anioA !== anioB) return anioB - anioA;
        return mesB - mesA;
      });
};


export const TransaccionesTable: React.FC<TransaccionesTableProps> = ({ transacciones, onAbrirModalPago, clienteNombre }) => {
  if (transacciones.length === 0) {
    return <p className="text-gray-500 text-center py-6">No hay transacciones para mostrar en esta página para {clienteNombre}.</p>;
  }

  const grupos = agruparTransaccionesPorMes(transacciones); // Groups only the current page of transactions
  const totalGeneralRestantePagina = transacciones.reduce((sum, t) => sum + (t.monto - t.montoPagado), 0);

  const getEstadoClass = (estado: Transaccion['estado']): string => {
    switch (estado) {
      case 'pagado': return 'bg-green-100 text-green-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'parcialmente_pagado': return 'bg-yellow-100 text-yellow-800'; 
      case 'activo': return 'bg-blue-100 text-blue-800'; 
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getEstadoText = (estado: Transaccion['estado']): string => {
    switch (estado) {
        case 'pagado': return 'Pagado';
        case 'vencido': return 'Vencido';
        case 'parcialmente_pagado': return 'Parcial';
        case 'activo': return 'A Pagar';
        default: return estado;
      }
  }

  return (
    <div className="mt-2">
      {grupos.map((grupo) => (
        <div key={grupo.key} className="mb-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-0 bg-gray-100 p-3 rounded-t-lg border-b border-gray-200 text-gray-800">{grupo.titulo}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-600">Fecha</th>
                  <th className="p-3 text-left font-medium text-gray-600">Descripción</th>
                  <th className="p-3 text-right font-medium text-gray-600">Original</th>
                  <th className="p-3 text-right font-medium text-gray-600">Pagado</th>
                  <th className="p-3 text-right font-medium text-gray-600">Restante</th>
                  <th className="p-3 text-center font-medium text-gray-600">Estado</th>
                  <th className="p-3 text-center font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {grupo.transacciones.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(transaccion => {
                  const restante = transaccion.monto - transaccion.montoPagado;
                  return (
                    <tr key={transaccion.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-3 whitespace-nowrap text-gray-700">
                        {new Date(transaccion.fecha + 'T00:00:00').toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                      </td>
                      <td className="p-3 min-w-[150px] text-gray-700">{transaccion.descripcion || <span className="text-gray-400">- Sin descripción -</span>}</td>
                      <td className="p-3 text-right font-medium whitespace-nowrap text-gray-700">
                        ${transaccion.monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                       <td className="p-3 text-right font-medium whitespace-nowrap text-green-600">
                        ${transaccion.montoPagado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                       <td className={`p-3 text-right font-medium whitespace-nowrap ${restante > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        ${restante.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getEstadoClass(transaccion.estado)}`}>
                          {getEstadoText(transaccion.estado)}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {transaccion.estado !== 'pagado' && (
                          <button
                            onClick={() => onAbrirModalPago(transaccion)}
                            className="bg-red-400 text-white px-2.5 py-1 rounded-md hover:bg-red-500 transition-colors text-xs font-semibold"
                            title="Registrar Pago"
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 font-semibold text-gray-700">
                  <td colSpan={2} className="p-3 text-right">Subtotales del mes:</td>
                  <td className="p-3 text-right">${grupo.subtotalOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right text-green-700">${grupo.subtotalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right text-red-700">${grupo.subtotalRestante.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
      
      {grupos.length > 0 && (
        <div className="mt-6 text-right font-bold text-xl text-gray-700">
          Total Restante (Página Actual): ${totalGeneralRestantePagina.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
};