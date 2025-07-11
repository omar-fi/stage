// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import './AuthPage.css';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log(data);

     if (data.role === "ADMIN") {
  navigate('/admin');
} else if (data.role === "AGENT") {
  navigate('/agent');
} else if (data.role === "TAXATEUR") {
  navigate('/taxateur');
} else {
  setError("Rôle inconnu ou accès refusé");
}

    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="auth-background min-h-screen flex items-center justify-center text-white">
      <div className="auth-overlay p-8 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/logo-anp.jpeg" alt="Logo ANP" className="h-16" />
        </div>

        <h2 className="text-3xl font-bold text-center mb-6 text-[#0071bc]">Connexion</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white text-black"
              required
            />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white text-black"
              required
            />
          </div>
          <button type="submit" className="w-full bg-[#0071bc] hover:bg-blue-700 py-2 rounded text-white font-semibold">
            Se connecter
          </button>
        </form>
        <p className="text-center mt-4">
          Pas encore de compte ? <Link to="/register" className="text-[#0071bc] underline">Inscription</Link>
        </p>
      </div>
    </div>
  );
}
