import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyles";
import Layout from "./components/Layout";
import Clientes from "./pages/Clientes";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Jobs from "./pages/Jobs";
import Settings from "./pages/Settings";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { uid } from "./app/storage";
import { useLocalStorage } from "./app/useLocalStorage";
import { defaultSettings, mergeSettings, clampHex } from "./app/defaultSettings";
import { makeTheme } from "./styles/theme";
import { PrivacyContext } from "./app/privacy";
import { useAuth } from "./app/auth";
import {
  subscribeData,
  addClientFS,
  removeClientFS,
  updateClientFS,
  addJobFS,
  updateJobFS,
  removeJobFS,
  saveSettingsFS,
} from "./app/firestore";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  // Estado único para dados vindos do Firestore
  const [data, setData] = useState({ clients: [], jobs: [], settings: null });

  // Sync com Firestore quando usuário estiver logado
  useEffect(() => {
    if (!user) {
      setData({ clients: [], jobs: [], settings: null });
      return;
    }
    const unsub = subscribeData(user.uid, (newData) => {
      setData(newData);
    });
    return () => unsub();
  }, [user]);

  // Tema UI (Dark/Light) e Privacidade podem continuar locais (por dispositivo)
  const [mode, setMode] = useLocalStorage("ui_mode_v1", "dark");
  const [privacyOn, setPrivacyOn] = useLocalStorage("ui_privacy_v1", false);

  // Settings de Negócio (Nome do App, Cor, etc) agora vêm do Firestore
  // Se não vier nada do banco (null), usa default
  const settings = useMemo(() => {
    return mergeSettings(data.settings || defaultSettings);
  }, [data.settings]);

  // Sync mode from settings if available (Firestore wins over LocalStorage when changed)
  useEffect(() => {
    if (settings?.mode) {
      setMode(settings.mode);
    }
  }, [settings?.mode]);

  // aplica cor de destaque escolhida (hex) no tema inteiro
  const theme = useMemo(() => {
    return makeTheme({ mode, accent: clampHex(settings.accent) });
  }, [mode, settings.accent]);

  function toggleMode() {
    const nextMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);

    // Se estiver logado, salva preferência no Firestore
    if (user && data.settings) {
      saveSettingsFS(user.uid, { mode: nextMode });
    }
  }

  function saveSettings(next) {
    // Salva no Firestore em vez de LocalStorage
    if (user) {
      const toSave = mergeSettings({ ...next, accent: clampHex(next?.accent) });
      saveSettingsFS(user.uid, toSave);
    }
  }

  function togglePrivacy() {
    setPrivacyOn((v) => !v);
  }

  // Nome do painel = nome do site
  useEffect(() => {
    const name = (settings?.appName || "Painel Freela").trim();
    document.title = name || "Painel";
  }, [settings?.appName]);

  // aplica classe no body para blur
  useEffect(() => {
    document.body.classList.toggle("privacy-on", Boolean(privacyOn));
  }, [privacyOn]);

  // Logo (url) também vira favicon
  useEffect(() => {
    const url = (settings?.logoUrl || "").trim();
    if (!url) return;

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);
  }, [settings?.logoUrl]);

  const clients = data.clients || [];
  const jobs = data.jobs || [];

  // Wrappers para chamar funções do Firestore passando o UID
  function addClient(payload) {
    if (user) addClientFS(user.uid, payload);
  }
  function removeClient(clientId) {
    if (user) removeClientFS(user.uid, clientId);
  }
  function updateClient(clientId, patch) {
    if (user) updateClientFS(user.uid, clientId, patch);
  }

  function addJob(payload) {
    if (user) addJobFS(user.uid, payload);
  }
  function togglePaid(jobId) {
    if (!user) return;
    const job = jobs.find((j) => j.id === jobId);
    if (job) updateJobFS(user.uid, jobId, { paid: !job.paid });
  }
  function updateStatus(jobId, status) {
    if (user) updateJobFS(user.uid, jobId, { status });
  }
  function updateJob(jobId, patch) {
    if (user) updateJobFS(user.uid, jobId, patch);
  }
  function removeJob(jobId) {
    if (user) removeJobFS(user.uid, jobId);
  }

  if (loading) return null; // Evita flash de conteúdo

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
                <Layout mode={mode} onToggleMode={toggleMode} settings={settings}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route
                      path="/dashboard"
                      element={
                        <Dashboard jobs={jobs} clients={clients} settings={settings} />
                      }
                    />
                    <Route
                      path="/clientes"
                      element={
                        <Clientes
                          clients={clients}
                          onAddClient={addClient}
                          onRemoveClient={removeClient}
                          onUpdateClient={updateClient}
                        />
                      }
                    />
                    <Route
                      path="/jobs"
                      element={
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
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <Settings
                          settings={settings}
                          onSave={saveSettings}
                          mode={mode}
                          onToggleMode={toggleMode}
                        />
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
    </ThemeProvider>
  );
}
