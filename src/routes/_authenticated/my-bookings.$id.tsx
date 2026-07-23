import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBooking } from "@/hooks/queries/useBookings";
import { useProofs } from "@/hooks/queries/useProofs";
import {
  useCancelBooking,
  useFinishBooking,
  useStartBooking,
} from "@/hooks/mutations/useBookingMutations";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceColorDot } from "@/components/common/ResourceColorDot";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProofGallery } from "@/components/bookings/ProofGallery";
import { UsageActionDialog } from "@/components/bookings/UsageActionDialog";
import { BookingTimeline } from "@/components/bookings/BookingTimeline";
import { fmtDateTime, fmtBookingRange, daysBetweenInclusive, isTodayInRange } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/errors";

import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/my-bookings/$id")({
  head: () => ({ meta: [{ title: "Booking · SILAPET" }] }),
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();
  const { data: booking, isLoading } = useBooking(id);
  const { data: proofs } = useProofs(id);
  const cancel = useCancelBooking();
  const start = useStartBooking();
  const finish = useFinishBooking();
  const t = useT();
  const [captureAction, setCaptureAction] = useState<"start" | "finish" | null>(null);

  if (isLoading || !booking) return <LoadingSkeleton rows={4} />;

  const hasBefore = (proofs ?? []).some((p) => p.kind === "before");
  const hasAfter = (proofs ?? []).some((p) => p.kind === "after");
  const inWindow = isTodayInRange(booking.date, booking.endDate);
  const canCancel = booking.status === "pending" || booking.status === "approved";
  const canStart = booking.status === "approved" && inWindow;
  const canFinish = booking.status === "in_use" || booking.status === "needs_revision";
  const needRevision = booking.status === "needs_revision";
  const days = daysBetweenInclusive(booking.date, booking.endDate);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/my-bookings">
          <ArrowLeft className="mr-1 size-4" />
          {t("action.back")}
        </Link>
      </Button>
      <PageHeader
        title={booking.resource?.name ?? "Booking"}
        titlePrefix={
          <ResourceColorDot resourceId={booking.resourceId} resource={booking.resource} />
        }
        description={`${fmtBookingRange(booking.date, booking.endDate, booking.startTime, booking.endTime)}${days > 1 ? ` · ${days} ${t("bookingDetail.daysSuffix")}` : ""}`}
        actions={<StatusBadge status={booking.status} />}
      />
      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <p>
            <span className="text-muted-foreground">{t("bookingDetail.requested")}:</span>{" "}
            {fmtDateTime(booking.createdAt)}
          </p>
          {booking.purpose && (
            <p>
              <span className="text-muted-foreground">Purpose:</span> {booking.purpose}
            </p>
          )}
          {booking.adminNotes && (
            <p>
              <span className="text-muted-foreground">{t("bookingDetail.adminNotes")}:</span>{" "}
              {booking.adminNotes}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {booking.status === "approved" && (
          <Button
            disabled={!canStart}
            className={canStart ? "glow-green" : undefined}
            title={!inWindow ? t("bookingDetail.startTitleWindow") : undefined}
            onClick={async () => {
              if (hasBefore) {
                try {
                  await start.mutateAsync(booking.id);
                  toast.success(t("bookingDetail.usageStarted"));
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
                }
              } else {
                setCaptureAction("start");
              }
            }}
          >
            {t("booking.start")}
          </Button>
        )}
        {(booking.status === "in_use" || booking.status === "needs_revision") && (
          <Button
            disabled={!canFinish}
            className={canFinish ? "glow-red" : undefined}
            onClick={async () => {
              if (hasAfter && !needRevision) {
                try {
                  await finish.mutateAsync(booking.id);
                  toast.success(t("bookingDetail.usageFinished"));
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
                }
              } else {
                setCaptureAction("finish");
              }
            }}
          >
            {t("booking.finish")}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await cancel.mutateAsync(booking.id);
                toast.success(t("bookingDetail.cancelled"));
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
              }
            }}
          >
            {t("booking.cancel")}
          </Button>
        )}
        {booking.status === "needs_revision" && (
          <div className="pt-2 text-sm text-warning">{t("bookingDetail.needsRevisionNotice")}</div>
        )}
        {booking.status === "closed" && (
          <div className="pt-2 text-sm text-muted-foreground">{t("bookingDetail.closed")}</div>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("bookingDetail.proofPhotos")}</h2>
        {booking.status === "pending" && (
          <p className="text-sm text-muted-foreground">{t("bookingDetail.pendingHint")}</p>
        )}
        {(booking.status === "approved" || booking.status === "in_use") && !inWindow && (
          <p className="text-sm text-muted-foreground">{t("bookingDetail.windowHint")}</p>
        )}
        <ProofGallery proofs={proofs ?? []} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("bookingDetail.timeline")}</h2>
        <BookingTimeline bookingId={booking.id} />
      </section>

      {captureAction && (
        <UsageActionDialog
          bookingId={booking.id}
          action={captureAction}
          open={!!captureAction}
          onOpenChange={(open) => !open && setCaptureAction(null)}
        />
      )}
    </div>
  );
}
