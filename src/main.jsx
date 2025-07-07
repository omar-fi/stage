// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // pour Tailwind
import HomePage from './pages/HomePage/HomePage.jsx'; // Composant principal

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);
