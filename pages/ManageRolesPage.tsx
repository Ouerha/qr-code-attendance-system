import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALL_PERMISSIONS } from '../types';
import type { Role, Permission } from '../types';
import { ShieldCheck, PlusCircle, Edit, Trash2, Check, AlertTriangle } from 'lucide-react';

const ManageRolesPage: React.FC = () => {
  const { roles, createRole, updateRole, deleteRole } = useAuth();
  
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<Permission, boolean>>(() => 
    Object.keys(ALL_PERMISSIONS).reduce((acc, key) => ({ ...acc, [key]: false }), {}) as Record<Permission, boolean>
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const startEditing = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    const perms = Object.keys(ALL_PERMISSIONS).reduce((acc, key) => {
      return { ...acc, [key]: role.permissions.includes(key as Permission) };
    }, {} as Record<Permission, boolean>);
    setSelectedPermissions(perms);
  };
  
  const cancelEditing = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPermissions(Object.keys(ALL_PERMISSIONS).reduce((acc, key) => ({ ...acc, [key]: false }), {}) as Record<Permission, boolean>);
  };

  const handlePermissionChange = (permission: Permission) => {
    setSelectedPermissions(prev => ({ ...prev, [permission]: !prev[permission] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const permissions = Object.entries(selectedPermissions)
      .filter(([, value]) => value)
      .map(([key]) => key as Permission);

    const result = editingRole
      ? updateRole(editingRole.id, { name: roleName, permissions })
      : createRole({ name: roleName, permissions });

    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      cancelEditing();
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This cannot be undone.`)) {
      const result = deleteRole(role.id);
      setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Manage Roles & Permissions</h2>
      <p className="text-gray-500 mt-1">Define user roles and what actions they can perform.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">{editingRole ? `Editing "${editingRole.name}"` : 'Create New Role'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input type="text" id="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g., Checkpoint Manager" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required/>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border rounded-lg p-3 bg-gray-50">
                {Object.entries(ALL_PERMISSIONS).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
                    <input type="checkbox" checked={selectedPermissions[key as Permission]} onChange={() => handlePermissionChange(key as Permission)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"/>
                    <span className="text-sm text-gray-800">{value}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
                {editingRole && <button type="button" onClick={cancelEditing} className="w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>}
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-lg font-semibold hover:bg-brand-dark shadow-lg">
                    {editingRole ? 'Save Changes' : <><PlusCircle size={18} /> Create Role</>}
                </button>
            </div>
          </form>
           {feedback && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${ feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
              {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {feedback.message}
            </div>
          )}
        </div>

        {/* Roles List */}
        <div className="lg:col-span-3">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><ShieldCheck size={20}/> Existing Roles</h3>
            <div className="space-y-3">
                {roles.map(role => (
                    <div key={role.id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-start">
                            <div>
                               <h4 className="font-bold text-lg text-gray-800">{role.name}</h4>
                               <div className="flex flex-wrap gap-2 mt-2">
                                {role.permissions.map(p => (
                                    <span key={p} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{ALL_PERMISSIONS[p]}</span>
                                ))}
                                {role.permissions.length === 0 && <span className="text-xs text-gray-500">No permissions assigned.</span>}
                               </div>
                            </div>
                            {role.id !== 'director' && (
                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                    <button onClick={() => startEditing(role)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(role)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRolesPage;
