import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ProtectedShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

function AdminPage() {
  const { t } = useI18n();
  return <ProtectedShell requireRole="admin" title={t("dash_admin_title")} intro={t("dash_admin_intro")} />;
}
