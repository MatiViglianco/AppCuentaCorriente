import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/AppCuentaCorriente/', // ¡IMPORTANTE! Reemplaza AppCuentaCorriente si tu repo se llama diferente
})