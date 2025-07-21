import React, { useState } from 'react';
import './AuthPage.css';
import Swal from 'sweetalert2';

import { Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [raisonSociale, setRaisonSociale] = useState('');
  const [ice, setICE] = useState('');
  const [portDemande, setPortDemande] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
      return;
    }

    setError('');

    const payload = {
      email,
      raisonSociale,
      ice,
      portDemande,
      password 
    };

    try {
      const response = await fetch('http://localhost:8080/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

      if (response.ok) {
        Swal.fire({
        title: "Succès",
        text: "Inscription réussie !",
        icon: "success",
        draggable: true
    });
        
      } else {
        Swal.fire({
  title: "Erreur",
  text: "Une erreur s'est produite lors de l'inscription.",
  icon: "question"
});
      }
    } catch (err) {
      setError("Erreur réseau ou serveur !");
    }
  };

  const Rule = ({ condition, text }) => (
    <p className={`flex justify-between items-center px-2 py-1 rounded ${condition ? 'text-green-400' : 'text-gray-300'}`}>
      <span>{text}</span>
      {condition && <span className="text-green-400 text-lg">✅</span>}
    </p>
  );

  return (
    <div className="auth-background min-h-screen flex items-center justify-center text-white">
      <div className="auth-overlay p-8 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/logo-anp.jpeg" alt="Logo ANP" className="h-16" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-6 text-[#0071bc]">Inscription</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label>Email professionnel</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded bg-white text-black" required />
          </div>
          <div>
            <label>Raison sociale</label>
            <input type="text" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} className="w-full px-4 py-2 rounded bg-white text-black" required />
          </div>
          <div>
  <label>ICE</label>
  <input
    type="text"
    value={ice}
    onChange={(e) => {
      const value = e.target.value;
      // Garde uniquement les chiffres
      const numericValue = value.replace(/\D/g, '');
      // Limite à 15 chiffres
      if (numericValue.length <= 15) {
        setICE(numericValue);
      }
    }}
    className="w-full px-4 py-2 rounded bg-white text-black"
    required
    inputMode="numeric"
    pattern="\d*"
    placeholder="Ex : 123456789012345"
  />
</div>

          <div>
            <label>Port demandé</label>
            <input type="text" value={portDemande} onChange={(e) => setPortDemande(e.target.value)} className="w-full px-4 py-2 rounded bg-white text-black" required />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowRules(true)}
              onBlur={() => { if (!password) setShowRules(false); }}
              className="w-full px-4 py-2 rounded bg-white text-black"
              required
            />
            {showRules && (
              <div className="text-sm mt-2 space-y-1 bg-white bg-opacity-10 p-3 rounded">
                <Rule condition={password.length >= 8} text="8 caractères minimum" />
                <Rule condition={/[A-Z]/.test(password)} text="Une majuscule" />
                <Rule condition={/[a-z]/.test(password)} text="Une minuscule" />
                <Rule condition={/\d/.test(password)} text="Un chiffre" />
                <Rule condition={/[^A-Za-z\d]/.test(password)} text="Un caractère spécial" />
              </div>
            )}
            {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
          </div>
          <button type="submit" className="w-full bg-[#0071bc] hover:bg-blue-700 py-2 rounded text-white font-semibold">
            S'inscrire
          </button>
        </form>
        <p className="text-center mt-4">
          Déjà inscrit ? <Link to="/login" className="text-[#0071bc] underline">Connexion</Link>
        </p>
      </div>
    </div>
  );
}
