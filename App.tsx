import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { EventProvider } from './components/EventContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationPage from './pages/RegistrationPage';
import ScannerPage from './pages/ScannerPage';
import SummaryPage from './pages/SummaryPage';
import ManageCheckpointsPage from './pages/ManageCheckpointsPage';
import ManageAccountsPage from './pages/ManageAccountsPage';
import ProfilePage from './pages/ProfilePage';
import DirectorDashboardPage from './components/DirectorDashboardPage';
import ManageEventsPage from './components/ManageEventsPage';
import SelectEventPage from './components/SelectEventPage';
import EventDashboardPage from './pages/EventDashboardPage';
import InvitationPage from './pages/InvitationPage';
import ManageRolesPage from './pages/ManageRolesPage';
import CommunicationPage from './pages/CommunicationPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <EventProvider>
            <HashRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/invitation/:eventId/:participantId" element={<InvitationPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/register" element={<RegistrationPage />} />
                    <Route path="/scan" element={<ScannerPage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/manage-checkpoints" element={<ManageCheckpointsPage />} />
                    <Route path="/manage-accounts" element={<ManageAccountsPage />} />
                    <Route path="/manage-roles" element={<ManageRolesPage />} />
                    <Route path="/communication" element={<CommunicationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/director-dashboard" element={<DirectorDashboardPage />} />
                    <Route path="/manage-events" element={<ManageEventsPage />} />
                    <Route path="/select-event" element={<SelectEventPage />} />
                    <Route path="/event/:eventId/dashboard" element={<EventDashboardPage />} />
                  </Route>
                </Route>
              </Routes>
            </HashRouter>
          </EventProvider>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
