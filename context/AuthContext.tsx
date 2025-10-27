import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { User, Role, Permission } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  roles: Role[];
  login: (id: string, pass: string) => { success: boolean, message: string };
  logout: () => void;
  createUser: (newUser: Omit<User, 'id'> & { id: string, password: string}) => { success: boolean, message: string };
  updateUser: (userId: string, updates: Partial<User>) => { success: boolean, message: string };
  deleteUser: (userIdToDelete: string) => { success: boolean, message: string };
  updateCurrentUserPassword: (newPassword: string) => { success: boolean, message: string };
  updateUserProfile: (profileData: { email?: string; name?:string }) => { success: boolean, message: string };
  
  createRole: (role: Omit<Role, 'id'>) => { success: boolean, message: string };
  updateRole: (roleId: string, updates: Partial<Role>) => { success: boolean, message: string };
  deleteRole: (roleId: string) => { success: boolean, message: string };
  
  hasPermission: (permission: Permission) => boolean;
  getUserRole: (user: User | null) => Role | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialDirectorRole: Role = { 
  id: 'director', 
  name: 'Director', 
  permissions: ['register_participant', 'scan_qrcode', 'view_summary', 'manage_checkpoints', 'manage_staff', 'manage_roles', 'manage_events', 'supervise_team', 'communicate_with_director'] 
};
const supervisorRole: Role = { id: 'supervisor', name: 'Supervisor', permissions: ['register_participant', 'scan_qrcode', 'view_summary', 'manage_checkpoints', 'supervise_team', 'communicate_with_director'] };
const staffRole: Role = { id: 'staff', name: 'Staff', permissions: ['register_participant', 'scan_qrcode'] };

