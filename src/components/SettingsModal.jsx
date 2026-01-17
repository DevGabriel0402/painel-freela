import Modal from "./Modal";
import { Card, Grid, Input, Select, Row, Button, CardTitle } from "./ui";

export default function SettingsModal({ open, onClose, settings, onSave }) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configurações"
      subtitle="Preferências do painel (salvas no navegador)"
    >
      <Card>
        <Grid $cols="1fr 1fr" $colsMobile="1fr">
          <div>
            <CardTitle>Moeda</CardTitle>
            <Select
              value={settings.currency}
              onChange={(e) => onSave({ ...settings, currency: e.target.value })}
            >
              <option value="BRL">BRL (R$)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </Select>
          </div>

          <div>
            <CardTitle>Meta mensal</CardTitle>
            <Input
              value={settings.monthlyGoal}
              onChange={(e) =>
                onSave({ ...settings, monthlyGoal: Number(e.target.value || 0) })
              }
              inputMode="numeric"
              placeholder="Ex: 6000"
            />
          </div>
        </Grid>

        <div style={{ marginTop: 12 }}>
          <CardTitle>Fluxo de caixa padrão</CardTitle>
          <Select
            value={settings.cashflowDefaultMode}
            onChange={(e) => onSave({ ...settings, cashflowDefaultMode: e.target.value })}
          >
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </Select>
        </div>

        <Row $between style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Você pode alterar isso quando quiser.
          </div>
          <Row>
            <Button type="button" onClick={onClose}>
              Fechar
            </Button>
          </Row>
        </Row>
      </Card>
    </Modal>
  );
}
