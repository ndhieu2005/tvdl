import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';

import HubPage from './pages/public/HubPage';
import AboutPage from './pages/public/AboutPage';
import SchedulePage from './pages/public/SchedulePage';
import NewBooksPage from './pages/public/NewBooksPage';
import ServicesPage from './pages/public/ServicesPage';
import ContactPage from './pages/public/ContactPage';
import SuggestionPage from './pages/public/SuggestionPage';
import PostsPage from './pages/public/PostsPage';
import PostDetailPage from './pages/public/PostDetailPage';

import LoginPage from './pages/admin/LoginPage';
import AdminNewBooksPage from './pages/admin/AdminNewBooksPage';
import AdminQuotesPage from './pages/admin/AdminQuotesPage';
import AdminSchedulesPage from './pages/admin/AdminSchedulesPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import SuggestionsPage from './pages/admin/SuggestionsPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('tvdl_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <ConfirmProvider>
      <Routes>
        {/* Hub (no navbar) */}
        <Route path="/" element={<HubPage />} />

        {/* Public pages */}
        <Route element={<PublicLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/new-books" element={<NewBooksPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/news" element={<PostsPage />} />
          <Route path="/news/:slug" element={<PostDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/suggest" element={<SuggestionPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/admin/schedules" replace />} />
          <Route path="new-books" element={<AdminNewBooksPage />} />
          <Route path="quotes" element={<AdminQuotesPage />} />
          <Route path="schedules" element={<AdminSchedulesPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="suggestions" element={<SuggestionsPage />} />
        </Route>
      </Routes>
      </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
