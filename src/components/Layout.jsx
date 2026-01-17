import styled from "styled-components";
import {
  Briefcase,
  Users,
  LayoutGrid,
  ChartNoAxesCombined,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Eye,
  EyeOff,
  LogOut,
  Shield,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../app/useLocalStorage";
import { usePrivacy } from "../app/privacy";
import { logout } from "../app/auth";

export default function Layout({ children, mode, onToggleMode, settings, permissions }) {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar_collapsed_v1", false);
  const location = useLocation();
  const navigate = useNavigate();
  const { privacyOn, togglePrivacy } = usePrivacy();

  const appName = settings?.appName || "Painel Freela";
  const appDescription = settings?.appDescription || "LocalStorage • MVP";
  const logoUrl = (settings?.logoUrl || "").trim();

  // Definição clara de permissões
  const perms = {
    dashboard: permissions?.dashboard !== false,
    jobs: permissions?.jobs !== false,
    clientes: permissions?.clientes !== false,
    settings: permissions?.settings !== false,
    admin: Boolean(permissions?.admin),
  };

  // Cálculo dinâmico de quantos itens serão exibidos no menu
  const visibleItemsCount = Object.values(perms).filter(Boolean).length;

  const title = location.pathname.startsWith("/dashboard")
    ? "Dashboard"
    : location.pathname.startsWith("/jobs")
      ? "Jobs"
      : location.pathname.startsWith("/clientes")
        ? "Clientes"
        : location.pathname.startsWith("/settings")
          ? "Configurações"
          : location.pathname.startsWith("/admin")
            ? "Administração"
            : "Painel";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Shell $collapsed={collapsed}>
      <Sidebar $collapsed={collapsed}>
        <Brand $collapsed={collapsed}>
          <Logo>
            {logoUrl ? (
              <LogoImg
                src={logoUrl}
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <LayoutGrid size={18} />
            )}
          </Logo>

          {!collapsed ? (
            <div>
              <BrandTitle>{appName}</BrandTitle>
              <BrandSub>{appDescription}</BrandSub>
            </div>
          ) : null}
        </Brand>

        <Nav>
          {perms.dashboard && (
            <NavItem to="/dashboard" title="Dashboard" $collapsed={collapsed}>
              <ChartNoAxesCombined size={18} />
              {!collapsed ? <span>Dashboard</span> : null}
            </NavItem>
          )}

          {perms.jobs && (
            <NavItem to="/jobs" title="Jobs" $collapsed={collapsed}>
              <Briefcase size={18} />
              {!collapsed ? <span>Jobs</span> : null}
            </NavItem>
          )}

          {perms.clientes && (
            <NavItem to="/clientes" title="Clientes" $collapsed={collapsed}>
              <Users size={18} />
              {!collapsed ? <span>Clientes</span> : null}
            </NavItem>
          )}

          {perms.settings && (
            <NavItem to="/settings" title="Configurações" $collapsed={collapsed}>
              <Settings size={18} />
              {!collapsed ? <span>Configurações</span> : null}
            </NavItem>
          )}

          {perms.admin && (
            <NavItem to="/admin" title="Administração" $collapsed={collapsed}>
              <Shield size={18} />
              {!collapsed ? <span>Administração</span> : null}
            </NavItem>
          )}
        </Nav>

        <SideFooter $collapsed={collapsed}>
          <FooterActions $collapsed={collapsed}>
            <FooterBtn
              $collapsed={collapsed}
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? "Expandir menu" : "Recolher menu"}
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {!collapsed ? <span>{collapsed ? "Expandir" : "Recolher"}</span> : null}
            </FooterBtn>
          </FooterActions>

          {!collapsed ? <Hint>Dados salvos neste navegador.</Hint> : null}
        </SideFooter>
      </Sidebar>

      <Main>
        <TopBar>
          <TopTitle>
            <DesktopTitle>{title}</DesktopTitle>
            <MobileTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="logo"
                    style={{ maxHeight: 24, borderRadius: 6 }}
                  />
                ) : (
                  <LayoutGrid size={20} />
                )}
                {appName}
              </div>
            </MobileTitle>
          </TopTitle>

          <TopActions>
            <TopThemeBtn
              onClick={togglePrivacy}
              title={privacyOn ? "Mostrar valores" : "Ocultar valores"}
              aria-label={
                privacyOn ? "Desativar modo privacidade" : "Ativar modo privacidade"
              }
            >
              {privacyOn ? <EyeOff size={18} /> : <Eye size={18} />}
            </TopThemeBtn>
            <TopThemeBtn onClick={onToggleMode} title="Alternar tema">
              {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </TopThemeBtn>
            <TopThemeBtn onClick={handleLogout} title="Sair">
              <LogOut size={18} />
            </TopThemeBtn>
          </TopActions>
        </TopBar>

        <Content>{children}</Content>
      </Main>

      {/* AQUI ESTÁ A CORREÇÃO: Passando o count para o CSS */}
      <MobileNav $count={visibleItemsCount}>
        {perms.dashboard && (
          <MobileItem to="/dashboard">
            <ChartNoAxesCombined size={20} />
            <small>Dash</small>
          </MobileItem>
        )}

        {perms.jobs && (
          <MobileItem to="/jobs">
            <Briefcase size={20} />
            <small>Jobs</small>
          </MobileItem>
        )}

        {perms.clientes && (
          <MobileItem to="/clientes">
            <Users size={20} />
            <small>Clientes</small>
          </MobileItem>
        )}

        {perms.settings && (
          <MobileItem to="/settings">
            <Settings size={20} />
            <small>Config</small>
          </MobileItem>
        )}

        {perms.admin && (
          <MobileItem to="/admin">
            <Shield size={20} />
            <small>Admin</small>
          </MobileItem>
        )}
      </MobileNav>
    </Shell>
  );
}

