import React from 'react';
import type { Cliente } from '../../services/clienteService';
import { Pencil, Trash2, MessageSquare } from 'lucide-react'; 

interface ClienteItemProps {
  cliente: Cliente;
  deuda: number;
  isSelected: boolean;
  onSelectCliente: (cliente: Cliente) => void;
  onEditCliente: (cliente: Cliente) => void;
  onDeleteCliente: (cliente: Cliente) => void;
  onSendMessage: (cliente: Cliente) => void; // Added
}

export const ClienteItem: React.FC<ClienteItemProps> = ({ 
  cliente, 
  deuda, 
  isSelected, 
  onSelectCliente, 
  onEditCliente, 
  onDeleteCliente,
  onSendMessage // Added
}) => {
  return (
    <div
      className={`p-3 border rounded-md cursor-pointer transition-all duration-150 ease-in-out hover:shadow-md flex justify-between items-center ${
        isSelected ? 'bg-red-50 border-red-400 ring-2 ring-red-400' : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onSelectCliente(cliente)}
      onKeyPress={(e) => e.key === 'Enter' && onSelectCliente(cliente)}
      role="button"
      tabIndex={0}
    >
      <div>
        <div className="font-medium text-gray-800">{cliente.apellido}, {cliente.nombre}</div>
        {cliente.telefono && <div className="text-sm text-gray-600">{cliente.telefono}</div>}
        <div className={`text-sm font-semibold mt-1 ${deuda > 0 ? 'text-red-600' : 'text-green-600'}`}>
          Deuda: ${deuda.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      <div className="flex space-x-1 sm:space-x-2"> 
        {cliente.telefono && ( // Conditionally render WhatsApp button
            <button
            onClick={(e) => { e.stopPropagation(); onSendMessage(cliente); }}
            className="p-1.5 text-green-600 hover:text-green-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Enviar Mensaje WhatsApp"
            >
            <MessageSquare size={18} />
            </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEditCliente(cliente); }}
          className="p-1.5 text-blue-600 hover:text-blue-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Editar Cliente"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteCliente(cliente); }}
          className="p-1.5 text-red-600 hover:text-red-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Eliminar Cliente"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};