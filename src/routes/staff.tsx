import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ProtectedShell } from "@/components/DashboardShell";
import { BookingsManager } from "@/components/BookingsManager";
import { NotificationsPanel } from "@/components/NotificationBell";

export const Route = createFileRoute("/staff")({
  ssr: false,
  component: StaffPage,
});

function StaffPage() {
  const { t } = useI18n();
  return (
    <ProtectedShell requireRole="staff" title={t("dash_staff_title")} intro={t("dash_staff_intro")}>
      <BookingsManager />
      <div className="mt-12">
        <NotificationsPanel scope="operational" />
      </div>
    </ProtectedShell>
  );
}