/* ============ styled ============ */

const Shell = styled.div`
  display: flex;
  min-height: 100vh;

  @media (max-width: 920px) {
    display: block;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 0;
  height: 100vh;
  width: ${({ $collapsed }) => ($collapsed ? "92px" : "320px")};
  transition: width 220ms ease;
  padding: 14px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(14px);
  overflow: hidden;

  @media (max-width: 920px) {
    display: none;
  }
`;

const Brand = styled.div`
  position: relative;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.colors.accentSoft};
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
`;

const Logo = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.accentSoft};
`;

const BrandTitle = styled.div`
  font-weight: 900;
  letter-spacing: 0.2px;
  white-space: nowrap;
`;

const BrandSub = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 2px;
  white-space: nowrap;
`;

const Nav = styled.nav`
  display: grid;
  gap: 10px;
  margin-top: 12px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  gap: 10px;
  align-items: center;

  padding: ${({ $collapsed }) => ($collapsed ? "12px" : "12px 14px")};
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};

  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;

  cursor: pointer;
  transition:
    transform 0.12s ease,
    filter 0.12s ease,
    background 0.12s ease,
    border-color 0.12s ease;

  &.active {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }

  span {
    font-weight: 700;
  }

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }
  &:active {
    transform: translateY(0px);
  }
`;

const SideFooter = styled.div`
  margin-top: auto;
  padding: ${({ $collapsed }) => ($collapsed ? "10px 0" : "14px 6px")};
  display: grid;
  align-items: center;
  gap: 10px;
`;

const FooterActions = styled.div`
  display: grid;
  gap: 10px;
`;

const FooterBtn = styled.button`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};

  cursor: pointer;
  transition:
    transform 0.12s ease,
    filter 0.12s ease;

  span {
    font-weight: 700;
  }

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }
  &:active {
    transform: translateY(0px);
  }
`;

const Hint = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  padding: 16px;
  background: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;

  @media (max-width: 920px) {
    padding-bottom: 90px;
  }
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 12px 10px;
  margin: -16px -16px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(14px);
`;

const TopTitle = styled.div`
  font-weight: 950;
  letter-spacing: 0.2px;
`;

const DesktopTitle = styled.span`
  @media (max-width: 920px) {
    display: none;
  }
`;

const MobileTitle = styled.span`
  display: none;
  @media (max-width: 920px) {
    display: inline;
  }
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TopThemeBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;

  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};

  cursor: pointer;
  transition: transform 0.12s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const MobileNav = styled.nav`
  position: fixed;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 99;

  display: none;

  /* CORREÇÃO AQUI: Grid dinâmico baseado no número de itens */
  grid-template-columns: repeat(${({ $count }) => $count || 1}, 1fr);

  gap: 10px;
  padding: 10px;

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(14px);

  @media (max-width: 920px) {
    display: grid;
  }
`;

const MobileItem = styled(NavLink)`
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 10px 8px;

  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  cursor: pointer;

  small {
    font-size: 11px;
    opacity: 0.9;
  }

  &.active {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }

  &:hover {
    filter: brightness(1.05);
  }
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  display: block;
`;
