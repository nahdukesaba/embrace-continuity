import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CameraCapture } from "@/components/bookings/CameraCapture";
import { useUploadProof } from "@/hooks/mutations/useProofMutations";
import { useFinishBooking, useStartBooking } from "@/hooks/mutations/useBookingMutations";
import { toast } from "sonner";
import { useT } from "@/i18n/LanguageProvider";

/**
 * Combines "capture proof photo" + "start/finish usage" into one step.
 * Previously these were two separate, disconnected actions (upload a
 * before/after photo in one section, then remember to come back and press
 * Start/Finish elsewhere), which is what users kept forgetting to do.
 */
export function UsageActionDialog({
  bookingId,
  action,
  open,
  onOpenChange,
}: {
  bookingId: string;
  action: "start" | "finish";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const upload = useUploadProof(bookingId);
  const start = useStartBooking();
  const finish = useFinishBooking();
  const [submitting, setSubmitting] = useState(false);
  const kind = action === "start" ? "before" : "after";

  async function handleFile(file: File) {
    setSubmitting(true);
    try {
      await upload.mutateAsync({ kind, file });
      if (action === "start") {
        await start.mutateAsync(bookingId);
        toast.success(t("bookingDetail.usageStarted"));
      } else {
        await finish.mutateAsync(bookingId);
        toast.success(t("bookingDetail.usageFinished"));
      }
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{action === "start" ? t("booking.start") : t("booking.finish")}</DialogTitle>
          <DialogDescription>
            {action === "start"
              ? t("bookingDetail.captureBeforeDesc")
              : t("bookingDetail.captureAfterDesc")}
          </DialogDescription>
        </DialogHeader>
        {submitting ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("bookingDetail.submitting")}
          </p>
        ) : (
          <CameraCapture onFile={handleFile} />
        )}
      </DialogContent>
    </Dialog>
  );
}
