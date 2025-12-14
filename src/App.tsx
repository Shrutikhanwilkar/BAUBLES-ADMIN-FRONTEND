import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AdminProfile from "./pages/AdminProfile";
import Users from "./pages/Users";
import Support from "./pages/Support";
import Gifts from "./pages/Gifts";
import Categories from "./pages/Categories";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import MusicLibrary from "./pages/MusicLibrary";
import AudioBooks from "./pages/AudioBook";
import AdminManagement from "./pages/AdminManagement";
import VersionControl from "./pages/VersionControl";
import Reports from "./pages/Reports";
import ReportCategoryDetail from "./pages/ReportsCategoryDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/users" element={<Users />} />
            <Route path="/admin-management" element={<AdminManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/category/:categoryId" element={<ReportCategoryDetail />} />
            <Route path="/support" element={<Support />} />
            <Route path="/audiobooks" element={<AudioBooks />} />
            <Route path="/musiclibrary" element={<MusicLibrary />} />
            <Route path="/gifts" element={<Gifts />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/version-control" element={<VersionControl />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;