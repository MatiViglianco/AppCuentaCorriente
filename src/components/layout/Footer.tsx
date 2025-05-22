import React from 'react';

interface FooterProps {
    year: number;
}
export const Footer: React.FC<FooterProps> = ({ year }) => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
      <div className="container mx-auto">
        <p>Sistema de Gestión de Cuentas Corrientes © {year}</p>
      </div>
    </footer>
  );
};