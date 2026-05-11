import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import PredictionPage from "../pages/PredictionPage";
import ProfilePage from "../pages/ProfilePage";
import ScholarshipsPage from "../pages/ScholarshipsPage";
import CareerAdvisorPage from "../pages/CareerAdvisorPage";
import UniversityComparisonPage from "../pages/UniversityComparisonPage";
import MeritTrendsPage from "../pages/MeritTrendsPage";
import StudentHubPage from "../pages/StudentHubPage";
import RoadmapPage from "../pages/RoadmapPage";
import SettingsPage from "../pages/SettingsPage";
import ProtectedRoute from "./ProtectedRoute";
import LandingAfterLogin from "../pages/LandingAfterLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminUniversitiesPage from "../pages/admin/AdminUniversitiesPage";
import AdminChatbotPage from "../pages/admin/AdminChatbotPage";
import AdminMeritTrendsPage from "../pages/admin/AdminMeritTrendsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <LandingAfterLogin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="universities" element={<AdminUniversitiesPage />} />
        <Route path="chatbot" element={<AdminChatbotPage />} />
        <Route path="merit-trends" element={<AdminMeritTrendsPage />} />
      </Route>
      <Route
        path="/predict"
        element={
          <ProtectedRoute>
            <PredictionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/student-hub" element={<ProtectedRoute><StudentHubPage /></ProtectedRoute>} />
      <Route path="/scholarships" element={<ProtectedRoute><ScholarshipsPage /></ProtectedRoute>} />
      <Route path="/career-advisor" element={<ProtectedRoute><CareerAdvisorPage /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
      <Route path="/compare" element={<ProtectedRoute><UniversityComparisonPage /></ProtectedRoute>} />
      <Route path="/merit-trends" element={<ProtectedRoute><MeritTrendsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
