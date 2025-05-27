import { useState } from 'react'; 
import { GestorCuentasPage } from './pages/GestorCuentasPage';
import { ReportesPage } from './pages/ReportesPage'; 
import { useTransacciones } from './hooks/useTransacciones'; 
import { Header } from './components/layout/Header'; 
import { Footer } from './components/layout/Footer'; 


export type VistaApp = 'gestor' | 'reportes';

function App() {
  const [vistaActual, setVistaActual] = useState<VistaApp>('gestor');
  // const { clientes } = useClientes(); // Removed as it's not directly used by ReportesPage from App
  const { transacciones: allTransacciones } = useTransacciones(); 

  const handleNavigate = (vista: VistaApp) => {
    setVistaActual(vista);
  };

  return (
    <div className="h-full w-full flex flex-col relative"> 
      <div className="fixed inset-0 -z-10 h-screen w-screen bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <Header title="Sistema de Cuentas Corrientes Carnicuenta" />
      <main className="container mx-auto p-4 flex-grow w-full z-10">
        {vistaActual === 'gestor' && <GestorCuentasPage onNavigateToReportes={() => handleNavigate('reportes')} />}
        {vistaActual === 'reportes' && 
            <ReportesPage 
                allTransacciones={allTransacciones} 
                onVolver={() => handleNavigate('gestor')} 
            />}
      </main>
      <Footer year={new Date().getFullYear()} />
    </div>
  );
}

export default App;