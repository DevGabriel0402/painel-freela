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
  Lock,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../app/useLocalStorage";
import { usePrivacy } from "../app/privacy";
import { logout } from "../app/auth";
import { NAV_ITEMS } from "../app/navItems";
import { isLocked } from "../app/permissions";

export default function Layout({ children, mode, onToggleMode, settings, permissions }) {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar_collapsed_v1", false);
  const location = useLocation();
  const navigate = useNavigate();
  const { privacyOn, togglePrivacy } = usePrivacy();

  const appName = settings?.appName || "Painel Freela";
  const appDescription = settings?.appDescription || "LocalStorage • MVP";
  const logoUrl = (settings?.logoUrl || "").trim();

  // Permissões
  const perms = permissions || {};
  const isAdmin = perms.admin;

  // Quantos itens no mobile? (NAV_ITEMS + Admin se houver)
  const count = NAV_ITEMS.length + (isAdmin ? 1 : 0);

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
            : location.pathname.startsWith("/locked")
              ? "Acesso Negado"
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
          {NAV_ITEMS.map((item) => {
            const locked = isLocked(perms, item.key);
            const active = location.pathname.startsWith(item.path);

            return (
              <NavItem
                key={item.key}
                as={locked ? "button" : NavLink}
                to={locked ? undefined : item.path}
                $collapsed={collapsed}
                $locked={locked}
                $active={active && !locked}
                className={active && !locked ? "active" : ""}
                onClick={(e) => {
                  if (locked) {
                    e.preventDefault();
                    navigate(`/locked?to=${encodeURIComponent(item.path)}`);
                  }
                }}
              >
                <item.icon size={18} />
                {!collapsed ? <span>{item.label}</span> : null}
                {locked && !collapsed && <Lock size={14} style={{ marginLeft: 'auto' }} />}
              </NavItem>
            )
          })}

          {isAdmin && (
            <NavItem
              as={NavLink}
              to="/admin"
              title="Administração"
              $collapsed={collapsed}
              className={location.pathname.startsWith("/admin") ? "active" : ""}
            >
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

      <MobileNav $count={count}>
        {(() => {
          const items = [...NAV_ITEMS];
          if (isAdmin) {
            // Inserir Admin no meio (index 2)
            items.splice(2, 0, {
              key: 'admin',
              label: 'Admin',
              path: '/admin',
              icon: Shield,
              isSpecial: true
            });
          }

          return items.map((item) => {
            // Se for special (Admin), não checa lock normal (pois é controlado por isAdmin)
            // Se não for special, checa permissions
            const locked = !item.isSpecial && isLocked(perms, item.key);
            const active = location.pathname.startsWith(item.path);

            return (
              <MobileItem
                key={item.key}
                as={locked ? "button" : NavLink}
                to={locked ? undefined : item.path}
                $locked={locked}
                $special={item.isSpecial}
                className={active && !locked ? "active" : ""}
                onClick={(e) => {
                  if (locked) {
                    e.preventDefault();
                    navigate(`/locked?to=${encodeURIComponent(item.path)}`);
                  }
                }}
              >
                <div style={{ position: 'relative' }}>
                  <item.icon size={item.isSpecial ? 24 : 20} className="icon-main" />
                  {locked && (
                    <div style={{
                      position: 'absolute',
                      right: -6, top: -6,
                      background: 'white',
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      width: 14, height: 14,
                      border: '1px solid #ccc'
                    }}>
                      <Lock size={10} color="black" />
                    </div>
                  )}
                </div>
                {!item.isSpecial && <small>{item.label.slice(0, 4)}</small>}
              </MobileItem>
            );
          });
        })()}
      </MobileNav>
    </Shell>
  );
}

/* ============ styled ============ */

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
  overflow: visible; /* Necessário para o item ativo "sair" da sidebar */
  z-index: 10;

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
  position: relative;

  padding: ${({ $collapsed }) => ($collapsed ? "12px" : "12px 14px")};
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};

  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent; 
  background: transparent;
  /* Cor base dos ícones/texto: Muted adapta (cinza claro no dark, cinza escuro no light) */
  color: ${({ theme }) => theme.colors.muted};
  text-decoration: none;

  cursor: pointer;
  transition: all 0.15s ease;

  &.active {
    background: ${({ theme }) => theme.colors.bg};
    /* Active no Desktop: Usa a cor de texto padrão (Branco no Dark, Preto no Light) ou Accent? 
       O usuário pediu "de acordo com o modo", então cor de texto forte é mais seguro que accent se o accent for fixo. 
       Mas theme.colors.accent adapta? Sim. Vou usar theme.colors.text para garantir contraste máximo. */
    color: ${({ theme }) => theme.colors.text}; // ou theme.colors.accent se preferir c/ cor
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-right-color: ${({ theme }) => theme.colors.bg}; 
    
    margin-right: -15px; 
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    z-index: 5;
    
    box-shadow: -4px 4px 12px rgba(0,0,0,0.03);
  }

  ${({ $locked }) =>
    $locked &&
    `
    opacity: 0.6;
    cursor: default; 
    border: 1px dashed ${({ theme }) => theme.colors.border};
    &:hover { transform: none; filter: none; border-color: inherit; }
    &.active {
        background: transparent;
        border: 1px dashed ${({ theme }) => theme.colors.border};
        margin-right: 0;
        border-radius: ${({ theme }) => theme.radius.sm};
    }
  `}

  span {
    font-weight: 700;
  }

  &:hover {
    ${({ $locked }) => !$locked && `
        background: ${({ theme }) => theme.colors.surface2};
        color: ${({ theme }) => theme.colors.text};
    `}
  }
  
  &.active:hover {
     background: ${({ theme }) => theme.colors.bg};
     color: ${({ theme }) => theme.colors.text};
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
  bottom: 0px; 
  left: 0;
  right: 0;
  z-index: 99;

  display: none;

  /* Grid: se tiver 5 itens, o 3º fica no meio. */
  grid-template-columns: repeat(${({ $count }) => $count || 1}, 1fr);

  gap: 6px;
  padding: 12px 10px 24px 10px; /* Mais padding embaixo pra safe area do iOS */

  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(18, 18, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)'};
  backdrop-filter: blur(16px);
  
  @media (max-width: 920px) {
    display: grid;
  }
`;

const MobileItem = styled(NavLink)`
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 4px;
  padding: 8px;

  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid transparent;
  background: transparent;
  // Dark: Brancos (com transp), Light: Pretos (com transp)
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  small {
    font-size: 10px;
    font-weight: 500;
  }

  &.active {
    // Dark: Branco total, Light: Preto total
    color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#000000'};
    background: transparent; 
    font-weight: 700;
    
    small {
      font-weight: 700;
    }
  }

  ${({ $locked }) =>
    $locked &&
    `
    opacity: 0.3;
    cursor: default;
    filter: grayscale(1);
  `}

  /* ESTILO ESPECIAL (ADMIN) */
  ${({ $special, theme }) =>
    $special &&
    `
    background: #FFD600 !important; /* Amarelo forte */
    color: #000 !important; /* Texto preto sempre */
    border-radius: 22px;
    transform: translateY(-20px); 
    box-shadow: 0 6px 16px rgba(255, 214, 0, 0.45);
    height: 64px;
    width: 64px;
    margin: 0 auto; 
    border: 3px solid ${theme.colors.bg}; 
    display: flex;
    justify-content: center;
    
    .icon-main {
      width: 30px;
      height: 30px;
    }
    
    &:hover {
      transform: translateY(-22px) scale(1.05);
      box-shadow: 0 10px 24px rgba(255, 214, 0, 0.55);
    }
    
    &.active {
       background: #FFD600 !important;
       color: #000 !important;
    }
  `}

  &:hover {
    ${({ $locked, $special, theme }) =>
    !$locked &&
    !$special &&
    `
      // Hover tbm se adapta
      color: ${theme.mode === 'dark' ? '#ffffff' : '#000000'};
    `}
  }
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  display: block;
`;
