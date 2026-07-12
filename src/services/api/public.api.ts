import { http } from "@/services/http";
import { resourcesApi } from "@/services/api/resources.api";
import { composeJakartaISO, isoToJakartaHHmm, isoToJakartaYMD } from "@/lib/bookingTime";
import type {
  AppUser,
  Booking,
  BookingFilters,
  BookingUserRef,
  PublicBooking,
  Resource,
} from "@/types";

export interface PublicBookingFilters extends BookingFilters {
  month?: number; // 1-12
  year?: number;
}

function unwrap<T>(data: T | { data: T }): T {
  return (data as { data?: T }).data ?? (data as T);
}

function toUserRef(u: PublicBooking["user"]): BookingUserRef | undefined {
  if (!u) return undefined;
  const anyU = u as AppUser & BookingUserRef;
  return { id: anyU.id, fullName: anyU.fullName, email: anyU.email };
}

function normalize(p: PublicBooking, resources: Resource[]): Booking {
  const resource = p.resource ?? resources.find((r) => r.id === p.resourceId);
  return {
    id: p.id,
    resourceId: p.resourceId,
    userId: p.userId ?? "",
    date: p.date ?? isoToJakartaYMD(p.startTime),
    endDate: p.endDate ?? isoToJakartaYMD(p.endTime),
    startTime: isoToJakartaHHmm(p.startTime),
    endTime: isoToJakartaHHmm(p.endTime),
    startTimeISO: p.startTime,
    endTimeISO: p.endTime,
    status: p.status,
    purpose: p.purpose,
    adminNotes: p.adminNotes,
    createdAt: p.createdAt ?? p.startTime,
    updatedAt: p.updatedAt ?? p.startTime,
    resource,
    user: toUserRef(p.user),
  };
}

function toParams(filters: PublicBookingFilters) {
  const p: Record<string, string | number> = {};
  if (filters.from) p.from = filters.from;
  if (filters.to) p.to = filters.to;
  if (filters.resourceId) p.resourceId = filters.resourceId;
  if (filters.month) p.month = filters.month;
  if (filters.year) p.year = filters.year;
  return p;
}

export const publicApi = {
  async allBookings(filters: PublicBookingFilters = {}): Promise<Booking[]> {
    const needResourceFallback = false;
    const [rawRes, resources] = await Promise.all([
      http.get<PublicBooking[] | { data: PublicBooking[] }>("/public/bookings/all", {
        params: toParams(filters),
      }),
      needResourceFallback
        ? resourcesApi.list().catch(() => [] as Resource[])
        : Promise.resolve([] as Resource[]),
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

// composeJakartaISO re-export kept for legacy imports.
export { composeJakartaISO };
