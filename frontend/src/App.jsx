import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

import HubPage from './pages/public/HubPage';
import AboutPage from './pages/public/AboutPage';
import SchedulePage from './pages/public/SchedulePage';
import BooksPage from './pages/public/BooksPage';
import NewBooksPage from './pages/public/NewBooksPage';
import ServicesPage from './pages/public/ServicesPage';

import LoginPage from './pages/admin/LoginPage';
import SyncPage from './pages/admin/SyncPage';
import AdminNewBooksPage from './pages/admin/AdminNewBooksPage';
import AdminSchedulesPage from './pages/admin/AdminSchedulesPage';
import SuggestionsPage from './pages/admin/SuggestionsPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('tvdl_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Hub (no navbar) */}
        <Route path="/" element={<HubPage />} />

        {/* Public pages */}
        <Route element={<PublicLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/search" element={<BooksPage />} />
          <Route path="/new-books" element={<NewBooksPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/news" element={<ServicesPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/admin/sync" replace />} />
          <Route path="sync" element={<SyncPage />} />
          <Route path="new-books" element={<AdminNewBooksPage />} />
          <Route path="schedules" element={<AdminSchedulesPage />} />
          <Route path="suggestions" element={<SuggestionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
