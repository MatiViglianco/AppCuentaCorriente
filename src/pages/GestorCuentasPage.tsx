import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; 
import { useClientes } from '../hooks/useClientes';
import { useTransacciones } from '../hooks/useTransacciones';
import { ClienteForm } from '../components/cliente/ClienteForm';
import { ClienteList } from '../components/cliente/ClienteList';
import { TransaccionForm } from '../components/transaccion/TransaccionForm';
import { TransaccionesTable } from '../components/transaccion/TransaccionesTable';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { EditClienteModal } from '../components/cliente/EditClienteModal'; 
import { PaymentModal } from '../components/transaccion/PaymentModal'; 
import { PaginationControls } from '../components/ui/PaginationControls'; 
import type { Cliente } from '../services/clienteService';
import type { Transaccion } from '../services/transaccionService';
import { Upload, Download, BarChart3 } from 'lucide-react'; 

type FiltroEstado = 'todos' | 'activo' | 'vencido' | 'pagado' | 'parcialmente_pagado'; 

interface GestorCuentasPageProps { 
  onNavigateToReportes: () => void;
}

const CLIENTES_PER_PAGE = 10; 
const TRANSACCIONES_PER_PAGE = 25; 

export const GestorCuentasPage: React.FC<GestorCuentasPageProps> = ({ onNavigateToReportes }) => { 
  const {
    clientes, 
    setClientes,
    agregarCliente: agregarNuevoClienteHook,
    actualizarCliente: actualizarClienteHook, 
    eliminarCliente: eliminarClienteHook,     
    busquedaCliente,
    setBusquedaCliente,
    ordenClientes,
    setOrdenClientes,
    clientesFiltradosYOrdenados,
    calcularTotalDeuda
  } = useClientes();

  const {
    transacciones: allTransacciones, 
    setTransacciones,
    agregarTransaccion: agregarNuevaTransaccionHook,
    registrarPago: registrarPagoHook, 
    pagarTodasDeudasCliente: pagarTodasDeudasClienteHook,
    eliminarTransaccionesPorCliente, 
    eliminarTransaccion: eliminarTransaccionHook, 
    getTransaccionesByCliente,
  } = useTransacciones();

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false); 
  const [mostrarFormularioTransaccion, setMostrarFormularioTransaccion] = useState(false); 
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  
  const [showConfirmacionPagarTodoModal, setShowConfirmacionPagarTodoModal] = useState(false);
  const [transaccionesParaPagarTodo, setTransaccionesParaPagarTodo] = useState<Transaccion[]>([]);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false); 
  const [transactionForPayment, setTransactionForPayment] = useState<Transaccion | null>(null);

  const [mostrarModalEditarCliente, setMostrarModalEditarCliente] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);

  const [showConfirmacionEliminarClienteModal, setShowConfirmacionEliminarClienteModal] = useState(false);
  const [clienteParaEliminar, setClienteParaEliminar] = useState<Cliente | null>(null);

  const [showConfirmacionEliminarTransaccionModal, setShowConfirmacionEliminarTransaccionModal] = useState(false); 
  const [transaccionParaEliminar, setTransaccionParaEliminar] = useState<Transaccion | null>(null); 


  const [currentPageClientes, setCurrentPageClientes] = useState(1);
  const [currentPageTransacciones, setCurrentPageTransacciones] = useState(1);

  const inputFileRef = useRef<HTMLInputElement>(null); 


  const listaClientesFiltradaYOrdenada = useMemo(() => {
      return clientesFiltradosYOrdenados(allTransacciones);
  }, [clientesFiltradosYOrdenados, allTransacciones]);

  const totalClientePages = Math.ceil(listaClientesFiltradaYOrdenada.length / CLIENTES_PER_PAGE);
  const clientesPaginados = useMemo(() => {
    const indexOfLastCliente = currentPageClientes * CLIENTES_PER_PAGE;
    const indexOfFirstCliente = indexOfLastCliente - CLIENTES_PER_PAGE;
    return listaClientesFiltradaYOrdenada.slice(indexOfFirstCliente, indexOfLastCliente);
  }, [listaClientesFiltradaYOrdenada, currentPageClientes]);

  const stableCalculateDeuda = useCallback((clienteId: string) => {
    return calcularTotalDeuda(clienteId, allTransacciones);
  }, [calcularTotalDeuda, allTransacciones]);


  const handleAgregarCliente = (apellido: string, nombre: string, telefono?: string) => { 
    agregarNuevoClienteHook(apellido, nombre, telefono); 
    setMostrarFormularioCliente(false); 
  };

  const handleAbrirModalEditarCliente = (cliente: Cliente) => {
    setClienteParaEditar(cliente);
    setMostrarModalEditarCliente(true);
  };

  const handleCerrarModalEditarCliente = () => {
    setClienteParaEditar(null);
    setMostrarModalEditarCliente(false);
  };

  const handleGuardarClienteEditado = (datosActualizados: Omit<Cliente, 'id' | 'fechaCreacion'>) => {
    if (clienteParaEditar) {
      actualizarClienteHook({ ...clienteParaEditar, ...datosActualizados });
    }
    handleCerrarModalEditarCliente();
  };

  const handleAbrirModalEliminarCliente = (cliente: Cliente) => {
    setClienteParaEliminar(cliente);
    setShowConfirmacionEliminarClienteModal(true);
  };
  
  const handleCerrarModalEliminarCliente = () => {
    setClienteParaEliminar(null);
    setShowConfirmacionEliminarClienteModal(false);
  };

  const handleConfirmarEliminarCliente = () => {
    if (clienteParaEliminar) {
      eliminarClienteHook(clienteParaEliminar.id);
      eliminarTransaccionesPorCliente(clienteParaEliminar.id); 
      if (clienteSeleccionado?.id === clienteParaEliminar.id) {
        setClienteSeleccionado(null); 
      }
      setCurrentPageClientes(1); 
    }
    handleCerrarModalEliminarCliente();
  };


  const handleAgregarTransaccion = (monto: number, descripcion: string | undefined, fecha: string) => {
    if (!clienteSeleccionado) return;
    agregarNuevaTransaccionHook({
      clienteId: clienteSeleccionado.id,
      monto, 
      descripcion,
      fecha,
    });
    setMostrarFormularioTransaccion(false); 
  };

  const handleAbrirModalEliminarTransaccion = (transaccion: Transaccion) => {
    setTransaccionParaEliminar(transaccion);
    setShowConfirmacionEliminarTransaccionModal(true);
  };

  const handleCerrarModalEliminarTransaccion = () => {
    setTransaccionParaEliminar(null);
    setShowConfirmacionEliminarTransaccionModal(false);
  };

  const handleConfirmarEliminarTransaccion = () => {
    if (transaccionParaEliminar) {
        eliminarTransaccionHook(transaccionParaEliminar.id);
    }
    handleCerrarModalEliminarTransaccion();
  };


  const transaccionesClienteSeleccionado = useMemo(() => {
    if (!clienteSeleccionado) return [];
    return getTransaccionesByCliente(clienteSeleccionado.id).sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [clienteSeleccionado, getTransaccionesByCliente, allTransacciones]);

  const transaccionesFiltradasDisplay = useMemo(() => {
    if (filtroEstado === 'todos') return transaccionesClienteSeleccionado;
    return transaccionesClienteSeleccionado.filter(t => t.estado === filtroEstado);
  }, [transaccionesClienteSeleccionado, filtroEstado]);

  const totalTransaccionPages = Math.ceil(transaccionesFiltradasDisplay.length / TRANSACCIONES_PER_PAGE);
  const transaccionesPaginadas = useMemo(() => {
    const indexOfLastTransaccion = currentPageTransacciones * TRANSACCIONES_PER_PAGE;
    const indexOfFirstTransaccion = indexOfLastTransaccion - TRANSACCIONES_PER_PAGE;
    return transaccionesFiltradasDisplay.slice(indexOfFirstTransaccion, indexOfLastTransaccion);
  }, [transaccionesFiltradasDisplay, currentPageTransacciones]);


  useEffect(() => {
    if (clienteSeleccionado && !clientes.find(c => c.id === clienteSeleccionado.id)) {
      setClienteSeleccionado(null);
    }
  }, [clientes, clienteSeleccionado]);

  useEffect(() => { 
    setCurrentPageTransacciones(1);
  }, [clienteSeleccionado, filtroEstado]);


  const handleAbrirModalPago = (transaccion: Transaccion) => {
    setTransactionForPayment(transaccion);
    setShowPaymentModal(true);
  };

  const handleCerrarModalPago = () => {
    setTransactionForPayment(null);
    setShowPaymentModal(false);
  };

  const handleConfirmarPago = (transactionId: string, amount: number) => {
    registrarPagoHook(transactionId, amount);
  };


  const handlePagarTodasDeudas = () => {
    if (!clienteSeleccionado) return;
    const deudasPendientes = transaccionesClienteSeleccionado.filter(t => t.estado !== 'pagado' && (t.monto - t.montoPagado > 0));
    if (deudasPendientes.length > 0) {
        setTransaccionesParaPagarTodo(deudasPendientes);
        setShowConfirmacionPagarTodoModal(true);
    } else {
        alert("Este cliente no tiene deudas pendientes.");
    }
  };

  const confirmarPagarTodasDeudas = () => {
    if (clienteSeleccionado) {
        pagarTodasDeudasClienteHook(clienteSeleccionado.id);
    }
    setShowConfirmacionPagarTodoModal(false);
    setTransaccionesParaPagarTodo([]);
  };

  const cancelarPagarTodasDeudas = () => {
    setShowConfirmacionPagarTodoModal(false);
    setTransaccionesParaPagarTodo([]);
  };

  const handleEnviarMensajeWhatsApp = (cliente: Cliente) => {
    if (!cliente.telefono) {
      alert("Este cliente no tiene un número de teléfono registrado.");
      return;
    }
    const deudasCliente = allTransacciones.filter(t => t.clienteId === cliente.id && t.estado !== 'pagado' && (t.monto - t.montoPagado > 0));
    if (deudasCliente.length === 0) {
      alert(`El cliente ${cliente.apellido}, ${cliente.nombre} no tiene deudas pendientes.`);
      return;
    }

    let mensaje = `Hola ${cliente.nombre} ${cliente.apellido},\n\n`;
    mensaje += `Te recordamos tu estado de cuenta pendiente en Carnicuenta:\n`;
    let totalDeuda = 0;

    deudasCliente.forEach(t => {
      const restante = t.monto - t.montoPagado;
      totalDeuda += restante;
      mensaje += `- ${t.descripcion || 'Gasto del ' + new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR')}: $${restante.toLocaleString('es-AR', {minimumFractionDigits: 2})}\n`;
    });
    mensaje += `\nTotal a pagar: $${totalDeuda.toLocaleString('es-AR', {minimumFractionDigits: 2})}\n\n`;
    mensaje += `Por favor, acércate a regularizar tu situación.\nGracias!`;
    
    let numeroWhatsApp = cliente.telefono;
    if (numeroWhatsApp.length === 10) { 
        numeroWhatsApp = `549${cliente.telefono}`; 
    } else {
        if (!numeroWhatsApp.startsWith('54')) {
            numeroWhatsApp = `54${cliente.telefono}`;
        }
    }

    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank'); 
  };

  const handleExportarDatos = () => {
    try {
        const datosParaExportar = {
            clientes: clientes, 
            transacciones: allTransacciones, 
        };
        const jsonString = JSON.stringify(datosParaExportar, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'carnicuenta-datos.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        alert('Datos exportados exitosamente como carnicuenta-datos.json');
    } catch (error) {
        console.error("Error al exportar datos:", error);
        alert('Error al exportar datos. Ver la consola para más detalles.');
    }
  };

  const handleImportarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text === 'string') {
                const datosImportados = JSON.parse(text);

                if (Array.isArray(datosImportados.clientes) && Array.isArray(datosImportados.transacciones)) {
                    if (window.confirm('¿Estás seguro de que deseas importar estos datos? Esto sobrescribirá los datos actuales.')) {
                        setClientes(datosImportados.clientes);
                        setTransacciones(datosImportados.transacciones);
                        setClienteSeleccionado(null); 
                        setCurrentPageClientes(1);
                        setCurrentPageTransacciones(1);
                        alert('Datos importados exitosamente.');
                    }
                } else {
                    alert('El archivo JSON no tiene el formato esperado (necesita un objeto con "clientes" y "transacciones" como arrays).');
                }
            }
        } catch (error) {
            console.error("Error al importar datos:", error);
            alert('Error al importar datos. Asegúrate de que el archivo es un JSON válido. Ver la consola para más detalles.');
        } finally {
             if (inputFileRef.current) {
                inputFileRef.current.value = "";
             }
        }
    };
    reader.readAsText(file);
  };


  return (
    <> 
        <div className="mb-6 p-4 bg-slate-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Herramientas</h3>
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleExportarDatos}
                    className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                    <Download size={18}/> Exportar Datos
                </button>
                <button
                    onClick={() => inputFileRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                   <Upload size={18}/> Importar Datos
                </button>
                <input
                    type="file"
                    accept=".json"
                    ref={inputFileRef}
                    onChange={handleImportarDatos}
                    className="hidden"
                />
                 <button
                    onClick={onNavigateToReportes} 
                    className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors text-sm"
                >
                    <BarChart3 size={18}/> Ver Reportes
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Exporta o importa tus datos. La importación sobrescribirá los datos actuales.
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 bg-white p-4 rounded-lg shadow-lg flex flex-col"> 
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Clientes</h2>
              <button
                onClick={() => setMostrarFormularioCliente(true)} 
                className="bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-500 transition-colors text-sm"
              >
                + Nuevo Cliente
              </button>
            </div>
            <div className="mb-4 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busquedaCliente}
                  onChange={(e) => {setBusquedaCliente(e.target.value); setCurrentPageClientes(1);}}
                  className="w-full p-2 pl-10 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {setOrdenClientes('nombre'); setCurrentPageClientes(1);}}
                  className={`text-xs px-3 py-1.5 rounded-md ${ordenClientes === 'nombre' ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Ordenar por Apellido
                </button>
                <button
                  onClick={() => {setOrdenClientes('deuda'); setCurrentPageClientes(1);}}
                  className={`text-xs px-3 py-1.5 rounded-md ${ordenClientes === 'deuda' ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Ordenar por Deuda
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[200px]"> 
                <ClienteList
                    clientes={clientesPaginados} 
                    selectedCliente={clienteSeleccionado}
                    onSelectCliente={(cliente) => {
                        setClienteSeleccionado(cliente);
                        setFiltroEstado('todos');
                        setCurrentPageTransacciones(1); 
                    }}
                    calculateDeuda={stableCalculateDeuda} 
                    allTransacciones={allTransacciones} 
                    onEditCliente={handleAbrirModalEditarCliente} 
                    onDeleteCliente={handleAbrirModalEliminarCliente} 
                    onSendMessage={handleEnviarMensajeWhatsApp} 
                />
            </div>
            <PaginationControls 
                currentPage={currentPageClientes}
                totalPages={totalClientePages}
                onPageChange={setCurrentPageClientes}
            />
          </div>

          <div className="md:w-2/3 bg-white p-4 rounded-lg shadow-lg flex flex-col"> 
            {clienteSeleccionado ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-gray-200">
                  <div className="mb-2 sm:mb-0">
                    <h2 className="text-xl font-semibold text-gray-700">{clienteSeleccionado.apellido}, {clienteSeleccionado.nombre}</h2>
                    <p className="text-sm text-gray-500">{clienteSeleccionado.telefono || "Sin teléfono registrado"}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <button
                      onClick={() => setMostrarFormularioTransaccion(true)} 
                      className="bg-red-400 text-white px-3 py-2 rounded-md hover:bg-red-500 transition-colors text-sm w-full sm:w-auto"
                    >
                      + Nuevo Gasto
                    </button>
                    <button
                      onClick={handlePagarTodasDeudas}
                      className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors text-sm w-full sm:w-auto"
                      disabled={transaccionesClienteSeleccionado.filter(t => t.estado !== 'pagado' && (t.monto - t.montoPagado > 0)).length === 0}
                    >
                      Pagar Todas las Deudas
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {(['todos', 'activo', 'parcialmente_pagado', 'vencido', 'pagado'] as FiltroEstado[]).map(estado => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`text-xs sm:text-sm px-3 py-1.5 rounded-md transition-colors ${filtroEstado === estado ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {estado === 'parcialmente_pagado' ? 'Parcial' : estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex-grow overflow-y-auto min-h-[200px]"> 
                    <TransaccionesTable
                    transacciones={transaccionesPaginadas} 
                    onAbrirModalPago={handleAbrirModalPago}
                    onEliminarTransaccion={handleAbrirModalEliminarTransaccion} 
                    clienteNombre={`${clienteSeleccionado.apellido}, ${clienteSeleccionado.nombre}`}
                    />
                </div>
                <PaginationControls
                    currentPage={currentPageTransacciones}
                    totalPages={totalTransaccionPages}
                    onPageChange={setCurrentPageTransacciones}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 flex-grow flex flex-col justify-center items-center"> 
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 11h0m4 0h0m4 0h0" />
                </svg>
                <p className="text-lg mt-2">Selecciona un cliente para ver sus transacciones o movimientos.</p>
                <p className="text-sm mt-1">O agrega un nuevo cliente para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      
      {mostrarFormularioCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-0 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                <ClienteForm
                    onAddCliente={handleAgregarCliente}
                    onCancel={() => setMostrarFormularioCliente(false)}
                />
            </div>
        </div>
      )}

      {mostrarFormularioTransaccion && clienteSeleccionado && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-0 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                <TransaccionForm
                    onAddTransaccion={handleAgregarTransaccion}
                    onCancel={() => setMostrarFormularioTransaccion(false)}
                    defaultDate={new Date().toISOString().split('T')[0]}
                />
            </div>
        </div>
      )}

      {transactionForPayment && (
        <PaymentModal
            isOpen={showPaymentModal}
            transaction={transactionForPayment}
            onClose={handleCerrarModalPago}
            onConfirmPayment={handleConfirmarPago}
        />
      )}

      {clienteParaEditar && (
        <EditClienteModal
            isOpen={mostrarModalEditarCliente}
            cliente={clienteParaEditar}
            onSave={handleGuardarClienteEditado}
            onCancel={handleCerrarModalEditarCliente}
        />
      )}

      <ConfirmationModal
        isOpen={showConfirmacionEliminarClienteModal}
        title="Confirmar Eliminación de Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente ${clienteParaEliminar?.apellido}, ${clienteParaEliminar?.nombre}? Esta acción también eliminará todas sus transacciones y no se puede deshacer.`}
        onConfirm={handleConfirmarEliminarCliente}
        onCancel={handleCerrarModalEliminarCliente}
        confirmText="Sí, Eliminar"
        cancelText="No, Cancelar"
      />
       <ConfirmationModal
        isOpen={showConfirmacionPagarTodoModal}
        title="Confirmar Pago Total"
        message={`¿Estás seguro de que deseas pagar todas las deudas pendientes de ${clienteSeleccionado?.apellido}, ${clienteSeleccionado?.nombre}?`}
        onConfirm={confirmarPagarTodasDeudas}
        onCancel={cancelarPagarTodasDeudas}
        confirmText="Sí, Pagar Todo"
        cancelText="No, Cancelar"
      >
        {transaccionesParaPagarTodo.length > 0 && (
            <div className="text-sm text-gray-600 mt-2">
                Se pagarán {transaccionesParaPagarTodo.length} transaccion(es) por un total de $
                {transaccionesParaPagarTodo.reduce((sum, t) => sum + (t.monto - t.montoPagado), 0).toLocaleString('es-AR', {minimumFractionDigits:2})}.
            </div>
        )}
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={showConfirmacionEliminarTransaccionModal}
        title="Confirmar Eliminación de Transacción"
        message={`¿Estás seguro de que deseas eliminar esta transacción? (${transaccionParaEliminar?.descripcion || 'Gasto del ' + (transaccionParaEliminar?.fecha ? new Date(transaccionParaEliminar.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '') } por $${transaccionParaEliminar?.monto.toLocaleString('es-AR')}) Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmarEliminarTransaccion}
        onCancel={handleCerrarModalEliminarTransaccion}
        confirmText="Sí, Eliminar"
        cancelText="No, Cancelar"
      />
    </> 
  );
};