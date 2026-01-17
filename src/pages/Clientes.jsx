import ClientForm from "../components/ClientForm";
import ClientList from "../components/ClientList";
import { Page } from "../components/ui";

export default function Clientes({
  clients,
  onAddClient,
  onRemoveClient,
  onUpdateClient,
}) {
  return (
    <Page>
      <ClientForm onAdd={onAddClient} />
      <ClientList clients={clients} onRemove={onRemoveClient} onUpdate={onUpdateClient} />
    </Page>
  );
}
