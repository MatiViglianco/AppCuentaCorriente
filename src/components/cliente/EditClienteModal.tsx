import React, { useState, useEffect } from 'react';
import type { Cliente } from '../../services/clienteService';

interface EditClienteModalProps {
  isOpen: boolean;
  cliente: Cliente | null;
  onSave: (updatedData: Omit<Cliente, 'id' | 'fechaCreacion'>) => void;
  onCancel: () => void;
}

export const EditClienteModal: React.FC<EditClienteModalProps> = ({ isOpen, cliente, onSave, onCancel }) => {
  const [apellido, setApellido] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    if (cliente) {
      setApellido(cliente.apellido);
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono || '');
    }
  }, [cliente]);

  if (!isOpen || !cliente) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      alert('Apellido y nombre son obligatorios.');
      return;
    }
    if (telefono.trim() && telefono.trim().length !== 10) {
      alert('El teléfono debe tener 10 dígitos o dejarse vacío.');
      return;
    }
    onSave({ apellido: apellido.trim(), nombre: nombre.trim(), telefono: telefono.trim() || undefined });
  };

  const originalDataP = "text-xs text-gray-500 mb-0.5";
  const inputClass = "w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Editar Cliente: {cliente.apellido}, {cliente.nombre}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editApellidoCliente" className="block text-sm font-medium text-gray-700">Apellido *</label>
            <p className={originalDataP}>Original: {cliente.apellido}</p>
            <input
              id="editApellidoCliente"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="editNombreCliente" className="block text-sm font-medium text-gray-700 mt-2">Nombre *</label>
            <p className={originalDataP}>Original: {cliente.nombre}</p>
            <input
              id="editNombreCliente"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="editTelefonoCliente" className="block text-sm font-medium text-gray-700 mt-2">Teléfono (opcional - 10 dígitos)</label>
            <p className={originalDataP}>Original: {cliente.telefono || '-'}</p>
            <input
              id="editTelefonoCliente"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={inputClass}
              maxLength={10}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};