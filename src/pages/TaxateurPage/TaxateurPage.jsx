import React, { useState, useEffect } from 'react';

import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TaxateurPage() {
  // Envoie la facture par mail à l'agent
  const envoyerFactureParMail = async (factureId, agentEmail) => {
    try {
      const response = await fetch(`http://localhost:8080/api/factures/${factureId}/envoyer?email=${encodeURIComponent(agentEmail)}`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('Facture envoyée par mail à ' + agentEmail);
      } else {
        const errorText = await response.text();
        alert('Erreur lors de l\'envoi du mail : ' + errorText);
      }
    } catch (e) {
      alert('Erreur réseau lors de l\'envoi du mail.');
    }
  };
 const [factureEnregistree, setFactureEnregistree] = useState(null);
  // Télécharge la facture affichée en PDF
  const telechargerFacturePDF = async () => {
    const factureDiv = document.getElementById('facture-preview-html');
    if (!factureDiv) return;
    // Utilise html2canvas pour capturer le HTML en image
    const canvas = await html2canvas(factureDiv, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Ajuste l'image à la largeur de la page
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('facture.pdf');
  };
const genererNumeroFacture = () => {
  // Exemple : F suivi de 6 chiffres aléatoires
  return 'F' + Math.floor(100000 + Math.random() * 900000);
};
const numeroFacture = genererNumeroFacture();
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
  const [agentsEscale, setAgentsEscale] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [showFacturePreview, setShowFacturePreview] = useState(false);
  const [factureHTML, setFactureHTML] = useState('');
console.log("selectedManifest:", selectedManifest);
console.log("selectedManifest.manifestLines:", selectedManifest?.manifestLines);
console.log("traitementData.lignes:", traitementData.lignes);

const imprimerFacture = async () => {
  if (!selectedManifest || !selectedAgentId) {
    alert("⚠️ Veuillez sélectionner un manifest et un agent.");
    return;
  }

  // 🔹 Récupérer les données depuis le backend
  const response = await fetch(`http://localhost:8080/api/factures/calcule?agentId=${selectedAgentId}&manifesteId=${selectedManifest.id}`);
  if (!response.ok) throw new Error("Erreur API calcul facture");
  const factureData = await response.json();
  

  const lignes = factureData.lignes || [];
  if (!lignes.length) {
    alert("⚠️ Aucune ligne de manifeste à facturer !");
    return;
  }

  // 🔹 Le reste du code pour générer le HTML
  let totalHT = 0;
  let totalTVA = 0;
  const tauxTVA = 20;

  const rows = lignes.map((l) => {
    const quantite = l.quantite || 1;
    


    const tarif = l.tarifUnitaire || 0;
    const montantHT = quantite * tarif;
    const tva = montantHT * tauxTVA / 100;
    totalHT += montantHT;
    totalTVA += tva;

    return `
         <tr>
        <td style="border: 1px solid #333; padding: 6px; word-break: break-word;">${l.libelleMH || 'Marchandise'}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: center;">${l.quantite}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: center;">${l.unite}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: center;">${l.tarifUnitaire.toFixed(2)}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: center;">${l.montantHT.toFixed(2)}</td>
      </tr>

    `;
  }).join('');
const agent = agentsEscale.find(a => a.id === selectedAgentId) || {};
const totalTR = factureData.totalTR || 0;
  const totalTTC = totalHT + totalTVA + totalTR;

  // 🔹 Génération HTML complet
  const html = `
    <div style="font-family: Arial, sans-serif; margin: 40px;">
      <div style="text-align: center;">
        <div>ROYAUME DU MAROC<br>AGENCE NATIONALE DES PORTS</div>
        <img src='/logo-anp.jpeg' style="height: 50px; margin-bottom: 10px; margin-left: 580px;" alt="ANP" />
      </div>
      <div style="margin-bottom: 10px; text-align:center"><strong>N° Facture :</strong> ${numeroFacture}</div>
      <div style="margin-bottom: 10px; text-align:center"><strong>Port :</strong> ${selectedManifest.port || 'N/A'}</div>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="border: 1px solid #333; padding: 6px;">Date d'Émission</th>
          <th style="border: 1px solid #333; padding: 6px;">Statut Facture</th>
          <th style="border: 1px solid #333; padding: 6px;">Méthode de Paiement</th>
        </tr>
        <tr>
          <td style="border: 1px solid #333; padding: 6px;">${new Date().toLocaleString('fr-FR')}</td>
          <td style="border: 1px solid #333; padding: 6px;">Réglée</td>
          <td style="border: 1px solid #333; padding: 6px;">Espèce</td>
        </tr>
      </table>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="border: 1px solid #333; padding: 6px;">Escale</th>
          <th style="border: 1px solid #333; padding: 6px;">Navire</th>
        </tr>
        <tr>
          <td style="border: 1px solid #333; padding: 6px;">${selectedManifest.escaleId || 'N/A'}</td>
          <td style="border: 1px solid #333; padding: 6px;">${selectedManifest.navire || 'N/A'}</td>
        </tr>
      </table>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="border: 1px solid #333; padding: 6px;">Code Client</th>
          <th style="border: 1px solid #333; padding: 6px;">Nom Client</th>
          <th style="border: 1px solid #333; padding: 6px;">ICE</th>
        </tr>
        <tr>
          <td style="border: 1px solid #333; padding: 6px;">${agent.id || 'N/A'}</td>
          <td style="border: 1px solid #333; padding: 6px;">${agent.raisonSociale || agent.email || `Agent #${selectedAgentId}`}</td>
          <td style="border: 1px solid #333; padding: 6px;">${agent.ice || 'N/A'}</td>
        </tr>
      </table>
      
 <table style="width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed;">
  <thead>
    <tr>
      <th style="border: 1px solid #333; padding: 6px; width: 45%; text-align: left;">Libellé</th>
      <th style="border: 1px solid #333; padding: 6px; width: 15%; text-align: right;">Quantité</th>
      <th style="border: 1px solid #333; padding: 6px; width: 10%; text-align: center;">Unité</th>
      <td style="border: 1px solid #333; padding: 6px; text-align: center;">Tarif</th>
      <th style="border: 1px solid #333; padding: 6px; width: 15%; text-align: right;">Montant HT</th>
    </tr>
  </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; font-weight: bold; text-align: right;">
        <div>Total HT : ${totalHT.toFixed(2)} DH</div>
        <div>Total TR : ${totalTR.toFixed(2)} DH</div>
        <div>Total TVA : ${totalTVA.toFixed(2)} DH</div>
        <div>Total TTC : ${totalTTC.toFixed(2)} DH</div>
      </div>
      
      <div style="font-size: 11px; margin-top: 20px; text-align: center;">
        TOUS RÈGLEMENTS EFFECTUÉS EN ESPÈCES SONT SOUMIS AUX DROITS DE TIMBRE DE 0.25% DU MONTANT DE LA FACTURE.<br>
        DIRECTION GÉNÉRALE : LOT MAJ DAROJ A 300, LOT 8A SIDI MAAROUF, CASABLANCA<br>
        ICE : 001612100000014 — TEL : 050121314 — FAX : 0522786102 — IF : 1508000 — TP : 37998029
      </div>
    </div>
  `;

  // 🔹 Injecter dans la preview
  setFactureHTML(html);
  setShowFacturePreview(true);
};



  const enregistrerFacture = async () => {
    if (!selectedManifest || !selectedAgentId) {
      alert("Veuillez sélectionner un manifest et un agent.");
      return;
    }

    const agent = agentsEscale.find(a => a.id === selectedAgentId) || {};
    const lignes = selectedManifest.manifestLines || [];

const payload = {
  numeroFacture: numeroFacture,
  dateEmission: new Date().toISOString(),
  clientId: agent.id,
  details: lignes.map((l, idx) => {
    const tarif = traitementData.lignes[idx]?.tarifUnitaire || 0;
    const quantite = l.quantite || 1;
    return {
      libelle: l.description || "Marchandise",
      quantite: quantite,
      unite: l.unite || "KG",
      tarifUnitaire: tarif,
      montantHT: quantite * tarif
    };
  })
};



const fetchTraitementData = async () => {
  if (!selectedAgentId || !selectedManifest?.id) return;

  try {
    const url = `http://localhost:8080/api/factures/calcule?agentId=${selectedAgentId}&manifesteId=${selectedManifest.id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du calcul de la facture');
    }

    const data = await response.json();
    console.log('Traitement Data reçu :', data);
    setTraitementData(data); // met à jour ton state avec les tarifs
  } catch (err) {
    console.error(err);
    alert('Impossible de récupérer les données du calcul de facture');
  }
};