const initialDirector: User = { 
  id: 'director', 
  name: 'DHAW BRINI', 
  roleId: 'director',
  password: 'director123',
  email: 'director@university.com',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({ 'director': initialDirector });
  const [roles, setRoles] = useState<Record<string, Role>>({
    'director': initialDirectorRole,
    'supervisor': supervisorRole,
    'staff': staffRole,
  });

  const getUserRole = useCallback((user: User | null): Role | null => {
    if (!user || !roles[user.roleId]) return null;
    return roles[user.roleId];
  }, [roles]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.roleId === 'director') return true;
    const userRole = getUserRole(currentUser);
    return userRole?.permissions.includes(permission) ?? false;
  }, [currentUser, getUserRole]);

  const login = useCallback((id: string, pass: string): { success: boolean, message: string } => {
    const userData = users[id];
    if (userData && userData.password === pass) {
      setCurrentUser(userData);
      return { success: true, message: 'Login successful!' };
    }
    return { success: false, message: 'Invalid ID or password.' };
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const createUser = useCallback((newUser: Omit<User, 'id'> & { id: string, password: string }): { success: boolean, message: string } => {
    if (!hasPermission('manage_staff')) return { success: false, message: 'Permission denied.' };
    if (!newUser.id || !newUser.name || !newUser.password || !newUser.roleId) return { success: false, message: 'All fields are required.' };
    if (users[newUser.id]) return { success: false, message: `User with ID "${newUser.id}" already exists.` };

    setUsers(prev => ({ ...prev, [newUser.id]: { ...newUser, createdBy: currentUser!.id } }));
    return { success: true, message: `User "${newUser.name}" created successfully.` };
  }, [currentUser, hasPermission, users]);
  
  const updateUser = useCallback((userId: string, updates: Partial<User>): { success: boolean, message: string } => {
    if (!hasPermission('manage_staff')) return { success: false, message: 'Permission denied.' };
    if (!users[userId]) return { success: false, message: 'User not found.' };

    setUsers(prev => ({ ...prev, [userId]: { ...prev[userId], ...updates } }));
    return { success: true, message: 'User updated successfully.' };
  }, [hasPermission, users]);

  const deleteUser = useCallback((userIdToDelete: string): { success: boolean, message: string } => {
    if (!hasPermission('manage_staff')) return { success: false, message: 'Permission denied.' };
    if (!users[userIdToDelete]) return { success: false, message: 'User not found.' };
    if (users[userIdToDelete].roleId === 'director') return { success: false, message: 'Cannot delete the Director account.' };

    setUsers(prevUsers => {
      const { [userIdToDelete]: _, ...remainingUsers } = prevUsers;
      
      const finalUsers = Object.values(remainingUsers).reduce((acc, user) => {
        // If a user's supervisor is the one being deleted, remove the supervisorId
        if (user.supervisorId === userIdToDelete) {
          const { supervisorId, ...userWithoutSupervisor } = user;
          acc[user.id] = userWithoutSupervisor as User;
        } else {
          acc[user.id] = user;
        }
        return acc;
      }, {} as Record<string, User>);
      
      return finalUsers;
    });

    return { success: true, message: 'User deleted successfully.' };
  }, [hasPermission, users]);

  const createRole = useCallback((role: Omit<Role, 'id'>): { success: boolean, message: string } => {
    if (!hasPermission('manage_roles')) return { success: false, message: 'Permission denied.' };
    if (!role.name) return { success: false, message: 'Role Name is required.' };
    const newId = role.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    
    setRoles(prev => ({ ...prev, [newId]: {...role, id: newId} }));
    return { success: true, message: `Role "${role.name}" created.` };
  }, [hasPermission]);

  const updateRole = useCallback((roleId: string, updates: Partial<Role>): { success: boolean, message: string } => {
    if (!hasPermission('manage_roles')) return { success: false, message: 'Permission denied.' };
    if (!roles[roleId]) return { success: false, message: 'Role not found.' };
    if (roles[roleId].id === 'director') return { success: false, message: 'The Director role cannot be modified.' };

    setRoles(prev => ({ ...prev, [roleId]: { ...prev[roleId], ...updates } }));
    return { success: true, message: 'Role updated successfully.' };
  }, [hasPermission, roles]);

  const deleteRole = useCallback((roleId: string): { success: boolean, message: string } => {
    if (!hasPermission('manage_roles')) return { success: false, message: 'Permission denied.' };
    if (roleId === 'director' || roleId === 'supervisor' || roleId === 'staff') return { success: false, message: 'Cannot delete default roles.' };
    if (Object.values(users).some(u => u.roleId === roleId)) return { success: false, message: 'Cannot delete role as it is assigned to users.' };

    setRoles(prevRoles => {
        const { [roleId]: _, ...remainingRoles } = prevRoles;
        return remainingRoles;
    });
    return { success: true, message: 'Role deleted.' };
  }, [hasPermission, users]);

  const updateCurrentUserPassword = useCallback((newPassword: string): { success: boolean, message: string } => {
    if (!currentUser) return { success: false, message: 'No user is logged in.' };
    if (newPassword.length < 6) return { success: false, message: 'Password must be at least 6 characters long.'};
    
    let updatedUser: User | null = null;
    setUsers(prev => {
        const userToUpdate = prev[currentUser.id];
        if (!userToUpdate) return prev;
        updatedUser = { ...userToUpdate, password: newPassword };
        return { ...prev, [currentUser.id]: updatedUser };
    });
    if (updatedUser) {
        setCurrentUser(updatedUser);
    }
    return { success: true, message: 'Password updated successfully.' };
  }, [currentUser]);
  
  const updateUserProfile = useCallback((profileData: { email?: string, name?: string }): { success: boolean, message: string } => {
    if (!currentUser) return { success: false, message: 'No user is logged in.' };

    let updatedUser: User | null = null;
    setUsers(prev => {
        const userToUpdate = prev[currentUser.id];
        if (!userToUpdate) return prev;
        updatedUser = { ...userToUpdate, ...profileData };
        return { ...prev, [currentUser.id]: updatedUser };
    });

    if (updatedUser) {
        setCurrentUser(updatedUser);
    }
    return { success: true, message: 'Profile updated successfully.' };
  }, [currentUser]);

  const displayUsers = Object.values(users).map(({ password, ...rest }) => rest);

  return (
    <AuthContext.Provider value={{
      currentUser, users: displayUsers, roles: Object.values(roles),
      login, logout, createUser, updateUser, deleteUser,
      updateCurrentUserPassword, updateUserProfile,
      createRole, updateRole, deleteRole,
      hasPermission, getUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
