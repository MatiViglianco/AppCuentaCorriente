import React from 'react';
import type { Cliente } from '../../services/clienteService';
import type { Transaccion } from '../../services/transaccionService';
import { ClienteItem } from './ClienteItem';

interface ClienteListProps {
  clientes: Cliente[]; 
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente) => void;
  calculateDeuda: (clienteId: string, transacciones: Transaccion[]) => number;
  allTransacciones: Transaccion[]; 
  onEditCliente: (cliente: Cliente) => void;
  onDeleteCliente: (cliente: Cliente) => void;
  onSendMessage: (cliente: Cliente) => void; // Added
}

export const ClienteList: React.FC<ClienteListProps> = ({
  clientes,
  selectedCliente,
  onSelectCliente,
  calculateDeuda,
  allTransacciones,
  onEditCliente,
  onDeleteCliente,
  onSendMessage // Added
}) => {
  if (clientes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No hay clientes para mostrar en esta página.
      </p>
    );
  }

  return (
    <div className="space-y-2"> 
      {clientes.map(cliente => (
        <ClienteItem
          key={cliente.id}
          cliente={cliente}
          deuda={calculateDeuda(cliente.id, allTransacciones)}
          isSelected={selectedCliente?.id === cliente.id}
          onSelectCliente={onSelectCliente}
          onEditCliente={onEditCliente}
          onDeleteCliente={onDeleteCliente}
          onSendMessage={onSendMessage} // Passed down
        />
      ))}
    </div>
  );
};