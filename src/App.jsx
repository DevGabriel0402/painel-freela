import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyles";
import Layout from "./components/Layout";
import Clientes from "./pages/Clientes";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Locked from "./pages/Locked"; // Import Locked Page

import { Analytics } from "@vercel/analytics/react";
import toast, { Toaster } from "react-hot-toast";

import Jobs from "./pages/Jobs";
import Settings from "./pages/Settings";
import Feedback from "./pages/Feedback";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useLocalStorage } from "./app/useLocalStorage";
import { defaultSettings, mergeSettings, clampHex } from "./app/defaultSettings";
import { makeTheme } from "./styles/theme";
import { PrivacyContext } from "./app/privacy";
import { useAuth } from "./app/auth";
import { isAdminUser } from "./app/admin";
import RouteGuard from "./components/RouteGuard"; // Import RouteGuard
import {
  subscribeData,
  addClientFS,
  removeClientFS,
  updateClientFS,
  addJobFS,
  updateJobFS,
  removeJobFS,
  saveSettingsFS,
  createUserProfile,
} from "./app/firestore";
import { logout } from "./app/auth";
import LoadingScreen from "./components/LoadingScreen";
import { syncPwaAssets } from "./app/pwa";

const EMPTY_DATA = { clients: [], jobs: [], settings: null, profile: null };

// --- Route Protectors ---

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;
  return children;
}

// --- Main App Component ---

