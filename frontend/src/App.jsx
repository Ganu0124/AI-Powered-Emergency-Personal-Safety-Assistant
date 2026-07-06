import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  AlertTriangle,
  Pill,
  FileText,
  MapPin,
  Phone,
  Menu,
  X,
} from 'lucide-react';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant';
import Home from './pages/Home';
import Emergency from './pages/Emergency';
import Medicine from './pages/Medicine';
import Reports from './pages/Reports';
import Hospitals from './pages/Hospitals';
import SOS from './pages/SOS';
import { t as translate } from './i18n/translations';

const navItems = [
  { path: '/', icon: HomeIcon, tKey: 'nav.home' },
  { path: '/emergency', icon: AlertTriangle, tKey: 'nav.emergency' },
  { path: '/medicine', icon: Pill, tKey: 'nav.medicine' },
  { path: '/reports', icon: FileText, tKey: 'nav.reports' },
  { path: '/hospitals', icon: MapPin, tKey: 'nav.hospitals' },
  { path: '/sos', icon: Phone, tKey: 'nav.sos' },
];

function Layout({ children, language, onLanguageChange, t }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* Mobile menu toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="mobile-menu-toggle"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛡️</div>
          <div className="sidebar-logo-text">
            AI <span>LifeAssist</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                id={`nav-${item.tKey.split('.')[1]}`}
              >
                <Icon className="sidebar-link-icon" size={20} />
                <span>{t(item.tKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <LanguageSelector
            language={language}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        {children}
      </main>

      {/* Voice Assistant FAB */}
      <VoiceAssistant language={language} t={t} />

      {/* Floating SOS Button (visible on non-SOS pages) */}
      {location.pathname !== '/sos' && (
        <div className="sos-floating">
          <NavLink to="/sos">
            <button className="sos-button" id="floating-sos-btn" title="Emergency SOS">
              SOS
            </button>
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('lifeassist-lang') || 'en';
  });

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('lifeassist-lang', lang);
  }, []);

  // Translation helper
  const t = useCallback(
    (path) => {
      const result = translate(language, path);
      return result;
    },
    [language]
  );

  return (
    <BrowserRouter>
      <Layout
        language={language}
        onLanguageChange={handleLanguageChange}
        t={t}
      >
        <Routes>
          <Route path="/" element={<Home t={t} />} />
          <Route path="/emergency" element={<Emergency language={language} t={t} />} />
          <Route path="/medicine" element={<Medicine language={language} t={t} />} />
          <Route path="/reports" element={<Reports language={language} t={t} />} />
          <Route path="/hospitals" element={<Hospitals language={language} t={t} />} />
          <Route path="/sos" element={<SOS language={language} t={t} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
