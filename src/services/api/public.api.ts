import { http } from "@/services/http";
import { resourcesApi } from "@/services/api/resources.api";
import { composeJakartaISO, isoToJakartaHHmm, isoToJakartaYMD } from "@/lib/bookingTime";
import type { Booking, BookingFilters, PublicBooking, Resource } from "@/types";

function unwrap<T>(data: T | { data: T }): T {
  return (data as { data?: T }).data ?? (data as T);
}

function normalize(p: PublicBooking, resources: Resource[]): Booking {
  const resource = resources.find((r) => r.id === p.resourceId);
  return {
    id: p.id,
    resourceId: p.resourceId,
    userId: "",
    date: isoToJakartaYMD(p.startTime),
    endDate: isoToJakartaYMD(p.endTime),
    startTime: isoToJakartaHHmm(p.startTime),
    endTime: isoToJakartaHHmm(p.endTime),
    startTimeISO: p.startTime,
    endTimeISO: p.endTime,
    status: p.status,
    createdAt: p.startTime,
    updatedAt: p.startTime,
    resource,
  };
}

function toParams(filters: BookingFilters) {
  const p: Record<string, string> = {};
  if (filters.from) p.from = filters.from;
  if (filters.to) p.to = filters.to;
  if (filters.resourceId) p.resourceId = filters.resourceId;
  return p;
}

export const publicApi = {
  async allBookings(filters: BookingFilters = {}): Promise<Booking[]> {
    const [rawRes, resources] = await Promise.all([
      http.get<PublicBooking[] | { data: PublicBooking[] }>("/public/bookings/all", {
        params: toParams(filters),
      }),
      resourcesApi.list().catch(() => [] as Resource[]),
    ]);
    const items = unwrap(rawRes.data);
    const list = Array.isArray(items) ? items : [];
    return list.map((b) => normalize(b, resources));
  },
  async resourceBookings(resourceId: string): Promise<Booking[]> {
    const [rawRes, resource] = await Promise.all([
      http.get<PublicBooking[] | { data: PublicBooking[] }>(
        `/public/bookings/resource/${resourceId}`,
      ),
      resourcesApi.get(resourceId).catch(() => undefined),
    ]);
    const items = unwrap(rawRes.data);
    const list = Array.isArray(items) ? items : [];
    return list.map((b) => normalize(b, resource ? [resource] : []));
  },
};

// composeJakartaISO re-export kept for legacy imports (not used here directly).
export { composeJakartaISO };
