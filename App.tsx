
import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AttendanceProvider } from './context/AttendanceContext';
import RegistrationPage from './pages/RegistrationPage';
import ScannerPage from './pages/ScannerPage';
import SummaryPage from './pages/SummaryPage';
import { UserPlus, QrCode, ClipboardList, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const NavButton = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isActive ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-600 hover:bg-brand-light hover:text-brand-dark'
        }`
      }
    >
      {icon}
      <span className="mt-1 sm:mt-0">{label}</span>
    </NavLink>
  );

  return (
    <AttendanceProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <header className="bg-white shadow-md w-full p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-brand-primary" />
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Event Attendance System
                </h1>
              </div>
            </div>
          </header>

          <div className="flex-grow max-w-6xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6">
            <aside className="md:w-64 flex-shrink-0">
              <nav className="sticky top-4 bg-white p-4 rounded-xl shadow-md">
                <ul className="flex flex-row md:flex-col justify-around md:justify-start gap-2">
                  <li><NavButton to="/" icon={<UserPlus size={20} />} label="Register" /></li>
                  <li><NavButton to="/scan" icon={<QrCode size={20} />} label="Scan" /></li>
                  <li><NavButton to="/summary" icon={<ClipboardList size={20} />} label="Summary" /></li>
                </ul>
              </nav>
            </aside>
            <main className="flex-grow bg-white p-6 rounded-xl shadow-md overflow-auto">
              <Routes>
                <Route path="/" element={<RegistrationPage />} />
                <Route path="/scan" element={<ScannerPage />} />
                <Route path="/summary" element={<SummaryPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </AttendanceProvider>
  );
};

export default App;
