import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080/admin/utilisateurs';
const PORTS_URL = 'http://localhost:8080/admin/ports';
const DELETE_AGENT_URL = 'http://localhost:8080/admin/utilisateurs/agent';
const DELETE_TAXATEUR_URL = 'http://localhost:8080/admin/utilisateurs/taxateur';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [ports, setPorts] = useState([]);
  const [filteredRole, setFilteredRole] = useState('TOUS');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    portId: '',
    id: null,
  });
  const [mode, setMode] = useState('add');

  // Récupération des données à l'initialisation du composant
  useEffect(() => {
    fetchData();
    fetch(PORTS_URL)
      .then(res => res.json())
      .then(data => setPorts(data))
      .catch(error => console.error('Erreur lors de la récupération des ports', error));
  }, []);

  // Fonction pour récupérer les utilisateurs depuis l'API
  const fetchData = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data); // Met à jour l'état avec les utilisateurs récupérés
        } else {
          console.error("Les données récupérées ne sont pas un tableau valide", data);
          setUsers([]); // Réinitialise les utilisateurs si les données sont incorrectes
        }
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des utilisateurs", error);
        setUsers([]); // Si l'API échoue, on vide l'état
      });
  };

  // Fonction de suppression d'un utilisateur
  const handleDelete = (user) => {
    const url = user.role === 'AGENT'
      ? `${DELETE_AGENT_URL}/${user.id}`
      : `${DELETE_TAXATEUR_URL}/${user.id}`;
    fetch(url, { method: 'DELETE' })
      .then(() => fetchData()) // Rafraîchit la liste après suppression
      .catch(error => console.error('Erreur lors de la suppression de l\'utilisateur', error));
  };

  // Fonction de soumission du formulaire (ajout ou modification d'un utilisateur)
  const handleSubmit = (e) => {
    e.preventDefault();
    const isAdd = mode === 'add';
    const url = isAdd
      ? `${API_URL}/taxateur`
      : `${API_URL}/taxateur/${form.id}`;
    const method = isAdd ? 'POST' : 'PUT';

    const body = JSON.stringify({
      email: form.email,
      password: form.password,
      portId: form.portId,
    });

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    })
      .then(() => {
        fetchData();
        setForm({ email: '', password: '', portId: '', id: null });
        setMode('add');
        setShowForm(false);
      })
      .catch(error => console.error('Erreur lors de la soumission du formulaire', error));
  };

  // Fonction pour initialiser le formulaire en mode édition
  const startEdit = (user) => {
    setForm({
      email: user.email,
      password: '', // Ne pas afficher le mot de passe lors de l'édition
      portId: user.portId,
      id: user.id,
    });
    setMode('edit');
    setShowForm(true);
  };

  // Filtrage des utilisateurs en fonction du rôle
  const filteredUsers = users.filter(user =>
    filteredRole === 'TOUS' ? true : user.role === filteredRole
  );

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Gestion des utilisateurs</h2>

      {/* 🔍 Filtrage par rôle */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium">Filtrer par rôle :</label>
        <select
          value={filteredRole}
          onChange={(e) => setFilteredRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0071bc] text-black"
        >
          <option value="TOUS">Tous</option>
          <option value="AGENT">Agent</option>
          <option value="TAXATEUR">Taxateur</option>
        </select>

        {/* ➕ Bouton afficher/masquer formulaire */}
        <button
          className="ml-auto bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            setForm({ email: '', password: '', portId: '', id: null });
            setMode('add');
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Annuler' : 'Ajouter un taxateur'}
        </button>
      </div>

      {/* 📋 Tableau utilisateurs */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Rôle</th>
              <th className="py-2 px-4 border-b">Port</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-100 text-center">
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">
  {user.role === 'AGENT' ? 'AGENT MARITIME' : user.role}
</td>

               
                <td className="py-2 px-4 border-b">{user.role === 'AGENT' ? 'Tous les ports' : user.portNom}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex justify-center gap-2">
                    {user.role === 'AGENT' && (
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(user)}
                      >
                        Supprimer
                      </button>
                    )}
                    {user.role === 'TAXATEUR' && (
                      <>
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          onClick={() => startEdit(user)}
                        >
                          Modifier
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => handleDelete(user)}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✏️ Formulaire ajout/modification */}
      {showForm && (
        <div className="border-t pt-6 max-w-xl">
          <h3 className="text-xl font-semibold mb-4">{mode === 'add' ? 'Ajouter un taxateur' : 'Modifier le taxateur'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded text-black"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {mode === 'add' && (
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full p-2 border rounded text-black"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            )}
            <select
              className="w-full p-2 border rounded text-black"
              value={form.portId}
              onChange={(e) => setForm({ ...form, portId: e.target.value })}
              required
            >
              <option value="">-- Choisir un port --</option>
              {ports.map(port => (
                <option key={port.id} value={port.id}>{port.nom}</option>
              ))}
            </select>
            <button type="submit" className="bg-[#0071bc] text-white py-2 px-4 rounded hover:bg-blue-700">
              {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}