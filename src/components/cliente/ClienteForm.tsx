import React, { useState } from 'react';

interface ClienteFormProps {
  onAddCliente: (apellido: string, nombre: string, telefono?: string) => void; 
  onCancel: () => void;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ onAddCliente, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

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
    onAddCliente(apellido.trim(), nombre.trim(), telefono.trim() || undefined); 
    setNombre('');
    setApellido('');
    setTelefono('');
    onCancel(); 
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col"> 
      <h3 className="font-semibold text-xl mb-6 text-gray-800 text-center">Agregar Nuevo Cliente</h3>
      <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
        <div className="flex-grow space-y-4">
            <div>
            <label htmlFor="apellidoCliente" className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
            <input
                id="apellidoCliente"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
                placeholder="Apellido"
                required
            />
            </div>
            <div>
            <label htmlFor="nombreCliente" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
                id="nombreCliente"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
                placeholder="Nombre"
                required
            />
            </div>
            <div>
            <label htmlFor="telefonoCliente" className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional - 10 dígitos)</label>
            <input
                id="telefonoCliente"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
                placeholder="Ej: 3584123456"
                maxLength={10} 
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
            Guardar Cliente
          </button>
        </div>
      </form>
    </div>
  );
};