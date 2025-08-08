import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/admin/categories';

function CategoryForm({ category, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    libelle: category ? category.libelle : '',
    unite: category ? category.unite : '',
    categorie: category ? category.categorie : '',
    groupName : category ? category.groupName : ''
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
      <h3 className="text-xl font-bold mb-4">{category ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4"
      > <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie </label>
          <input
            type="number"
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
          <select
            name="unite"
            value={formData.unite}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            required
          >
            <option value="">-- Choisir une unité --</option>
            <option value="m3">m³</option>
            <option value="Tonne">Tonne</option>
            <option value="Unité">Unité</option>
          </select>
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

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement des catégories:", error);
        setLoading(false);
      });
  };

  const handleSave = (categoryData) => {
    const isEditing = !!editingCategory;
    const url = isEditing ? `${API_URL}/${editingCategory.id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    }).then(res => {
      if (res.ok) {
        fetchCategories();
        setIsFormVisible(false);
        setEditingCategory(null);
      } else {
        console.error("Erreur lors de l'enregistrement de la catégorie");
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            fetchCategories();
          } else {
            console.error("Erreur lors de la suppression de la catégorie");
          }
        });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingCategory(null);
  };

  if (loading) {
    return <p className="text-black">Chargement des catégories...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#0071bc]">Gestion des Catégories</h2>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-[#005fa3]">
            Ajouter une Catégorie
          </button>
        )}
      </div>

      {isFormVisible && <CategoryForm category={editingCategory} onSave={handleSave} onCancel={handleCancel} />}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black rounded shadow">
          <thead>
            <tr>  
              <th className="py-2 px-4 border-b">Catégorie </th>
              <th className="py-2 px-4 border-b">Libellé</th>
              <th className="py-2 px-4 border-b">Unité</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{category.categorie}</td>
                <td className="py-2 px-4 border-b">{category.libelle}</td>
                <td className="py-2 px-4 border-b">{category.unite}</td>
                <td className="py-2 px-4 border-b text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(category)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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