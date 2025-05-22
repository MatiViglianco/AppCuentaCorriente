import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message?: string; 
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode; 
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] flex flex-col">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        {message && <p className="mb-4 text-gray-700">{message}</p>}
        
        {children && <div className="mb-4 max-h-60 overflow-y-auto">{children}</div>}
        
        <div className="flex justify-end space-x-3 mt-auto">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                title.toLowerCase().includes("eliminar") 
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white" 
                : "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};