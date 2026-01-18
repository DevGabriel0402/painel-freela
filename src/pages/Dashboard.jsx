import { Grid, Page } from "../components/ui";
import MonthlyGoal from "../components/MonthlyGoal";
import RevenueLineChart from "../components/charts/RevenueLineChart";
import PaidVsPendingDonut from "../components/charts/PaidVsPendingDonut";
import CashflowForecastChart from "../components/charts/CashflowForecastChart";
import ClientsRevenueBarChart from "../components/charts/ClientsRevenueBarChart";
import MonthlyReport from "../components/MonthlyReport";

export default function Dashboard({ jobs, clients, settings }) {
  return (
    <Page>
      {/* Meta mensal */}
      <MonthlyGoal jobs={jobs} settings={settings} />

      {/* Relatório do mês (com export) */}
      <MonthlyReport jobs={jobs} clients={clients} />

      <RevenueLineChart jobs={jobs} defaultMode={settings?.revenueChartMode} />

      {/* Fluxo de caixa */}
      <CashflowForecastChart
        jobs={jobs}
        defaultMode={settings?.cashflowDefaultMode}
        currency={settings?.currency}
      />

      {/* Gráficos principais */}
      <Grid $cols="1fr 1fr" $colsMobile="1fr">
        {/* Ranking por cliente */}
        <PaidVsPendingDonut jobs={jobs} />
        <ClientsRevenueBarChart jobs={jobs} clients={clients} />
      </Grid>
    </Page>
  );
}
