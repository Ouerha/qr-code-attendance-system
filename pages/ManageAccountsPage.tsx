import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../components/EventContext';
import { User, Key, PlusCircle, AlertTriangle, Check, Users, Trash2, Edit, UserCog, Briefcase, ChevronDown } from 'lucide-react';
import type { User as UserType } from '../types';
import { useNotifications } from '../context/NotificationContext';

const ManageAccountsPage: React.FC = () => {
  const { currentUser, users, roles, createUser, updateUser, deleteUser, hasPermission } = useAuth();
  const { unassignUserFromAllEvents } = useEvents();
  const { addNotification } = useNotifications();
  
  const [newUser, setNewUser] = useState<Omit<UserType, 'id'> & { id?: string, password?: string }>({ name: '', roleId: '', password: '' });
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const availableRoles = roles.filter(r => r.id !== 'director');
  const supervisors = users.filter(u => u.id !== editingUser?.id && hasPermission('supervise_team'));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
        setEditingUser({ ...editingUser, [name]: value });
    } else {
        setNewUser({ ...newUser, [name]: value });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createUser({ ...newUser, id: newUser.id!, password: newUser.password!});
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      addNotification(newUser.id!, `Welcome! Your account has been created.`);
      setNewUser({ name: '', id: '', roleId: '', password: '' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const { id, ...updates } = editingUser;
    const result = updateUser(id, updates);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      addNotification(id, `Your account details have been updated by the Director.`);
      setEditingUser(null);
    }
    setTimeout(() => setFeedback(null), 4000);
  };


  const handleDeleteUser = useCallback((userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete "${userName}"? This will unassign them from all events.`)) {
        const result = deleteUser(userId);
        if (result.success) {
            unassignUserFromAllEvents(userId);
        }
        setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
        setTimeout(() => setFeedback(null), 4000);
    }
  }, [deleteUser, unassignUserFromAllEvents]);
  
  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'N/A';
  const getSupervisorName = (userId?: string) => users.find(u => u.id === userId)?.name || 'None';

  const formUser = editingUser || newUser;
  const formHandler = editingUser ? handleUpdate : handleSubmit;
  
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Manage Accounts</h2>
      <p className="text-gray-500 mt-1">Create, edit, or delete accounts for event staff.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">{editingUser ? 'Edit Account' : 'Create New Account'}</h3>
          <form onSubmit={formHandler} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
              <input type="text" name="name" value={formUser.name} onChange={handleInputChange} placeholder="Full Name" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent" required />
            </div>
            {!editingUser && (
              <>
                 <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input type="text" name="id" value={formUser.id || ''} onChange={handleInputChange} placeholder="User ID (for login)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent" required />
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input type="password" name="password" value={formUser.password || ''} onChange={handleInputChange} placeholder="Password" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent" required />
                </div>
              </>
            )}
             <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <select name="roleId" value={formUser.roleId} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent appearance-none" required>
                    <option value="">Select a Role...</option>
                    {availableRoles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            </div>
            <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <select name="supervisorId" value={formUser.supervisorId || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent appearance-none">
                    <option value="">Select a Supervisor (Optional)...</option>
                    {supervisors.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            </div>
            <div className="flex gap-2">
                {editingUser && <button type="button" onClick={() => setEditingUser(null)} className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>}
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-lg font-semibold hover:bg-brand-dark transition-transform transform hover:scale-105 shadow-lg" >
                  <PlusCircle size={18} /> {editingUser ? 'Save Changes' : 'Create Account'}
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
        
        {/* Users List Section */}
        <div className="lg:col-span-3">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><Users size={20}/> Existing Staff</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 bg-white p-4 rounded-lg shadow-sm border">
            {users.filter(u => u.id !== 'director').map(user => (
              <div key={user.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center border">
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">ID: {user.id} | Supervisor: {getSupervisorName(user.supervisorId)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white bg-gray-600 px-2 py-1 rounded-full">{getRoleName(user.roleId)}</span>
                  <button onClick={() => setEditingUser(user)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" aria-label={`Edit ${user.name}`}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id, user.name)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${user.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAccountsPage;
