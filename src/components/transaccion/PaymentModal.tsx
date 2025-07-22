import React, { useState, useEffect } from 'react';
import type { Transaccion } from '../../services/transaccionService';

interface PaymentModalProps {
  isOpen: boolean;
  transaction: Transaccion | null;
  onClose: () => void;
  onConfirmPayment: (transactionId: string, amount: number, paymentDate: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, transaction, onClose, onConfirmPayment }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  // Estado para la fecha del pago, inicializado con la fecha actual
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transaction) {
      setPaymentAmount(''); 
      setPaymentDate(new Date().toISOString().split('T')[0]); // Resetea la fecha al abrir
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const remainingAmount = transaction.monto - transaction.montoPagado;

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        const numericValue = parseFloat(value);
        if (numericValue > remainingAmount) {
            setPaymentAmount(remainingAmount.toString());
        } else {
            setPaymentAmount(value);
        }
    } else if (value === '') {
        setPaymentAmount('');
    }
  };

  const handleConfirm = () => {
    const amountToPay = parseFloat(paymentAmount);
    if (isNaN(amountToPay) || amountToPay <= 0 || amountToPay > remainingAmount) {
      alert('Por favor, ingrese un monto de pago válido.');
      return;
    }
    if (!paymentDate) {
      alert('Por favor, seleccione una fecha para el pago.');
      return;
    }
    onConfirmPayment(transaction.id, amountToPay, paymentDate);
    onClose();
  };
  
  const handlePayFullRemaining = () => {
    if (!paymentDate) {
      alert('Por favor, seleccione una fecha para el pago.');
      return;
    }
    onConfirmPayment(transaction.id, remainingAmount, paymentDate);
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Registrar Pago</h3>
        
        <div className="mb-4 space-y-1 text-sm text-gray-700">
          <p><strong>Descripción:</strong> {transaction.descripcion || '-'}</p>
          <p><strong>Monto Original:</strong> ${transaction.monto.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          <p><strong>Monto Pagado:</strong> ${transaction.montoPagado.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          <p className="font-semibold"><strong>Monto Restante:</strong> ${remainingAmount.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Pagar:
            </label>
            <input
              type="number"
              id="paymentAmount"
              value={paymentAmount}
              onChange={handlePaymentInputChange}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
              placeholder={`Max: ${remainingAmount.toLocaleString('es-AR', {minimumFractionDigits: 2})}`}
              max={remainingAmount}
              step="0.01"
              min="0.01"
            />
          </div>
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del Pago:
            </label>
            <input
              type="date"
              id="paymentDate"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded shadow-sm focus:ring-red-400 focus:border-red-400 text-gray-700"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 w-full sm:w-auto"
          >
            Cancelar
          </button>
          {remainingAmount > 0 && (
            <button
                onClick={handlePayFullRemaining}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full sm:w-auto"
            >
                Pagar Totalidad Restante
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount || isNaN(parseFloat(paymentAmount))}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 w-full sm:w-auto"
          >
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  );
};