export default function App() {
  const { user, loading } = useAuth();
  const [data, setData] = useState({
    clients: [],
    jobs: [],
    settings: null,
    profile: null,
  });

  const effectiveData = user ? data : EMPTY_DATA;

  let blockedMsg = "";
  try {
    blockedMsg = !user ? window.sessionStorage.getItem("blockedMsg") || "" : "";
  } catch {
    blockedMsg = "";
  }

  // Garante que o perfil existe no Firestore
  useEffect(() => {
    if (!user) return;
    createUserProfile(user.uid, {
      email: user.email || "",
      displayName: user.displayName || "",
    }).catch(() => { });
  }, [user]);

  // Sync em tempo real com Firestore
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeData(user.uid, (newData) => {
      setData(newData);
    });
    return () => unsub();
  }, [user]);

  // Bloqueio de usuário desativado
  useEffect(() => {
    if (user && data?.profile?.disabled) {
      try {
        window.sessionStorage.setItem(
          "blockedMsg",
          "Seu acesso foi desativado pelo administrador.",
        );
      } catch {
        // ignore
      }
      logout().catch(() => { });
    }
  }, [user, data?.profile?.disabled]);

  useEffect(() => {
    if (!user) return;
    try {
      window.sessionStorage.removeItem("blockedMsg");
    } catch {
      // ignore
    }
  }, [user]);

  // UI Local States
  const [mode, setMode] = useLocalStorage("ui_mode_v1", "dark");
  const [privacyOn, setPrivacyOn] = useLocalStorage("ui_privacy_v1", false);

  // Settings de Negócio
  const settings = useMemo(() => {
    return mergeSettings(effectiveData.settings || defaultSettings);
  }, [effectiveData.settings]);

  // --- CORREÇÃO: Centralização das Permissões ---
  // Este objeto controla tanto o Layout (menu) quanto as Rotas
  const p = effectiveData?.profile?.permissions || {};
  const permissions = {
    dashboard: p.dashboard !== false,
    jobs: p.jobs !== false,
    clientes: p.clientes !== false,
    settings: p.settings !== false,
    admin: Boolean(user && isAdminUser(user)),
  };

  // Sync mode (Firestore > LocalStorage)
  useEffect(() => {
    if (settings?.mode) {
      setMode(settings.mode);
    }
  }, [settings?.mode, setMode]);

  const theme = useMemo(() => {
    return makeTheme({ mode, accent: clampHex(settings.accent) });
  }, [mode, settings.accent]);

  // --- Handlers ---

  function toggleMode() {
    const nextMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    if (user && effectiveData.settings) {
      saveSettingsFS(user.uid, { mode: nextMode });
    }
  }

  function saveSettings(next) {
    if (user) {
      const toSave = mergeSettings({ ...next, accent: clampHex(next?.accent) });
      saveSettingsFS(user.uid, toSave);
    }
  }

  function togglePrivacy() {
    setPrivacyOn((v) => !v);
  }

  // --- Document Effects ---

  useEffect(() => {
    const name = (settings?.appName || "Flowyhub").trim();
    document.title = name;
  }, [settings?.appName]);

  useEffect(() => {
    document.body.classList.toggle("privacy-on", Boolean(privacyOn));
  }, [privacyOn]);

  useEffect(() => {
    // Update mobile browser theme color
    const color = theme.colors.bg;
    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [theme.colors.bg]);

  useEffect(() => {
    syncPwaAssets({
      theme,
      appName: (settings?.appName || "Flowyhub").trim() || "Flowyhub",
    });
  }, [settings?.appName, settings?.appDescription, theme]);

  // --- Data Actions Wrappers ---

  const clients = effectiveData.clients || [];
  const jobs = effectiveData.jobs || [];

  const addClient = async (p) => {
    if (!user) return;
    await addClientFS(user.uid, p);
    toast.success("Cliente adicionado!");
  };
  const removeClient = async (id) => {
    if (!user) return;
    await removeClientFS(user.uid, id);
    toast.success("Cliente removido!");
  };
  const updateClient = async (id, patch) => {
    if (!user) return;
    await updateClientFS(user.uid, id, patch);
    toast.success("Cliente atualizado!");
  };
  const addJob = async (p) => {
    if (!user) return;
    await addJobFS(user.uid, p);
    toast.success("Job adicionado!");
  };
  const removeJob = async (id) => {
    if (!user) return;
    await removeJobFS(user.uid, id);
    toast.success("Job removido!");
  };
  const updateJob = async (id, patch) => {
    if (!user) return;
    await updateJobFS(user.uid, id, patch);
    toast.success("Job atualizado!");
  };
  const updateStatus = async (id, status) => {
    if (!user) return;
    await updateJobFS(user.uid, id, { status });
    toast.success("Status atualizado!");
  };

  async function togglePaid(jobId) {
    if (!user) return;
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      await updateJobFS(user.uid, jobId, { paid: !job.paid });
      toast.success(job.paid ? "Marcado como pendente!" : "Marcado como pago!");
    }
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  if (blockedMsg) {
    return (
      <div
        style={{
          padding: 24,
          maxWidth: 520,
          margin: "40px auto",
          fontFamily: "system-ui",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 8 }}>Acesso desativado</h2>
        <p style={{ opacity: 0.85 }}>{blockedMsg}</p>
        <p style={{ opacity: 0.7, fontSize: 13, marginTop: 12 }}>
          Se isso foi um engano, fale com o administrador.
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PrivacyContext.Provider value={{ privacyOn, togglePrivacy }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout
                  mode={mode}
                  onToggleMode={toggleMode}
                  settings={settings}
                  permissions={permissions}
                >
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/locked" element={<Locked />} />

                    <Route
                      path="/dashboard"
                      element={
                        <RouteGuard allow={permissions.dashboard}>
                          <Dashboard jobs={jobs} clients={clients} settings={settings} />
                        </RouteGuard>
                      }
                    />

                    <Route
                      path="/clientes"
                      element={
                        <RouteGuard allow={permissions.clientes}>
                          <Clientes
                            clients={clients}
                            onAddClient={addClient}
                            onRemoveClient={removeClient}
                            onUpdateClient={updateClient}
                          />
                        </RouteGuard>
                      }
                    />

                    <Route
                      path="/jobs"
                      element={
                        <RouteGuard allow={permissions.jobs}>
                          <Jobs
                            clients={clients}
                            jobs={jobs}
                            onAddJob={addJob}
                            onTogglePaid={togglePaid}
                            onRemoveJob={removeJob}
                            onUpdateStatus={updateStatus}
                            onUpdateJob={updateJob}
                            settings={settings}
                          />
                        </RouteGuard>
                      }
                    />

                    <Route
                      path="/feedback"
                      element={<Feedback profile={data.profile} />}
                    />

                    <Route
                      path="/settings"
                      element={
                        <RouteGuard allow={permissions.settings}>
                          <Settings
                            settings={settings}
                            onSave={saveSettings}
                            mode={mode}
                            onToggleMode={toggleMode}
                          />
                        </RouteGuard>
                      }
                    />

                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <Admin />
                        </AdminRoute>
                      }
                    />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </PrivacyContext.Provider>
      <Analytics />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme.colors.panel,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: theme.colors.accent,
              secondary: theme.colors.accentText,
            },
          },
          error: {
            iconTheme: {
              primary: theme.colors.danger,
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}
