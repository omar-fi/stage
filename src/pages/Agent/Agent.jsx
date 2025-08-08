import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentPage() {
  const [menu, setMenu] = useState('dashboard');
  const [stats, setStats] = useState({
    facturesEnCours: 12,
    facturesPayees: 45,
    montantTotal: 125000,
    facturesEnRetard: 3
  });
  
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'Facture créée', description: 'Facture #F2024-001 pour Port de Casablanca', date: '2024-01-15', status: 'En cours' },
    { id: 2, type: 'Paiement reçu', description: 'Paiement de 15,000 DH reçu', date: '2024-01-14', status: 'Payé' },
    { id: 3, type: 'Facture modifiée', description: 'Facture #F2024-002 mise à jour', date: '2024-01-13', status: 'Modifié' },
    { id: 4, type: 'Nouvelle demande', description: 'Demande de droits de port pour marchandises', date: '2024-01-12', status: 'En attente' }
  ]);

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleQuickAction = (action) => {
    // Actions rapides pour l'agent
    switch(action) {
      case 'newInvoice':
        alert('Créer une nouvelle facture');
        break;
      case 'viewInvoices':
        alert('Voir toutes les factures');
        break;
      case 'reports':
        alert('Générer des rapports');
        break;
      case 'profile':
        alert('Modifier le profil');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0071bc] text-white flex flex-col py-8 px-4 shadow-lg justify-between z-50">
        <div>
          <div className="mb-8 flex items-center space-x-3">
            <img src="/logo-anp.jpeg" alt="Logo ANP" className="h-10" />
            <span className="text-xl font-bold">Agent</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'dashboard' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'factures' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('factures')}
            >
              Factures
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'manifest' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('manifest')}
            >
              Manifest
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'rapports' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('rapports')}
            >
              Rapports
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'profil' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('profil')}
            >
              Profil
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

      {/* Main Content */}
      <main className="ml-64 p-10">
        {menu === 'dashboard' && (
          <div>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bonjour, Agent Portuaire !</h2>
              <p className="text-gray-600">Voici un aperçu de vos activités aujourd'hui</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Factures en cours</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.facturesEnCours}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Factures payées</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.facturesPayees}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Montant total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.montantTotal.toLocaleString()} DH</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">En retard</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.facturesEnRetard}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleQuickAction('newInvoice')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Nouvelle facture</p>
                      <p className="text-sm text-gray-500">Créer une facture</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('viewInvoices')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Voir factures</p>
                      <p className="text-sm text-gray-500">Consulter les factures</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('reports')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Rapports</p>
                      <p className="text-sm text-gray-500">Générer des rapports</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('profile')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Profil</p>
                      <p className="text-sm text-gray-500">Modifier le profil</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'Payé' ? 'bg-green-500' :
                        activity.status === 'En cours' ? 'bg-blue-500' :
                        activity.status === 'Modifié' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400">{activity.date}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'Payé' ? 'bg-green-100 text-green-800' :
                        activity.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                        activity.status === 'Modifié' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques mensuelles</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Graphique des statistiques</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ports les plus actifs</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Port de Casablanca</span>
                    <span className="text-sm text-gray-500">45 factures</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Port de Tanger</span>
                    <span className="text-sm text-gray-500">32 factures</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Port d'Agadir</span>
                    <span className="text-sm text-gray-500">28 factures</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {menu === 'factures' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Gestion des Factures</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Liste des factures</h3>
                <button className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3]">
                  Nouvelle facture
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-black rounded shadow">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">N° Facture</th>
                      <th className="py-2 px-4 border-b">Client</th>
                      <th className="py-2 px-4 border-b">Port</th>
                      <th className="py-2 px-4 border-b">Montant</th>
                      <th className="py-2 px-4 border-b">Statut</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">F2024-001</td>
                      <td className="py-2 px-4 border-b">Société ABC</td>
                      <td className="py-2 px-4 border-b">Casablanca</td>
                      <td className="py-2 px-4 border-b">15,000 DH</td>
                      <td className="py-2 px-4 border-b">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Payé</span>
                      </td>
                      <td className="py-2 px-4 border-b flex gap-2">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                          Voir
                        </button>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                          Modifier
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">F2024-002</td>
                      <td className="py-2 px-4 border-b">Société XYZ</td>
                      <td className="py-2 px-4 border-b">Tanger</td>
                      <td className="py-2 px-4 border-b">25,000 DH</td>
                      <td className="py-2 px-4 border-b">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">En cours</span>
                      </td>
                      <td className="py-2 px-4 border-b flex gap-2">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                          Voir
                        </button>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                          Modifier
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {menu === 'manifest' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Gestion des Manifests</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploader un manifest</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">Glissez-déposez votre fichier XML ici</p>
                    <p className="text-xs text-gray-500 mb-4">ou cliquez pour sélectionner</p>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                      <input type="file" accept=".xml" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await fetch('http://localhost:8080/api/manifest/upload', {
                              method: 'POST',
                              body: formData,
                            });
                            if (res.ok) {
                              alert('Manifest uploadé et traité avec succès !');
                            } else {
                              alert('Erreur lors de l\'upload du manifest');
                            }
                          } catch (err) {
                            alert('Erreur réseau');
                          }
                        }
                      }} />
                      Uploader Manifest XML
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {menu === 'rapports' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Rapports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport mensuel</h3>
                <p className="text-gray-600 mb-4">Générer un rapport des activités du mois</p>
                <button className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3] w-full">
                  Générer
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport de facturation</h3>
                <p className="text-gray-600 mb-4">Rapport détaillé des factures</p>
                <button className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3] w-full">
                  Générer
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport de manifest</h3>
                <p className="text-gray-600 mb-4">Statistiques des manifests traités</p>
                <button className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3] w-full">
                  Générer
                </button>
              </div>
            </div>
          </div>
        )}

        {menu === 'profil' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Profil Agent</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="Agent Portuaire" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="agent@anp.ma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="+212 5XX XX XX XX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Port assigné</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Port de Casablanca</option>
                    <option>Port de Tanger</option>
                    <option>Port d'Agadir</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button className="bg-[#0071bc] text-white px-6 py-2 rounded hover:bg-[#005fa3]">
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}