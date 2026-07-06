import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ProtectedShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useI18n();
  return <ProtectedShell requireRole="client" title={t("dash_client_title")} intro={t("dash_client_intro")} />;
}
