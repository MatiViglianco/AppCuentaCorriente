import React, { useState } from 'react';

interface TransaccionFormProps {
  onAddTransaccion: (monto: number, descripcion: string | undefined, fecha: string) => void;
  onCancel: () => void;
  defaultDate: string;
}

export const TransaccionForm: React.FC<TransaccionFormProps> = ({ onAddTransaccion, onCancel, defaultDate }) => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(defaultDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      alert('Por favor, ingrese un monto válido.');
      return;
    }
    if (!fecha) {
        alert('Por favor, seleccione una fecha.');
        return;
    }
    onAddTransaccion(montoNum, descripcion.trim() || undefined, fecha);
    setMonto('');
    setDescripcion('');
    onCancel(); 
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col"> 
      <h3 className="font-semibold text-xl mb-6 text-gray-800 text-center">Registrar Nuevo Gasto/Movimiento</h3>
      <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
        <div className="flex-grow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="fechaTransaccion" className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                id="fechaTransaccion"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-2 bg-gray-200 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700" // Changed bg-gray-100 to bg-gray-200
                required
                />
            </div>
            <div>
                <label htmlFor="montoTransaccion" className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input
                id="montoTransaccion"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                />
            </div>
            </div>
            <div>
            <label htmlFor="descripcionTransaccion" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input
                id="descripcionTransaccion"
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
                placeholder="Ej: Compra de mercadería"
            />
            </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 mt-auto border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Guardar Gasto
          </button>
        </div>
      </form>
    </div>
  );
};