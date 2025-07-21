import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/admin/ports';

function PortForm({ port, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nom: port ? port.nom : '',
    ville: port ? port.ville : '',
    tauxRK: port ? port.tauxRK : ''
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
      <h3 className="text-xl font-bold mb-4">{port ? 'Modifier le Port' : 'Ajouter un Port'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom du Port</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ville</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Taux RK (%)</label>
          <input
            type="number"
            name="tauxRK"
            value={formData.tauxRK}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
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


export default function PortManagement() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPort, setEditingPort] = useState(null);

  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = () => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setPorts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement des ports:", error);
        setLoading(false);
      });
  };

  const handleSave = (portData) => {
    const isEditing = !!editingPort;
    const url = isEditing ? `${API_URL}/${editingPort.id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portData)
    }).then(res => {
      if (res.ok) {
        fetchPorts(); 
        setIsFormVisible(false);
        setEditingPort(null);
      } else {
        console.error("Erreur lors de l'enregistrement du port");
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce port ?")) {
      fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            fetchPorts(); 
          } else {
            console.error("Erreur lors de la suppression du port");
          }
        });
    }
  };

  const handleEdit = (port) => {
    setEditingPort(port);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingPort(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingPort(null);
  };

  if (loading) {
    return <p className="text-black">Chargement des ports...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#0071bc]">Gestion des Ports</h2>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3]">
            Ajouter un Port
          </button>
        )}
      </div>

      {isFormVisible && <PortForm port={editingPort} onSave={handleSave} onCancel={handleCancel} />}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nom</th>
              <th className="py-2 px-4 border-b">Ville</th>
              <th className="py-2 px-4 border-b">Taux RK (%)</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ports.map(port => (
              <tr key={port.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{port.id}</td>
                <td className="py-2 px-4 border-b">{port.nom}</td>
                <td className="py-2 px-4 border-b">{port.ville}</td>
                <td className="py-2 px-4 border-b text-center">{port.tauxRK}</td>
                <td className="py-2 px-4 border-b text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(port)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(port.id)}
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