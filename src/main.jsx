import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './AuthContext'; // 👈 import this
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>   {/* 👈 wrap App in this */}
      <App />
    </AuthProvider>
  </StrictMode>
);
