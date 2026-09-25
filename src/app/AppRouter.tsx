import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { CreateApplicationPage } from '../pages/CreateApplicationPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/applications/new" replace />} />
        <Route path="/applications/new" element={<CreateApplicationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
