import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortManagement from './PortManagement'; 


const API_URL = 'http://localhost:8080/admin/agents-inscrits';

function AgentTable({ agents, onAccept, onReject }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white text-black rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Nom</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Société</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
        {agents.map(agent => (
  <tr key={agent.id} className="hover:bg-gray-100">
    <td className="py-2 px-4 border-b">{agent.id}</td>
    <td className="py-2 px-4 border-b">{agent.fullName}</td>
    <td className="py-2 px-4 border-b">{agent.email}</td>
    <td className="py-2 px-4 border-b">{agent.raisonSociale}</td>
    <td className="py-2 px-4 border-b flex gap-2">
      <button
        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        onClick={() => onAccept(agent.id)}
      >
        Accepter
      </button>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        onClick={() => onReject(agent.id)}
      >
        Rejeter
      </button>
    </td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [menu, setMenu] = useState('dashboard');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    if (menu === 'agents') {
      setLoading(true);
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          setAgents(data);
          setLoading(false);
        });
    }
  }, [menu]);


  const handleAccept = (id) => {
    fetch(`${API_URL}/${id}/accepter`, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          setAgents(agents.filter(agent => agent.id !== id));
        }
      });
  };


  const handleReject = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          setAgents(agents.filter(agent => agent.id !== id));
        }
      });
  };


  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <aside className="w-64 bg-[#0071bc] text-white flex flex-col py-8 px-4 shadow-lg justify-between">
        <div>
          <div className="mb-8 flex items-center space-x-3">
            <img src="/logo-anp.jpeg" alt="Logo ANP" className="h-10" />
            <span className="text-xl font-bold">Admin</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'dashboard' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'agents' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('agents')}
            >
              Agent inscrit
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'port' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('port')}
            >
              Port
            </button>
          </nav>
        </div>
        <button
          className="mt-8 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </aside>

      
      <main className="flex-1 p-10">
        {menu === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-[#0071bc] mb-4">Bienvenue sur le Dashboard Admin</h1>
            <p className="text-lg">Utilisez le menu à gauche pour naviguer.</p>
          </div>
        )}
        {menu === 'agents' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-4">Liste des agents inscrits</h2>
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <AgentTable agents={agents} onAccept={handleAccept} onReject={handleReject} />
            )}
          </div>
        )}
        {menu === 'port' && (
          <PortManagement />
        )}
      </main>
    </div>
  );
}