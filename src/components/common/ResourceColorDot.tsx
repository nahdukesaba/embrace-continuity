import { colorForResource } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { Resource } from "@/types";

/**
 * Small color indicator for a resource, matching the dot shown next to the
 * resource name in the calendar's booking popup (BookingDetailsDialog).
 */
export function ResourceColorDot({
                                     resourceId,
                                     resource,
                                     className,
                                 }: {
    resourceId: string;
    resource?: Resource;
    className?: string;
}) {
    return (
        <span
            className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
            style={{ background: colorForResource(resourceId, resource) }}
        />
    );
}