import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, Check, AlertTriangle, Save, User, Mail } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserPassword, updateUserProfile, getUserRole } = useAuth();
  
  const [profileData, setProfileData] = useState({ email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // FIX: Added 'info' to the feedback state type to allow for informational messages.
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const userRole = getUserRole(currentUser);

  useEffect(() => {
    if (currentUser) {
      setProfileData({ email: currentUser.email || '' });
    }
  }, [currentUser]);

  if (!currentUser || !userRole) {
    return <div>Loading user profile...</div>;
  }
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    let cumulativeMessage = '';
    let success = true;
    
    // Update profile data like email
    if (profileData.email !== (currentUser.email || '')) {
        const profileResult = updateUserProfile({ email: profileData.email });
        if (profileResult.success) {
            cumulativeMessage += profileResult.message + ' ';
        } else {
            setFeedback({ type: 'error', message: profileResult.message });
            success = false;
        }
    }

    // Update password if new one is provided
    if (newPassword && success) {
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'Passwords do not match.' });
        return;
      }
      const passResult = updateCurrentUserPassword(newPassword);
      if (passResult.success) {
        cumulativeMessage += passResult.message;
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', message: passResult.message });
        success = false;
      }
    }
    
    if (cumulativeMessage && success) {
        setFeedback({ type: 'success', message: cumulativeMessage.trim() || "Profile updated." });
    } else if (!cumulativeMessage) {
        setFeedback({ type: 'info', message: 'No changes to save.' });
    }
    
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
      <p className="text-gray-500 mt-1">View your account information and manage your credentials.</p>

      <div className="mt-8 max-w-2xl mx-auto">
        <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Account Information</h3>
                 <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-lg font-semibold text-gray-800">{currentUser.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">User ID</label>
                         <p className="text-lg font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">{currentUser.id}</p>
                    </div>
                    
                    {currentUser.roleId === 'director' && (
                       <div>
                        <label htmlFor="userEmail" className="text-sm font-medium text-gray-500">Contact Email</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                             <input
                                id="userEmail"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData(p => ({...p, email: e.target.value}))}
                                placeholder="Your email for sending invitations"
                                className="w-full pl-10 pr-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
                            />
                        </div>
                      </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <p className="text-lg font-semibold text-gray-800">{userRole.name}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Change Password</h3>
                <div className="space-y-4">
                     <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password (leave blank to keep unchanged)"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
                        />
                     </div>
                     <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
                        />
                     </div>
                </div>
            </div>
             <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-white py-3 rounded-lg font-semibold hover:bg-brand-primary transition-transform transform hover:scale-105 shadow"
                >
                <Save size={18} /> Update Profile
            </button>
        </form>
         {feedback && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              feedback.type === 'success' ? 'bg-green-100 text-green-800' : 
              feedback.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
            {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {feedback.message}
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;