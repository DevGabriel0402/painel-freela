import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Page,
  Card,
  CardTitle,
  Grid,
  Input,
  Select,
  Row,
  Button,
  Pill,
} from "../components/ui";
import { Palette, Target, UserRound, RotateCcw, Moon, Sun, Save } from "lucide-react";
import { defaultSettings, mergeSettings, clampHex } from "../app/defaultSettings";

export default function Settings({ settings, onSave, mode, onToggleMode }) {
  // Trabalha com um rascunho local e só salva quando clicar em "Salvar"
  const [draft, setDraft] = useState(() => mergeSettings(settings));

  useEffect(() => {
    setDraft(mergeSettings(settings));
  }, [settings]);

  const isDirty = useMemo(() => {
    const a = JSON.stringify(mergeSettings(settings));
    const b = JSON.stringify(mergeSettings(draft));
    return a !== b;
  }, [settings, draft]);

  function set(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function reset() {
    setDraft(defaultSettings);
  }

  function save() {
    onSave(mergeSettings({ ...draft, accent: clampHex(draft.accent) }));
  }

  const currencyLabel =
    draft.currency === "USD" ? "$" : draft.currency === "EUR" ? "€" : "R$";

  return (
    <Page>
      <Header>
        <div>
          <Title>Configurações</Title>
          <Sub>
            As alterações só são aplicadas quando você clicar em <b>Salvar</b>.
          </Sub>
        </div>

        <Row>
          <Button type="button" onClick={onToggleMode}>
            {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
            {mode === "light" ? "Dark" : "Light"}
          </Button>

          <Button type="button" onClick={reset} title="Voltar para o padrão">
            <RotateCcw size={18} /> Reset
          </Button>

          <Button type="button" $variant="primary" onClick={save} disabled={!isDirty}>
            <Save size={18} /> Salvar
          </Button>
        </Row>
      </Header>

      <Grid $cols="1fr 1fr" $colsMobile="1fr">
        <Card>
          <Row>
            <Icon>
              <UserRound size={18} />
            </Icon>
            <div>
              <div style={{ fontWeight: 900 }}>Identidade</div>
              <CardTitle>Nome do sistema e preferências básicas</CardTitle>
            </div>
          </Row>

          <div style={{ marginTop: 14 }}>
            <CardTitle>Nome do painel</CardTitle>
            <Input
              value={draft.appName || ""}
              onChange={(e) => set({ appName: e.target.value })}
              placeholder="Ex: Painel Freela"
            />
          </div>
          <div style={{ marginTop: 14 }}>
            <CardTitle>Area</CardTitle>
            <Input
              value={draft.appDescription || ""}
              onChange={(e) => set({ appDescription: e.target.value })}
              placeholder="Ex: LocalStorage • MVP"
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <CardTitle>Logo (URL)</CardTitle>
            <Input
              value={draft.logoUrl || ""}
              onChange={(e) => set({ logoUrl: e.target.value })}
              placeholder="https://.../logo.png"
            />
            <Help>
              Se você definir uma logo, ela substitui o ícone do painel e também vira o favicon do site.
            </Help>
          </div>
        </Card>

        <Card>
          <Row $between>
            <Row>
              <Icon>
                <Palette size={18} />
              </Icon>
              <div>
                <div style={{ fontWeight: 900 }}>Aparência</div>
                <CardTitle>Cor do sistema (accent) e tema</CardTitle>
              </div>
            </Row>

            <Pill
              title={clampHex(draft.accent)}
              style={{
                borderColor: clampHex(draft.accent),
                background: "transparent",
                color: "inherit",
              }}
            >
              {clampHex(draft.accent)}
            </Pill>
          </Row>

          <div style={{ marginTop: 14 }}>
            <CardTitle>Cor do sistema</CardTitle>
            <Row $gap="12px">
              <ColorInput
                type="color"
                value={clampHex(draft.accent)}
                onChange={(e) => set({ accent: e.target.value })}
                aria-label="Selecionar cor do sistema"
              />
              <Input
                value={clampHex(draft.accent)}
                onChange={(e) => set({ accent: e.target.value })}
                placeholder="#111111"
              />
            </Row>
            <Help>Essa cor afeta botões, itens ativos do menu e gráficos.</Help>
          </div>
        </Card>

        <Card>
          <Row>
            <Icon>
              <Target size={18} />
            </Icon>
            <div>
              <div style={{ fontWeight: 900 }}>Financeiro</div>
              <CardTitle>Meta mensal, moeda e relatórios</CardTitle>
            </div>
          </Row>

          <Grid $cols="1fr 1fr" $colsMobile="1fr" style={{ marginTop: 14 }}>
            <div>
              <CardTitle>Moeda</CardTitle>
              <Select
                value={draft.currency || "BRL"}
                onChange={(e) => set({ currency: e.target.value })}
              >
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </Select>
            </div>

            <div>
              <CardTitle>Meta mensal ({currencyLabel})</CardTitle>
              <Input
                value={String(draft.monthlyGoal ?? "")}
                onChange={(e) => set({ monthlyGoal: Number(e.target.value || 0) })}
                inputMode="numeric"
                placeholder="Ex: 6000"
              />
            </div>
          </Grid>

          <div style={{ marginTop: 12 }}>
            <CardTitle>Fluxo de caixa (padrão)</CardTitle>
            <Select
              value={draft.cashflowDefaultMode || "weekly"}
              onChange={(e) => set({ cashflowDefaultMode: e.target.value })}
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </Select>
          </div>
        </Card>
      </Grid>
    </Page>
  );
}

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 920px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.div`
  font-weight: 950;
  letter-spacing: 0.2px;
  font-size: 18px;
`;

const Sub = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Help = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Icon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
`;

const ColorInput = styled.input`
  width: 48px;
  height: 44px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.surface2};
  cursor: pointer;
`;
