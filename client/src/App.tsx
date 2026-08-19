import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import IntakePage from "@/pages/IntakePage";
import ManualIntakePage from "@/pages/ManualIntakePage";
import LabelFirstIntakePage from "@/pages/LabelFirstIntakePage";
import PickupPage from "@/pages/PickupPage";
import PackagesPage from "@/pages/PackagesPage";
import RecipientsPage from "@/pages/RecipientsPage";
import RegisteredUsersPage from "@/pages/RegisteredUsersPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import RequireAuth from "@/components/RequireAuth";
import RequireAdmin from "@/components/RequireAdmin";
import MyPackagesPage from "@/pages/MyPackagesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="auth" element={<AuthPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="my-packages" element={<MyPackagesPage />} />
              <Route element={<RequireAdmin />}>
                <Route index element={<DashboardPage />} />
                <Route path="intake" element={<IntakePage />} />
                <Route path="intake/manual" element={<ManualIntakePage />} />
                <Route path="intake/label" element={<LabelFirstIntakePage />} />
                <Route path="pickup" element={<PickupPage />} />
                <Route path="packages" element={<PackagesPage />} />
                <Route path="recipients" element={<RecipientsPage />} />
                <Route path="users" element={<RegisteredUsersPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
