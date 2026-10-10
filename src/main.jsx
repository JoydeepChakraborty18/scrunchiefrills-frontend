import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'; // ✅ Import Toaster
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'; // ✅ Import Cart Provider
import { PricingProvider } from './context/PricingContext'; // ✅ New Pricing Engine Context Layer
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <PricingProvider>
          {/* 🍞 Toast notifications will appear here */}
          <Toaster position="bottom-center" reverseOrder={false} />
          <App />
        </PricingProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)