import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useStats } from "@/hooks/queries/useStats";
import { useBookings } from "@/hooks/queries/useBookings";
import { Boxes, Clock, CheckCircle2, ClipboardList, Users } from "lucide-react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { GroupedBookingTable } from "@/components/bookings/GroupedBookingTable";
import { ExportBookingsDialog } from "@/components/admin/ExportBookingsDialog";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin · SILAPET" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useStats();
  const { data: pending, isLoading } = useBookings({ status: "pending" });
  const t = useT();
  const by = stats?.bookingsByStatus ?? {};
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("adminDashboard.title")}
        description={t("adminDashboard.subtitle")}
        actions={<ExportBookingsDialog />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t("dashboard.stats.users")} value={stats?.totalUsers ?? "—"} icon={Users} />
        <StatCard label={t("dashboard.stats.resources")} value={stats?.totalResources ?? "—"} icon={Boxes} />
        <StatCard label={t("dashboard.stats.pending")} value={by.pending ?? "—"} icon={Clock} />
        <StatCard label={t("dashboard.stats.approved")} value={by.approved ?? "—"} icon={CheckCircle2} />
        <StatCard label={t("dashboard.stats.bookings")} value={stats?.totalBookings ?? "—"} icon={ClipboardList} />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("adminDashboard.pendingRequests")}</h2>
        {isLoading ? <LoadingSkeleton /> : <GroupedBookingTable bookings={pending?.items ?? []} detailHrefBase="/admin/bookings" />}
      </section>
    </div>
  );
}
