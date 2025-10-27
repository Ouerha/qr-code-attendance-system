import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UserCircle, ArrowLeft, Bell, Check } from 'lucide-react';

const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setTimeout(() => markAllAsRead(), 1000); // Mark as read after opening
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggle} className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell className="h-6 w-6 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
          <div className="p-3 flex justify-between items-center border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button onClick={markAllAsRead} className="text-xs text-brand-primary hover:underline">Mark all as read</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} className={`p-3 border-b hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-6">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const MainLayout: React.FC = () => {
    const { currentUser, getUserRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const userRole = getUserRole(currentUser);

    const mainDashboardPaths = ['/', '/director-dashboard'];
    const isEventDashboard = /^\/event\/.+\/dashboard$/.test(location.pathname);
    const showBackButton = !mainDashboardPaths.includes(location.pathname) && !isEventDashboard;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 z-10">
           <div className="flex justify-between items-center">
             <div>
                {showBackButton && (
                  <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
                  >
                      <ArrowLeft size={16} className="mr-2" />
                      Back
                  </button>
                )}
             </div>
             <div className="flex items-center gap-4">
                <NotificationsDropdown />
                <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-md">
                    <div className="text-right">
                        <p className="font-semibold text-gray-800 text-sm">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500">{userRole?.name}</p>
                    </div>
                    <UserCircle className="h-9 w-9 text-gray-400" />
                </Link>
             </div>
           </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="h-full">
            <div className="page-content-wrapper" key={location.key}>
                <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
