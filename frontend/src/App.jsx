import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import CandidateListPage from "./pages/CandidateListPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";

import ProtectedRoute from "./utils/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CandidateListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidates/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CandidateDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
