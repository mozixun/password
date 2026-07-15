import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store";
import { useThemeEffect } from "@/hooks/useTheme";

const Login = lazy(() => import("@/pages/Login"));
const Unlock = lazy(() => import("@/pages/Unlock"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Items = lazy(() => import("@/pages/Items"));
const ItemDetail = lazy(() => import("@/pages/ItemDetail"));
const Generator = lazy(() => import("@/pages/Generator"));
const Authenticator = lazy(() => import("@/pages/Authenticator"));
const Watchtower = lazy(() => import("@/pages/Watchtower"));
const Settings = lazy(() => import("@/pages/Settings"));
const Vaults = lazy(() => import("@/pages/Vaults"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminLogs = lazy(() => import("@/pages/AdminLogs"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const Profile = lazy(() => import("@/pages/Profile"));
const DocsHome = lazy(() => import("@/pages/docs/DocsHome"));
const InstallationDoc = lazy(() => import("@/pages/docs/InstallationDoc"));
const UsageDoc = lazy(() => import("@/pages/docs/UsageDoc"));
const DevelopmentDoc = lazy(() => import("@/pages/docs/DevelopmentDoc"));
const ApiDoc = lazy(() => import("@/pages/docs/ApiDoc"));
const SecurityDoc = lazy(() => import("@/pages/docs/SecurityDoc"));

// 受保护路由：需要认证且已解锁
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const isLocked = useStore((s) => s.auth.isLocked);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isLocked) {
    return <Navigate to="/unlock" replace />;
  }

  return <>{children}</>;
}

// 认证路由：已登录则跳转
function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const isLocked = useStore((s) => s.auth.isLocked);

  if (isAuthenticated && !isLocked) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && isLocked) {
    return <Navigate to="/unlock" replace />;
  }

  return <>{children}</>;
}

// 解锁路由：需要已认证
function UnlockRoute() {
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <Unlock />;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem('adminToken') !== null;
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function AdminLoginRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem('adminToken') !== null;
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-bg">
      <div className="w-8 h-8 border-4 border-vault-border border-t-vault-accent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  useThemeEffect();

  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const isLocked = useStore((s) => s.auth.isLocked);
  const checkAutoLock = useStore((s) => s.auth.checkAutoLock);

  useEffect(() => {
    if (!isAuthenticated || isLocked) return;
    const interval = setInterval(() => {
      checkAutoLock();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLocked, checkAutoLock]);

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
        {/* 文档页面（公开访问） */}
        <Route path="/docs" element={<DocsHome />} />
        <Route path="/docs/installation" element={<InstallationDoc />} />
        <Route path="/docs/usage" element={<UsageDoc />} />
        <Route path="/docs/development" element={<DevelopmentDoc />} />
        <Route path="/docs/api" element={<ApiDoc />} />
        <Route path="/docs/security" element={<SecurityDoc />} />

        {/* 认证页面 */}
        <Route
          path="/auth/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        {/* 解锁页面 */}
        <Route
          path="/unlock"
          element={<UnlockRoute />}
        />

        {/* 受保护页面 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <Items />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/detail/:id"
          element={
            <ProtectedRoute>
              <ItemDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/new"
          element={
            <ProtectedRoute>
              <ItemDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:type"
          element={
            <ProtectedRoute>
              <Items />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generator"
          element={
            <ProtectedRoute>
              <Generator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authenticator"
          element={
            <ProtectedRoute>
              <Authenticator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchtower"
          element={
            <ProtectedRoute>
              <Watchtower />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/:section"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vaults"
          element={
            <ProtectedRoute>
              <Vaults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/login"
          element={
            <AdminLoginRoute>
              <AdminLogin />
            </AdminLoginRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <AdminProtectedRoute>
              <AdminLogs />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </Suspense>
    </Router>
  );
}
