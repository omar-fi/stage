import React from 'react';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-background min-h-screen bg-cover bg-center flex flex-col text-white">
      <header className="flex justify-between items-center p-6 bg-[#0071bc]/80">
        <div className="flex items-center space-x-3">
          <img src="/logo-anp.jpeg" alt="Logo ANP" className="h-10" />
          <h1 className="text-xl font-bold">Plateforme ANP</h1>
        </div>
        <div className="space-x-4">
          <a href="/login" className="bg-white text-[#0071bc] px-4 py-2 rounded font-semibold hover:bg-gray-100">
            Connexion
          </a>
          <a href="/register" className="border border-white px-4 py-2 rounded hover:bg-white hover:text-[#0071bc]">
            Inscription
          </a>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center bg-black bg-opacity-40 text-center px-4">
        <div>
          <h2 className="text-4xl font-bold mb-4">
            Simplifiez votre facturation portuaire<br />avec notre solution intuitive
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Générez, gérez et suivez vos droits de port sur les marchandises et les passagers, selon les normes de l’ANP.
          </p>
        </div>
      </main>
    </div>
  );
}
