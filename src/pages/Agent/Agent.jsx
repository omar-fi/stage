import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentPage() {
  const [menu, setMenu] = useState('dashboard');
  const [stats, setStats] = useState({
    facturesEnCours: 0,
    facturesPayees: 0,
    montantTotal: 0,
    facturesEnRetard: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [manifests, setManifests] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();
  const agentId = 1; // À remplacer par l'ID de l'agent connecté

  useEffect(() => {
    if (menu === 'dashboard') {
      chargerStats();
    } else if (menu === 'manifest') {
      chargerManifests();
    } else if (menu === 'factures') {
      chargerFactures();
    }
  }, [menu]);

  const chargerStats = async () => {
    try {
      // Charger les manifests pour calculer les stats
      const manifestsResponse = await fetch(`http://localhost:8080/api/agent/manifests/${agentId}`);
      if (manifestsResponse.ok) {
        const manifestsData = await manifestsResponse.json();
        
        // Charger les factures pour les stats
        const facturesResponse = await fetch(`http://localhost:8080/api/agent/factures/${agentId}`);
        if (facturesResponse.ok) {
          const facturesData = await facturesResponse.json();
          
          // Calculer les statistiques
          const manifestsEnAttente = manifestsData.filter(m => m.statut === 'EN_ATTENTE').length;
          const manifestsTraites = manifestsData.filter(m => m.statut === 'TRAITE').length;
          const montantTotal = facturesData.reduce((total, f) => {
            const montant = f.details?.reduce((sum, d) => sum + (d.montantTTC || 0), 0) || 0;
            return total + montant;
          }, 0);

          setStats({
            facturesEnCours: manifestsEnAttente,
            facturesPayees: manifestsTraites,
            montantTotal: montantTotal,
            facturesEnRetard: 0
          });

          // Mettre à jour l'activité récente
          const recentManifests = manifestsData.slice(0, 4).map(m => ({
            id: m.id,
            type: 'Manifest uploadé',
            description: `Manifest #${m.id} pour ${m.port?.nom || 'Port'}`,
            date: m.dateDepotManifest,
            status: m.statut === 'EN_ATTENTE' ? 'En attente' : m.statut === 'TRAITE' ? 'Traité' : m.statut
          }));

          setRecentActivity(recentManifests);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const chargerManifests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/manifest`);
      if (response.ok) {
        const data = await response.json();
        setManifests(data);
        console.log('Manifests chargés:', data);
      } else {
        console.error('Erreur lors du chargement des manifests');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setLoading(false);
    }
  };

  const chargerFactures = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/agent/factures/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setFactures(data);
        console.log('Factures chargées:', data);
      } else {
        console.error('Erreur lors du chargement des factures');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadManifest = async (file) => {
    if (!file) return;

    setUploadStatus('Upload en cours...');
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agentId', agentId);

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('http://localhost:8080/api/manifest/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        setUploadStatus('✅ Manifest uploadé avec succès ! Il sera traité par un taxateur.');
        // Recharger la liste des manifests
        setTimeout(() => {
          chargerManifests();
          chargerStats();
          setUploadStatus('');
          setUploadProgress(0);
        }, 3000);
      } else {
        const errorText = await response.text();
        setUploadStatus('❌ Erreur lors de l\'upload: ' + errorText);
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Erreur réseau:', error);
      setUploadStatus('❌ Erreur réseau lors de l\'upload');
      setUploadProgress(0);
    }
  };

  const telechargerFacture = async (factureId) => {
    try {
      setUploadStatus('Téléchargement de la facture...');
      const response = await fetch(`http://localhost:8080/api/factures/${factureId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${factureId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setUploadStatus('✅ Facture téléchargée avec succès !');
        setTimeout(() => setUploadStatus(''), 2000);
      } else {
        setUploadStatus('❌ Erreur lors du téléchargement de la facture');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setUploadStatus('❌ Erreur lors du téléchargement de la facture');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'newInvoice':
        setMenu('manifest');
        break;
      case 'viewInvoices':
        setMenu('factures');
        break;
      case 'reports':
        setMenu('rapports');
        break;
      case 'profile':
        setMenu('profil');
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TRAITE': return 'bg-green-100 text-green-800 border-green-200';
      case 'ANNULE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return '⏳ En attente';
      case 'EN_COURS': return '🔄 En cours';
      case 'TRAITE': return '✅ Traité';
      case 'ANNULE': return '❌ Annulé';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return '⏳';
      case 'EN_COURS': return '🔄';
      case 'TRAITE': return '✅';
      case 'ANNULE': return '❌';
      default: return '📋';
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
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] transition-colors ${menu === 'dashboard' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] transition-colors ${menu === 'factures' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('factures')}
            >
              📄 Factures
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] transition-colors ${menu === 'manifest' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('manifest')}
            >
              📦 Manifest
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] transition-colors ${menu === 'rapports' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('rapports')}
            >
              📈 Rapports
            </button>
            <button
              className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] transition-colors ${menu === 'profil' ? 'bg-[#005fa3]' : ''}`}
              onClick={() => setMenu('profil')}
            >
                 Profil
            </button>
          </nav>
        </div>
        <button
          className="mt-8 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          onClick={handleLogout}
        >
          🚪 Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-10">
        {menu === 'dashboard' && (
          <div>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bonjour, Agent Portuaire !   </h2>
              <p className="text-gray-600">Voici un aperçu de vos activités aujourd'hui</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg">📋</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Manifests en attente</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.facturesEnCours}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Manifests traités</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.facturesPayees}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Montant total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.montantTotal.toLocaleString()} DH</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-lg">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total factures</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.facturesEnCours + stats.facturesPayees}</p>
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
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hover:border-blue-300"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-xl">📦</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Nouveau manifest</p>
                      <p className="text-sm text-gray-500">Uploader un manifest</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('viewInvoices')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hover:border-green-300"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-xl">📄</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Voir factures</p>
                      <p className="text-sm text-gray-500">Consulter les factures</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('reports')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hover:border-purple-300"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-xl">📈</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Rapports</p>
                      <p className="text-sm text-gray-500">Générer des rapports</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('profile')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hover:border-orange-300"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-orange-600 text-xl">👤</span>
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
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📋</span>
                    <p className="text-gray-500">Aucune activité récente</p>
                    <p className="text-sm text-gray-400">Uploadez votre premier manifest !</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'Traité' ? 'bg-green-500' :
                          activity.status === 'En attente' ? 'bg-yellow-500' :
                          activity.status === 'En cours' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'Traité' ? 'bg-green-100 text-green-800' :
                          activity.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des manifests</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">📊</span>
                    <p className="text-gray-500">Graphique des statistiques</p>
                    <p className="text-sm text-gray-400">En cours de développement</p>
                  </div>
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

        {menu === 'factures' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">📄 Gestion des Factures</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Liste des factures</h3>
                <button 
                  onClick={() => setMenu('manifest')}
                  className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3] transition-colors"
                >
                  📦 Nouveau manifest
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071bc] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement des factures...</p>
                </div>
              ) : factures.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">📄</span>
                  <p className="text-gray-500 text-lg mb-2">Aucune facture trouvée</p>
                  <p className="text-gray-400">Les factures apparaîtront ici une fois vos manifests traités par un taxateur</p>
                  <button 
                    onClick={() => setMenu('manifest')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    📦 Uploader un manifest
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white text-black rounded shadow">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 border-b text-left font-semibold">N° Facture</th>
                        <th className="py-3 px-4 border-b text-left font-semibold">Date émission</th>
                        <th className="py-3 px-4 border-b text-left font-semibold">Port</th>
                        <th className="py-3 px-4 border-b text-left font-semibold">Montant</th>
                        <th className="py-3 px-4 border-b text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {factures.map((facture) => (
                        <tr key={facture.id} className="hover:bg-gray-50 border-b transition-colors">
                          <td className="py-3 px-4 font-medium">#{facture.id}</td>
                          <td className="py-3 px-4">{formatDate(facture.dateEmissionFact)}</td>
                          <td className="py-3 px-4">
                            {facture.escale?.port?.nom || 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {facture.details?.reduce((total, detail) => total + (detail.montantTTC || 0), 0).toLocaleString()} DH
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => telechargerFacture(facture.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm mr-2 transition-colors"
                            >
                              📥 Télécharger
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                              👁️ Voir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {menu === 'manifest' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">📦 Gestion des Manifests</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Upload Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploader un manifest</h3>
                
                {uploadStatus && (
                  <div className={`mb-4 p-4 rounded-lg border ${
                    uploadStatus.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 
                    uploadStatus.includes('❌') ? 'bg-red-50 border-red-200 text-red-800' :
                    'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <div className="flex items-center">
                      <span className="mr-2">{uploadStatus.includes('✅') ? '✅' : uploadStatus.includes('❌') ? '❌' : '⏳'}</span>
                      {uploadStatus}
                    </div>
                  </div>
                )}
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Progression: {uploadProgress}%</p>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <div className="flex flex-col items-center">
                    <span className="text-6xl mb-4">📁</span>
                    <p className="text-sm text-gray-600 mb-2">Glissez-déposez votre fichier XML ici</p>
                    <p className="text-xs text-gray-500 mb-4">ou cliquez pour sélectionner</p>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors font-medium">
                      <input 
                        type="file" 
                        accept=".xml" 
                        className="hidden" 
                        onChange={(e) => handleUploadManifest(e.target.files[0])}
                      />
                      📤 Uploader Manifest XML
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Formats acceptés: .xml</p>
                  </div>
                </div>
              </div>

              {/* Manifests List */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Mes manifests</h3>
                  <button 
                    onClick={chargerManifests}
                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  >
                    🔄 Actualiser
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071bc] mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement...</p>
                  </div>
                ) : manifests.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📋</span>
                    <p className="text-gray-500 mb-2">Aucun manifest uploadé</p>
                    <p className="text-sm text-gray-400">Commencez par uploader votre premier manifest !</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {manifests.map((manifest) => (
                      <div key={manifest.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <span className="mr-2">{getStatusIcon(manifest.statut)}</span>
                            Manifest #{manifest.id}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(manifest.statut)}`}>
                            {getStatusText(manifest.statut)}
                          </span>
                        </div>
                     <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {manifests.map((manifest) => (
        <div
          key={manifest.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <p>📋 Manifest #{manifest.id}</p>
          <p>
             Date de dépôt:{" "}
            {manifest.dateDepot
              ? new Date(manifest.dateDepot).toLocaleString()
              : "N/A"}
          </p>
          <p> Port: {manifest.port || "N/A"}</p>
          <p> Trafic: {manifest.trafic || "N/A"}</p>
          <p> Navire: {manifest.navire || "N/A"}</p>
        </div>
      ))}
    </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {menu === 'rapports' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">📈 Rapports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport mensuel</h3>
                <p className="text-gray-600 mb-4">Générer un rapport des activités du mois</p>
                <button className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3] w-full transition-colors">
                  📋 Générer
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <span className="text-4xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport de facturation</h3>
                <p className="text-gray-600 mb-4">Rapport détaillé des factures</p>
                <button className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3] w-full transition-colors">
                  📄 Générer
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <span className="text-4xl">📦</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport de manifest</h3>
                <p className="text-gray-600 mb-4">Statistiques des manifests traités</p>
                <button className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3] w-full transition-colors">
                  📊 Générer
                </button>
              </div>
            </div>
          </div>
        )}
         
       {menu === 'profil' && (
  <div>
    <h2 className="text-2xl font-bold text-[#0071bc] mb-6">   Profil Agent</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">   Modifier le mot de passe</h3>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 6 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0071bc] text-white px-6 py-3 rounded-lg hover:bg-[#005fa3] transition-colors font-medium"
          >
               Modifier le mot de passe
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Conseils de sécurité</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Utilisez au moins 8 caractères</li>
            <li>• Incluez des lettres majuscules et minuscules</li>
            <li>• Ajoutez des chiffres et des symboles</li>
            <li>• Évitez les informations personnelles</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}