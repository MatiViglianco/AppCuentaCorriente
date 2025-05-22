# AppCuentaCorriente - Sistema de Gestión de Cuentas Corrientes

Aplicación web simple para la gestión de cuentas corrientes de clientes, permitiendo registrar clientes, transacciones (gastos/compras), y llevar un control de los saldos pendientes. La aplicación utiliza el `localStorage` del navegador para persistir los datos.

## Funcionalidades Principales

* **Gestión de Clientes:**
    * Crear nuevos clientes (Apellido, Nombre, Teléfono opcional).
    * Editar la información de clientes existentes.
    * Eliminar clientes (esto también eliminará sus transacciones asociadas).
    * Listar y buscar clientes.
    * Ordenar clientes por Apellido/Nombre o por Deuda.
    * Paginación para la lista de clientes (15 clientes por página).
    * Enviar mensaje de recordatorio de deuda por WhatsApp a clientes con teléfono registrado.
* **Gestión de Transacciones:**
    * Registrar nuevas transacciones (gastos/compras) para un cliente seleccionado (Monto, Descripción opcional, Fecha).
    * Visualizar transacciones agrupadas por mes.
    * Registrar pagos parciales o totales para las transacciones.
    * Filtrar transacciones por estado: Todos, Activo, Parcialmente Pagado, Vencido, Pagado.
    * Paginación para la lista de transacciones (15 transacciones por página).
    * Las transacciones se marcan como "Vencidas" automáticamente si su fecha es anterior al mes actual y no están completamente pagadas.
* **Interfaz de Usuario:**
    * Diseño responsivo.
    * Modales para la creación y edición de clientes, y para el registro de transacciones y pagos.
    * Modales de confirmación para acciones destructivas (eliminar cliente).
    * Fondo con gradiente radial y patrón de puntos.

## Tecnologías y Librerías Utilizadas

* **React:** Biblioteca principal para la construcción de la interfaz de usuario.
* **Vite:** Herramienta de frontend para un desarrollo y build rápidos.
* **TypeScript:** Superset de JavaScript para tipado estático.
* **Tailwind CSS:** Framework CSS utility-first para el diseño de la interfaz.
* **Lucide React:** Biblioteca de íconos SVG.
* **LocalStorage:** Para el almacenamiento de datos en el navegador del cliente.

## Despliegue y Uso

Esta aplicación está diseñada para ejecutarse localmente en el navegador y utiliza `localStorage` para guardar los datos. No requiere un backend complejo para su funcionamiento básico.

### Prerrequisitos

* Node.js (que incluye npm o yarn) instalado en tu sistema.
* Git (opcional, si clonas el repositorio).

### Pasos para Ejecutar Localmente

1.  **Clonar el Repositorio (si aplica):**
    ```bash
    git clone [https://github.com/TU_USUARIO/AppCuentaCorriente.git](https://github.com/TU_USUARIO/AppCuentaCorriente.git)
    cd AppCuentaCorriente
    ```
    O si ya tienes los archivos, navega a la carpeta raíz del proyecto (`carnicuenta-vite-project`).

2.  **Instalar Dependencias:**
    Abre una terminal en la carpeta raíz del proyecto y ejecuta:
    ```bash
    npm install
    ```
    o si usas yarn:
    ```bash
    yarn install
    ```

3.  **Iniciar el Servidor de Desarrollo:**
    Una vez instaladas las dependencias, puedes iniciar la aplicación en modo de desarrollo:
    ```bash
    npm run dev
    ```
    o con yarn:
    ```bash
    yarn dev
    ```
    Esto generalmente abrirá la aplicación en tu navegador en una dirección como `http://localhost:5173` (el puerto puede variar).

### Build para Producción (Opcional)

Si deseas generar una versión optimizada para producción (archivos estáticos que puedes desplegar en cualquier servidor web o servicio de hosting de sitios estáticos):

1.  **Ejecutar el Comando de Build:**
    ```bash
    npm run build
    ```
    o con yarn:
    ```bash
    yarn build
    ```
2.  Los archivos generados se encontrarán en la carpeta `dist`. Puedes subir el contenido de esta carpeta a tu servicio de hosting preferido (ej. Netlify, Vercel, GitHub Pages, Firebase Hosting, etc.).

## Estructura del Proyecto (Simplificada)

```
/
├── public/               # Archivos estáticos públicos
├── src/
│   ├── api/              # (No usado actualmente, para futuras integraciones)
│   ├── assets/           # Recursos como imágenes (si los hubiera)
│   ├── components/       # Componentes reutilizables de la UI
│   │   ├── cliente/      # Componentes específicos para clientes
│   │   ├── layout/       # Componentes de estructura (Header, Footer)
│   │   ├── transaccion/  # Componentes específicos para transacciones
│   │   └── ui/           # Componentes genéricos de UI (Modales, Paginación)
│   ├── hooks/            # Hooks personalizados (useClientes, useTransacciones)
│   ├── pages/            # Componentes de página principal (GestorCuentasPage)
│   ├── services/         # Lógica de interacción con localStorage (clienteService, transaccionService)
│   ├── styles/           # Archivos CSS globales (index.css con directivas de Tailwind)
│   ├── App.tsx           # Componente raíz de la aplicación
│   └── main.tsx          # Punto de entrada de la aplicación React
├── .gitignore            # Archivos y carpetas ignorados por Git
├── index.html            # HTML principal
├── package.json          # Dependencias y scripts del proyecto
├── tailwind.config.js    # Configuración de Tailwind CSS
├── tsconfig.json         # Configuración de TypeScript
└── README.md             # Este archivo
```

## Posibles Mejoras Futuras

* Integración con un backend real para persistencia de datos más robusta y multiusuario.
* Autenticación de usuarios.
* Mejoras en la interfaz de usuario y experiencia de usuario.
* Generación de reportes o exportación de datos.
* Notificaciones más avanzadas.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores o envía un Pull Request.

---

Creado para la gestión de cuentas corrientes.
