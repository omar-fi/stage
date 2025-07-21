

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import HomePage from './pages/HomePage/HomePage.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import AdminPage from './pages/AdminPage/AdminPage.jsx';
import TaxateurPage from './pages/TaxateurPage/TaxateurPage.jsx';
import Agent from './pages/Agent/Agent.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/taxateur" element={<TaxateurPage />} />
        <Route path="/agent" element={<Agent />} />        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
