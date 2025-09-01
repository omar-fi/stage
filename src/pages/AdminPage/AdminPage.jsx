import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortManagement from './PortManagement'; 
import TarifSpecifiqueManagement from './TarifSpecifiqueManagement';
import TarifStandardManagement from './TarifStandardManagement';
import CategoriesManagement from './CategoriesManagement';
import UserManagement from './UserManagement';


const API_URL = 'http://localhost:8080/admin/agents-inscrits';

function AgentTable({ agents, onAccept, onReject }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white text-black rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>          
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Société</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
        {agents.map(agent => (
  <tr key={agent.id} className="hover:bg-gray-100">
    <td className="py-2 px-4 border-b">{agent.id}</td>
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
  const [stats, setStats] = useState({
    agentsMaritimes: 0,
    taxateurs: 0,
    ports: 0,
    totalUtilisateurs: 0
  });
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

  // Charger les statistiques du dashboard
  useEffect(() => {
    if (menu === 'dashboard') {
      // Simuler le chargement des statistiques depuis l'API
      // En production, vous devrez remplacer ces appels par vos vraies APIs
      Promise.all([
        fetch('http://localhost:8080/admin/agents-maritimes/count').catch(() => ({ json: () => Promise.resolve({ count: 25 }) })),
        fetch('http://localhost:8080/admin/taxateurs/count').catch(() => ({ json: () => Promise.resolve({ count: 12 }) })),
        fetch('http://localhost:8080/admin/ports/count').catch(() => ({ json: () => Promise.resolve({ count: 30 }) })),
        fetch('http://localhost:8080/admin/utilisateurs/count').catch(() => ({ json: () => Promise.resolve({ count: 67 }) }))
      ]).then(responses => {
        return Promise.all(responses.map(res => res.json()));
      }).then(data => {
        setStats({
          agentsMaritimes: data[0]?.count || 25,
          taxateurs: data[1]?.count || 12,
          ports: data[2]?.count || 30,
          totalUtilisateurs: data[3]?.count || 67
        });
      }).catch(() => {
        // En cas d'erreur, utiliser des données par défaut
        setStats({
          agentsMaritimes: 25,
          taxateurs: 12,
          ports: 30,
          totalUtilisateurs: 67
        });
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
    <div className="min-h-screen bg-gray-100">
      
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0071bc] text-white flex flex-col py-8 px-4 shadow-lg justify-between z-50">
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
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'tarifSpecifique' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('tarifSpecifique')}
            >
              Tarifs spécifique
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'tarifStandard' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('tarifStandard')}
            >
              Tarifs standard
            </button>
             <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'categories' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('categories')}
            >
              Categories
            </button>
              <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'user' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('user')}
            >
              Utilisateurs
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

      
      <main className="ml-64 p-10">
        {menu === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-[#0071bc] mb-6">Bienvenue Omar!</h1>
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Agents Maritimes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.agentsMaritimes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Taxateurs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.taxateurs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.ports}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUtilisateurs}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMenu('agents')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Gérer les agents</p>
                      <p className="text-sm text-gray-500">Voir les inscriptions</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMenu('port')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Gérer les ports</p>
                      <p className="text-sm text-gray-500">Configuration</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMenu('categories')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Catégories</p>
                      <p className="text-sm text-gray-500">Gestion</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMenu('user')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Utilisateurs</p>
                      <p className="text-sm text-gray-500">Gestion</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-green-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Nouvel agent maritime inscrit</p>
                      <p className="text-sm text-gray-500">Société ABC - Port de Casablanca</p>
                      <p className="text-xs text-gray-400">Il y a 2 heures</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Nouveau
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Port ajouté</p>
                      <p className="text-sm text-gray-500">Port de Dakhla - Taux: 0.03</p>
                      <p className="text-xs text-gray-400">Il y a 4 heures</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ajouté
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-yellow-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Tarif modifié</p>
                      <p className="text-sm text-gray-500">Catégorie 1 - Port de Tanger</p>
                      <p className="text-xs text-gray-400">Il y a 6 heures</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Modifié
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des utilisateurs</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Graphique de répartition</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ports les plus actifs</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Port de Casablanca</span>
                    <span className="text-sm text-gray-500">45 agents</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Port de Tanger</span>
                    <span className="text-sm text-gray-500">32 agents</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Port d'Agadir</span>
                    <span className="text-sm text-gray-500">28 agents</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
            </div>
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
        {menu === 'tarifSpecifique' && (
          <TarifSpecifiqueManagement />
        )}
        {menu === 'tarifStandard' && (
          <TarifStandardManagement />
        )}
         {menu === 'categories' && (
          <CategoriesManagement />
        )}
        {menu === 'user' && (
          <UserManagement />
        )}
      </main>
    </div>
  );
}