// 🔹 Ajoute ce useEffect juste ici
useEffect(() => {
  if(selectedManifest && selectedAgentId) {
    fetchTraitementData();
  }
}, [selectedManifest, selectedAgentId]);



  };

  const navigate = useNavigate();
  const taxateurId = 1;

  useEffect(() => {
  // Masquer la prévisualisation à chaque changement de menu
  setShowFacturePreview(false); 

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
      if (!responseEnAttente.ok) throw new Error(`Erreur HTTP: ${responseEnAttente.status}`);
      const dataEnAttente = await responseEnAttente.json();
      setManifestsEnAttente(dataEnAttente || []);

      const responseTraites = await fetch(`http://localhost:8080/api/taxateur/manifests/traites?taxateurId=${taxateurId}`);
      if (!responseTraites.ok) throw new Error(`Erreur HTTP: ${responseTraites.status}`);
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
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
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

  const chargerAgents = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/taxateur/manifests/agents`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAgentsEscale(data || []);
      setSelectedAgentId((data && data[0]?.id) ?? null);
    } catch (e) {
      setAgentsEscale([]);
      setSelectedAgentId(null);
    }
  };

  const chargerTousLesAgents = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/agents'); // endpoint pour tous les agents
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAgentsEscale(data || []);
      setSelectedAgentId((data && data[0]?.id) ?? null); // sélectionner le premier par défaut
    } catch (e) {
      console.error('Erreur lors du chargement des agents :', e);
      setAgentsEscale([]);
      setSelectedAgentId(null);
    }
  };

  const ouvrirModalTraitement = async (manifest) => {
    console.log("Manifest sélectionné :", manifest);
    setSelectedManifest(manifest);
    await chargerTousLesAgents(); // <-- plus de escale
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

  // FONCTION CORRIGÉE POUR L'ENVOI D'EMAIL
  const envoyerFactureParEmail = async () => {
    if (!selectedManifest || !selectedAgentId) {
      return alert("Veuillez sélectionner un manifest et un agent.");
    }

    const agent = agentsEscale.find(a => a.id === selectedAgentId);
    if (!agent?.email) {
      return alert("L'agent sélectionné n'a pas d'email.");
    }

    try {
      const factureDiv = document.getElementById('facture-preview-html');
      if (!factureDiv) {
        return alert("Aucune facture à envoyer. Veuillez d'abord générer la facture.");
      }

      // Générer le PDF
      const canvas = await html2canvas(factureDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight);

      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      // Vérifier que le PDF a été généré correctement
      if (!pdfBase64 || pdfBase64.length === 0) {
        return alert("Erreur lors de la génération du PDF");
      }

      const payload = {
        email: agent.email,
        subject: `Facture ANP - Manifest #${selectedManifest.id}`,
        message: "Veuillez trouver ci-joint votre facture.",
        pdfBase64: pdfBase64,
        filename: `facture_${selectedManifest.id}.pdf`
      };

      // Debug - afficher les données envoyées
      console.log('Payload envoyé:', {
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        filename: payload.filename,
        pdfBase64Length: payload.pdfBase64?.length || 0
      });

      const response = await fetch('http://localhost:8080/api/factures/sendEmail', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      // Mieux gérer la réponse d'erreur
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `Erreur HTTP ${response.status}`;
        } catch (e) {
          errorMessage = await response.text() || `Erreur HTTP ${response.status}`;
        }
        
        console.error('Erreur serveur:', errorMessage);
        return alert(`Erreur lors de l'envoi : ${errorMessage}`);
      }
        Swal.fire({
  title: "Facture envoyée par email avec succès !",
  icon: "success",
  draggable: true
});
  
    
    } catch (err) {
      console.error('Erreur complète:', err);
      alert(`Erreur: ${err.message}`);
    }
  };

  const traiterManifest = async () => {
    try {
      if (!selectedManifest) return alert("Aucun manifest sélectionné");
      if (!selectedAgentId) return alert("Veuillez sélectionner un agent");

      // Construire le payload avec types corrects
      const payload = {
        manifestId: Number(traitementData.manifestId),
        agentId: Number(selectedAgentId),
        lignes: (traitementData.lignes || []).map(ligne => ({
          id: Number(ligne.id),
          montant: Number(ligne.montant) || 0
        }))
      };

      console.log("Payload envoyé:", payload); // Pour debug

      const response = await fetch(`http://localhost:8080/api/taxateur/manifests/traiter?taxateurId=${taxateurId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Manifest traité avec succès !');
        setShowTraitementModal(false);
        chargerManifests(); // rafraîchir la liste
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
    } catch {
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
    if (loading) return <div className="text-center py-4">Chargement...</div>;
    if (error) {
      return (
        <div className="text-center py-4">
          <div className="text-red-600 mb-2">Erreur: {error}</div>
          <button onClick={chargerManifests} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date dépôt</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Escale</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Navire</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trafic</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {manifestsEnAttente.map((manifest) => (
              <tr key={manifest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{manifest.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{formatDate(manifest.dateDepot)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{manifest.port || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{manifest.escaleId || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{manifest.navire || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{manifest.trafic || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button onClick={() => ouvrirModalTraitement(manifest)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                    Générer la facture 
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
    if (loading) return <div className="text-center py-4">Chargement...</div>;
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {manifestsTraites.map((manifest) => (
              <tr key={manifest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{manifest.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(manifest.dateTraitement)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manifest.montantTotal?.toLocaleString()} DH</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setSelectedManifest(manifest); setSelectedAgentId(manifest.agentId || null); imprimerFacture(); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Générer la facture
                  </button>
                </td>
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
            <img src="/logo-anp.jpeg" alt="Logo ANP" className="h-10 text-center" />
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
        {showFacturePreview && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow border border-blue-500">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Prévisualisation de la facture</h2>
            <div id="facture-preview-html" dangerouslySetInnerHTML={{ __html: factureHTML }} />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={async () => {
                  // Téléchargement du PDF
                  await telechargerFacturePDF();
                  
                  // Envoi par email
                  await envoyerFactureParEmail();
                  
                  // Fermer la prévisualisation
                  setShowFacturePreview(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Accepter
              </button>
              <button onClick={() => setShowFacturePreview(false)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Refuser</button>
            </div>
          </div>
        )}

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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manifests en attente de facturation ({manifestsEnAttente.length})</h3>
              {renderManifestsEnAttente()}
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
            <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Profil Taxateur</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Modifier le mot de passe</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                  </div>
                  <button type="submit" className="w-full bg-[#0071bc] text-white px-6 py-3 rounded-lg hover:bg-[#005fa3] transition-colors font-medium">
                    Modifier le mot de passe
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {showTraitementModal && selectedManifest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traiter le manifest {selectedManifest.id}</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Client </label>
                <select
                  value={selectedAgentId ?? ''}
                  onChange={(e) => setSelectedAgentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un agent</option>
                  {agentsEscale.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.raisonSociale || a.email || `Agent #${a.id}`}
                    </option>
                  ))}
                  {!agentsEscale.length && selectedAgentId && (
                    <option value={selectedAgentId}>{`Agent #${selectedAgentId} (créé par)`}</option>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowTraitementModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  Annuler
                </button>
                <button onClick={imprimerFacture} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Voir facture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}