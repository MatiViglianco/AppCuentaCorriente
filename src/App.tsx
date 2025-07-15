import { useState } from 'react';
import { GestorCuentasPage } from './pages/GestorCuentasPage';
import { ReportesPage } from './pages/ReportesPage';
import { useTransacciones } from './hooks/useTransacciones';
import { useClientes } from './hooks/useClientes';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

export type VistaApp = 'gestor' | 'reportes';

function App() {
  const [vistaActual, setVistaActual] = useState<VistaApp>('gestor');
  
  // Hooks centralizados en el componente principal para ser la única fuente de verdad.
  const transaccionesData = useTransacciones();
  const clientesData = useClientes();

  const handleNavigate = (vista: VistaApp) => {
    // Al navegar a reportes, forzamos la verificación de transacciones vencidas
    // para asegurar que los datos estén al día.
    if (vista === 'reportes') {
      transaccionesData.verificarTransaccionesVencidas();
    }
    setVistaActual(vista);
  };

  return (
    <div className="h-full w-full flex flex-col relative">
      <div className="fixed inset-0 -z-10 h-screen w-screen bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <Header title="Sistema de Cuentas Corrientes Carnicuenta" />
      <main className="container mx-auto p-4 flex-grow w-full z-10">
        {vistaActual === 'gestor' && (
            <GestorCuentasPage
                // Pasamos todos los datos y funciones como props
                clientesData={clientesData}
                transaccionesData={transaccionesData}
                onNavigateToReportes={() => handleNavigate('reportes')}
            />
        )}
        {vistaActual === 'reportes' && (
            <ReportesPage
                // Pasamos los arrays actualizados a la página de reportes
                allTransacciones={transaccionesData.transacciones}
                allClientes={clientesData.clientes}
                onVolver={() => handleNavigate('gestor')}
            />
        )}
      </main>
      <Footer year={new Date().getFullYear()} />
    </div>
  );
}

export default App;
