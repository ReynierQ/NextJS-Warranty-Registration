"use client";

import React, { useState, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import api from '@/utils/api';
import AdminNavbar from '@/app/components/admin-navbar/admin-navbar';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting states
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/list');
      if (response.data.success) {
        setAdmins(response.data.admins || []);
        setFilteredAdmins(response.data.admins || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      showMessage('error', 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/register', formData);

      if (response.data.success) {
        showMessage('success', 'Admin added successfully');
        setFormData({ name: '', email: '', password: '' });
        setShowAddForm(false);
        fetchAdmins();
      } else {
        showMessage('error', response.data.message || 'Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      showMessage('error', error.response?.data?.message || 'Network error');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      const response = await api.delete(`/admin/${id}`);

      if (response.data.success) {
        showMessage('success', 'Admin deleted successfully');
        fetchAdmins();
      } else {
        showMessage('error', response.data.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      showMessage('error', error.response?.data?.message || 'Network error');
    }
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      name: admin.name,
      email: admin.email,
      password: '' // Don't pre-fill password for security
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that have values
      const updateData = {};
      if (editFormData.name && editFormData.name !== editingAdmin.name) {
        updateData.name = editFormData.name;
      }
      if (editFormData.email && editFormData.email !== editingAdmin.email) {
        updateData.email = editFormData.email;
      }
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      if (Object.keys(updateData).length === 0) {
        showMessage('error', 'No changes to update');
        return;
      }

      const response = await api.put(`/admin/${editingAdmin.id}`, updateData);

      if (response.data.success) {
        showMessage('success', 'Admin updated successfully');
        setEditFormData({ name: '', email: '', password: '' });
        setShowEditForm(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        showMessage('error', response.data.message || 'Failed to update admin');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      showMessage('error', error.response?.data?.message || 'Network error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    let filtered = [...admins];

    // Apply search filter
    const searchLower = searchTerm.toLowerCase().trim();
    if (searchLower) {
      filtered = filtered.filter((admin) =>
        admin.name?.toLowerCase().includes(searchLower) ||
        admin.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        if (sortField === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredAdmins(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, admins]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-500">⇅</span>;
    }
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Calculate pagination values
  const totalItems = filteredAdmins.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentAdmins = filteredAdmins.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className="px-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="px-2">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Management</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
            : 'bg-red-500/20 border border-red-500/30 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search and Add Button */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-2 rounded bg-gray-700 border border-gray-600"
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-orange-500 px-6 py-2 rounded hover:bg-orange-600 transition-colors"
        >
          <UserPlus size={20} />
          Add Admin
        </button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddAdmin}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded transition-colors"
              >
                Create Admin
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', email: '', password: '' });
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Form */}
      {showEditForm && editingAdmin && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Edit Admin: {editingAdmin.name}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateAdmin}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition-colors"
              >
                Update Admin
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAdmin(null);
                  setEditFormData({ name: '', email: '', password: '' });
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Form */}
      {showEditForm && editingAdmin && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Edit Admin: {editingAdmin.name}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateAdmin}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition-colors"
              >
                Update Admin
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAdmin(null);
                  setEditFormData({ name: '', email: '', password: '' });
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : filteredAdmins.length === 0 ? (
        <p>No admins found.</p>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-400">
            Showing {startIndex + 1} to {endIndex} of {totalItems} admins
            {totalItems !== admins.length && ` (filtered from ${admins.length} total)`}
          </div>

          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
            <table className="min-w-full border border-gray-700 text-sm">
              <thead>
                <tr className="bg-gray-800">
                  <th 
                    className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th 
                    className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('email')}
                  >
                    Email <SortIcon field="email" />
                  </th>
                  <th 
                    className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    Created Date <SortIcon field="created_at" />
                  </th>
                  <th className="p-2 border border-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAdmins.map((admin) => (
                  <tr key={admin.id} className="text-center bg-gray-900 hover:bg-gray-800">
                    <td className="p-2 border border-gray-700">{admin.name}</td>
                    <td className="p-2 border border-gray-700">{admin.email}</td>
                    <td className="p-2 border border-gray-700">{formatDate(admin.created_at)}</td>
                    <td className="p-2 border border-gray-700">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                Previous
              </button>

              <div className="flex gap-2 items-center">
                {renderPaginationButtons()}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}