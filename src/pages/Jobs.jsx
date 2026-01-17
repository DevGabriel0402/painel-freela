import JobForm from "../components/JobForm";
import JobList from "../components/JobList";
import { Page } from "../components/ui";

export default function Jobs({
  jobs,
  clients,
  onAddJob,
  onTogglePaid,
  onRemoveJob,
  onUpdateStatus,
  onUpdateJob,
}) {
  return (
    <Page>
      <JobForm clients={clients} onAdd={onAddJob} />

      <JobList
        jobs={jobs}
        clients={clients}
        onTogglePaid={onTogglePaid}
        onRemove={onRemoveJob}
        onUpdateStatus={onUpdateStatus}
        onUpdateJob={onUpdateJob}
      />
    </Page>
  );
}
