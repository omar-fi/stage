import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TaxateurPage() {
  const [menu, setMenu] = useState('dashboard');
  const [manifestsEnAttente, setManifestsEnAttente] = useState([]);
  const [manifestsTraites, setManifestsTraites] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [showTraitementModal, setShowTraitementModal] = useState(false);
  const [traitementData, setTraitementData] = useState({
    manifestId: null,
    commentaires: '',
    lignes: []
  });
  
  const navigate = useNavigate();
  const taxateurId = 1;

  useEffect(() => {
    if (menu === 'manifest') {
      chargerManifests();
    } else if (menu === 'facture') {
      chargerFactures();
    }
  }, [menu]);

  const chargerManifests = async () => {
    setLoading(true);
    setError(null);
    try {
      const responseEnAttente = await fetch('http://localhost:8080/api/taxateur/manifests/en-attente');
      if (!responseEnAttente.ok) {
        throw new Error(`Erreur HTTP: ${responseEnAttente.status}`);
      }
      const dataEnAttente = await responseEnAttente.json();
      setManifestsEnAttente(dataEnAttente || []);

      const responseTraites = await fetch(`http://localhost:8080/api/taxateur/manifests/traites?taxateurId=${taxateurId}`);
      if (!responseTraites.ok) {
        throw new Error(`Erreur HTTP: ${responseTraites.status}`);
      }
      const dataTraites = await responseTraites.json();
      setManifestsTraites(dataTraites || []);

      setDebugInfo({
        manifestsEnAttente: dataEnAttente?.length || 0,
        manifestsTraites: dataTraites?.length || 0,
        lastUpdate: new Date().toLocaleTimeString()
      });

    } catch (error) {
      console.error('Erreur lors du chargement des manifests:', error);
      setError(error.message);
      setManifestsEnAttente([]);
      setManifestsTraites([]);
    } finally {
      setLoading(false);
    }
  };

  const chargerFactures = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/factures');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setFactures(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      setError(error.message);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModalTraitement = (manifest) => {
    setSelectedManifest(manifest);
    setTraitementData({
      manifestId: manifest.id,
      commentaires: '',
      lignes: manifest.manifestLines?.map(line => ({
        manifestLineId: line.id,
        tarifUnitaire: 0,
        unite: 'KG',
        commentaire: ''
      })) || []
    });
    setShowTraitementModal(true);
  };

  const traiterManifest = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/taxateur/manifests/traiter?taxateurId=${taxateurId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traitementData),
      });

      if (response.ok) {
        alert('Manifest traité avec succès !');
        setShowTraitementModal(false);
        chargerManifests();
      } else {
        const errorData = await response.text();
        alert(`Erreur lors du traitement du manifest: ${errorData}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur lors du traitement du manifest: ${error.message}`);
    }
  };

  const telechargerFacture = async (factureId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/factures/${factureId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${factureId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  const testAPI = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:8080/api/manifest/all');
      const data = await response.json();
      alert(`Test API réussi! Total manifests: ${data.length}`);
    } catch (error) {
      setError(`Test API échoué: ${error.message}`);
    }
  };

  const renderManifestsEnAttente = () => {
    if (loading) {
      return <div className="text-center py-4">Chargement...</div>;
    }
    
    if (error) {
      return (
        <div className="text-center py-4">
          <div className="text-red-600 mb-2">Erreur: {error}</div>
          <button 
            onClick={chargerManifests}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      );
    }
    
    if (!manifestsEnAttente || manifestsEnAttente.length === 0) {
      return <p className="text-gray-500 text-center py-4">Aucun manifest en attente</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date dépôt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trafic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé par</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {manifestsEnAttente.map((manifest) => (
              <tr key={manifest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{manifest.id}</td>
             
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {formatDate(manifest.dateDepot)} {/* au lieu de manifest.dateDepotManifest */}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {manifest.port} {/* au lieu de manifest.port?.nom */}
</td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manifest.trafic || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manifest.createdBy || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => ouvrirModalTraitement(manifest)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Traiter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderManifestsTraites = () => {
    if (loading) {
      return <div className="text-center py-4">Chargement...</div>;
    }
    
    if (!manifestsTraites || manifestsTraites.length === 0) {
      return <p className="text-gray-500 text-center py-4">Aucun manifest traité</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date traitement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaires</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {manifestsTraites.map((manifest) => (
              <tr key={manifest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{manifest.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(manifest.dateTraitement)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manifest.montantTotal?.toLocaleString()} DH</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manifest.commentairesTraitement || 'Aucun'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0071bc] text-white flex flex-col py-8 px-4 shadow-lg justify-between z-50">
        <div>
          <div className="mb-8 flex items-center space-x-3">
            <img src="/logo-anp.jpeg" alt="Logo ANP" className="h-10" />
            <span className="text-xl font-bold">Taxateur</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'dashboard' ? 'bg-[#005fa3]' : ''}`} onClick={() => setMenu('dashboard')}>Dashboard</button>
            <button className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'manifest' ? 'bg-[#005fa3]' : ''}`} onClick={() => setMenu('manifest')}>Manifest</button>
            <button className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'facture' ? 'bg-[#005fa3]' : ''}`} onClick={() => setMenu('facture')}>Facture</button>
            <button className={`text-left px-4 py-2 rounded hover:bg-[#005fa3] ${menu === 'profil' ? 'bg-[#005fa3]' : ''}`} onClick={() => setMenu('profil')}>Profil</button>
          </nav>
        </div>
        <button className="mt-8 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onClick={handleLogout}>Déconnexion</button>
      </aside>

      <main className="ml-64 p-10">
        
        {menu === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-[#0071bc] mb-6">Bienvenue sur le Dashboard Taxateur</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m0 0l3-3m-3 3l-3-3" /></svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">{manifestsEnAttente.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Validées</p>
                    <p className="text-2xl font-bold text-gray-900">{manifestsTraites.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Montant validé</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {manifestsTraites.reduce((total, m) => total + (m.montantTotal || 0), 0).toLocaleString()} DH
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M8 9h8l1 10H7L8 9z" /></svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Factures générées</p>
                    <p className="text-2xl font-bold text-gray-900">{factures.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {menu === 'manifest' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Gestion des Manifests</h2>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Manifests en attente de traitement ({manifestsEnAttente.length})
              </h3>
              {renderManifestsEnAttente()}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Manifests traités ({manifestsTraites.length})
              </h3>
              {renderManifestsTraites()}
            </div>
          </div>
        )}

        {menu === 'facture' && (
          <div>
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Gestion des Factures</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-center py-4">Chargement...</div>
              ) : factures.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune facture générée</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Facture</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date émission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {factures.map((facture) => (
                        <tr key={facture.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{facture.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(facture.dateEmissionFact)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {facture.escale?.port?.nom || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => telechargerFacture(facture.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Télécharger PDF
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

       {menu === 'profil' && (
  <div>
    <h2 className="text-2xl font-bold text-[#0071bc] mb-6">�� Profil Taxateur</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">�� Modifier le mot de passe</h3>
        
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
            �� Modifier le mot de passe
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

      {showTraitementModal && selectedManifest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traiter le manifest #{selectedManifest.id}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
                <textarea
                  value={traitementData.commentaires}
                  onChange={(e) => setTraitementData({...traitementData, commentaires: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Commentaires sur le traitement..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lignes de marchandises</label>
                <div className="space-y-3">
                  {traitementData.lignes.map((ligne, index) => (
                    <div key={index} className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Tarif unitaire (DH/KG)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={ligne.tarifUnitaire}
                          onChange={(e) => {
                            const newLignes = [...traitementData.lignes];
                            newLignes[index].tarifUnitaire = parseFloat(e.target.value) || 0;
                            setTraitementData({...traitementData, lignes: newLignes});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Unité</label>
                        <input
                          type="text"
                          value={ligne.unite}
                          onChange={(e) => {
                            const newLignes = [...traitementData.lignes];
                            newLignes[index].unite = e.target.value;
                            setTraitementData({...traitementData, lignes: newLignes});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                        <input
                          type="text"
                          value={ligne.commentaire}
                          onChange={(e) => {
                            const newLignes = [...traitementData.lignes];
                            newLignes[index].commentaire = e.target.value;
                            setTraitementData({...traitementData, lignes: newLignes});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTraitementModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={traiterManifest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Traiter et générer la facture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}