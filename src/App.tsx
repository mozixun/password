import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store";
import { useThemeEffect } from "@/hooks/useTheme";
import Login from "@/pages/Login";
import Unlock from "@/pages/Unlock";
import Dashboard from "@/pages/Dashboard";
import Items from "@/pages/Items";
import ItemDetail from "@/pages/ItemDetail";
import Generator from "@/pages/Generator";
import Authenticator from "@/pages/Authenticator";
import Watchtower from "@/pages/Watchtower";
import Settings from "@/pages/Settings";
import Vaults from "@/pages/Vaults";
import AdminSettings from "@/pages/AdminSettings";
import Profile from "@/pages/Profile";

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
      <Routes>
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
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
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
    </Router>
  );
}
