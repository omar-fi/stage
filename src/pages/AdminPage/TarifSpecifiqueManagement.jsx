import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/admin/tarifs-specifiques';
const PORTS_API_URL = 'http://localhost:8080/admin/ports';

function TarifForm({ tarif, onSave, onCancel, ports }) {
  const [formData, setFormData] = useState({
    portId: tarif ? tarif.portId : '',
    categorie: tarif ? tarif.categorie : '',
    libelle: tarif ? tarif.libelle : '',
    unite: tarif ? tarif.unite : '',
    tarifUnitaire: tarif ? tarif.tarifUnitaire : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">{tarif ? 'Modifier le Tarif Spécifique' : 'Ajouter un Tarif Spécifique'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Port</label>
          <select
            name="portId"
            value={formData.portId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            required
          >
            <option value="">Sélectionner un port</option>
            {ports.map(port => (
              <option key={port.id} value={port.id}>
                {port.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <input
            type="text"
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Libellé</label>
          <input
            type="text"
            name="libelle"
            value={formData.libelle}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unité</label>
          <input
            type="text"
            name="unite"
            value={formData.unite}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tarif Unitaire</label>
          <input
            type="number"
            name="tarifUnitaire"
            value={formData.tarifUnitaire}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Annuler
          </button>
          <button type="submit" className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3]">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TarifSpecifiqueManagement() {
  const [tarifs, setTarifs] = useState([]);
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTarif, setEditingTarif] = useState(null);

  useEffect(() => {
    fetchTarifs();
    fetchPorts();
  }, []);

  const fetchPorts = () => {
    fetch(PORTS_API_URL)
      .then(res => res.json())
      .then(data => setPorts(data))
      .catch(error => console.error("Erreur de chargement des ports:", error));
  };

  const fetchTarifs = () => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setTarifs(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement des tarifs spécifiques:", error);
        setLoading(false);
      });
  };

  const handleSave = (tarifData) => {
    const isEditing = !!editingTarif;
    const url = isEditing ? `${API_URL}/${editingTarif.id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarifData)
    }).then(res => {
      if (res.ok) {
        fetchTarifs();
        setIsFormVisible(false);
        setEditingTarif(null);
      } else {
        console.error("Erreur lors de l'enregistrement du tarif spécifique");
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) {
      fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            fetchTarifs();
          } else {
            console.error("Erreur lors de la suppression du tarif spécifique");
          }
        });
    }
  };

  const handleEdit = (tarif) => {
    setEditingTarif(tarif);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingTarif(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingTarif(null);
  };

  if (loading) {
    return <p className="text-black">Chargement des tarifs spécifiques...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#0071bc]">Gestion des Tarifs Spécifiques</h2>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3]">
            Ajouter un Tarif Spécifique
          </button>
        )}
      </div>

      {isFormVisible && <TarifForm tarif={editingTarif} onSave={handleSave} onCancel={handleCancel} ports={ports} />}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Port ID</th>
              <th className="py-2 px-4 border-b">Catégorie</th>
              <th className="py-2 px-4 border-b">Libellé</th>
              <th className="py-2 px-4 border-b">Unité</th>
              <th className="py-2 px-4 border-b">Tarif Unitaire</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tarifs.map(tarif => (
              <tr key={tarif.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{tarif.id}</td>
                <td className="py-2 px-4 border-b">{tarif.portId}</td>
                <td className="py-2 px-4 border-b">{tarif.categorie}</td>
                <td className="py-2 px-4 border-b">{tarif.libelle}</td>
                <td className="py-2 px-4 border-b">{tarif.unite}</td>
                <td className="py-2 px-4 border-b text-center">{tarif.tarifUnitaire}</td>
                <td className="py-2 px-4 border-b text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(tarif)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(tarif.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 