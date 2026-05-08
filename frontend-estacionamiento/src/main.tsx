import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Tu componente principal
import { ClerkProvider } from '@clerk/clerk-react'

// 1. Asegúrate de que la llave no sea undefined
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// 2. EL ORDEN IMPORTA: ReactDOM.createRoot es el que inicia el "mundo de los hooks"
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>

  </React.StrictMode>,

  
)


