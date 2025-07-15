import React, { useMemo } from 'react';
import type { Transaccion } from '../services/transaccionService';
import type { Cliente } from '../services/clienteService'; // Importar tipo Cliente

interface ReportesPageProps {
  allTransacciones: Transaccion[];
  allClientes: Cliente[]; // Añadir clientes a las props
  onVolver: () => void;
}

interface ReporteTransaccionDetalle {
  id: string;
  clienteNombre: string;
  descripcion?: string;
  monto: number;
  montoPagado: number;
  restante: number;
}

interface ReporteDiario {
  fecha: string;
  totalOriginal: number;
  totalPagado: number;
  totalRestante: number;
  transacciones: ReporteTransaccionDetalle[];
}

interface ReporteMensual {
  mesKey: string;
  nombreMes: string;
  totalOriginal: number;
  totalPagado: number;
  totalRestante: number;
  dias: {
    [diaKey: string]: ReporteDiario;
  };
}

export const ReportesPage: React.FC<ReportesPageProps> = ({ allTransacciones, allClientes, onVolver }) => {
  
  // Crear un mapa de clientes para buscar nombres fácilmente
  const clienteMap = useMemo(() => new Map(allClientes.map(c => [c.id, `${c.apellido}, ${c.nombre}`])), [allClientes]);

  const reportes = useMemo(() => {
    const reportesAgrupados: { [mesKey: string]: ReporteMensual } = {};

    allTransacciones.forEach(t => {
      const fechaTransaccion = new Date(t.fecha + 'T00:00:00');
      const mesKey = `${fechaTransaccion.getFullYear()}-${String(fechaTransaccion.getMonth() + 1).padStart(2, '0')}`;
      const diaKey = t.fecha;

      if (!reportesAgrupados[mesKey]) {
        reportesAgrupados[mesKey] = {
          mesKey,
          nombreMes: fechaTransaccion.toLocaleString('es-AR', { month: 'long', year: 'numeric' }),
          totalOriginal: 0,
          totalPagado: 0,
          totalRestante: 0,
          dias: {},
        };
      }

      const mesActual = reportesAgrupados[mesKey];
      mesActual.totalOriginal += t.monto;
      mesActual.totalPagado += t.montoPagado;
      mesActual.totalRestante += (t.monto - t.montoPagado);

      if (!mesActual.dias[diaKey]) {
        mesActual.dias[diaKey] = {
          fecha: diaKey,
          totalOriginal: 0,
          totalPagado: 0,
          totalRestante: 0,
          transacciones: [], // Inicializar array de transacciones
        };
      }
      
      const diaActual = mesActual.dias[diaKey];
      diaActual.totalOriginal += t.monto;
      diaActual.totalPagado += t.montoPagado;
      diaActual.totalRestante += (t.monto - t.montoPagado);
      
      // Añadir detalle de la transacción al día correspondiente
      diaActual.transacciones.push({
        id: t.id,
        clienteNombre: clienteMap.get(t.clienteId) || 'Cliente Desconocido',
        descripcion: t.descripcion,
        monto: t.monto,
        montoPagado: t.montoPagado,
        restante: t.monto - t.montoPagado,
      });
    });

    return Object.values(reportesAgrupados).sort((a, b) => b.mesKey.localeCompare(a.mesKey));

  }, [allTransacciones, clienteMap]);

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Reporte General de Transacciones</h2>
        <button
          onClick={onVolver}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Volver a Gestión
        </button>
      </div>

      {reportes.length === 0 && (
        <p className="text-gray-500 text-center py-10">No hay transacciones registradas para generar reportes.</p>
      )}

      {reportes.map(reporteMes => (
        <div key={reporteMes.mesKey} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            {reporteMes.nombreMes.charAt(0).toUpperCase() + reporteMes.nombreMes.slice(1)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-center">
            <div className="p-3 bg-slate-200 rounded shadow">
              <p className="text-sm text-gray-600">Total Original del Mes</p>
              <p className="text-lg font-bold text-gray-800">${reporteMes.totalOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-green-100 rounded shadow">
              <p className="text-sm text-green-700">Total Pagado del Mes</p>
              <p className="text-lg font-bold text-green-800">${reporteMes.totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-red-100 rounded shadow">
              <p className="text-sm text-red-700">Total Restante del Mes</p>
              <p className="text-lg font-bold text-red-800">${reporteMes.totalRestante.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <h4 className="text-md font-semibold text-gray-700 mt-6 mb-2">Detalle por Día:</h4>
          {Object.values(reporteMes.dias).sort((a, b) => b.fecha.localeCompare(a.fecha)).map(reporteDia => (
            <div key={reporteDia.fecha} className="mb-3 p-3 border-l-4 border-red-400 bg-white rounded-r-md shadow-sm">
              <div className="flex justify-between items-baseline">
                <p className="font-medium text-gray-800">
                  {new Date(reporteDia.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="text-sm grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                   <p>Original: <span className="font-semibold">${reporteDia.totalOriginal.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span></p>
                   <p className="text-green-600">Pagado: <span className="font-semibold">${reporteDia.totalPagado.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span></p>
                   <p className="text-red-600">Restante: <span className="font-semibold">${reporteDia.totalRestante.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span></p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {reporteDia.transacciones.map(tx => (
                  <div key={tx.id} className="text-xs p-2 bg-gray-50 rounded border border-gray-200 grid grid-cols-3 gap-2">
                     <div>
                        <p className="font-semibold text-gray-700">{tx.clienteNombre}</p>
                        <p className="text-gray-500">{tx.descripcion || 'Sin descripción'}</p>
                     </div>
                     <div className="text-right">
                        <p>Monto: ${tx.monto.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-red-600">Debe: ${tx.restante.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
