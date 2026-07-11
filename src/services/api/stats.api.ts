import { http } from "@/services/http";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import type { BookingInsights, BookingStatus } from "@/types";

export interface StatsOverview {
  totalUsers: number;
  totalResources: number;
  totalBookings: number;
  bookingsByStatus: Partial<Record<BookingStatus, number>>;
  activeBookings?: number;
  pendingUsers?: number;
}

function unwrap<T>(data: T | { data: T }): T {
  return (data as { data?: T }).data ?? (data as T);
}

export const statsApi = {
  async overview(): Promise<StatsOverview> {
    const { data } = await http.get<StatsOverview | { data: StatsOverview }>("/stats/overview");
    return unwrap(data);
  },
  async insights(params: { from: string; to: string }): Promise<BookingInsights> {
    const { data } = await http.get<BookingInsights | { data: BookingInsights }>(
      "/stats/bookings/insights",
      { params },
    );
    return unwrap(data);
  },
  /**
   * Downloads booking rows as CSV for the given date range. Server returns a
   * text/csv payload with a Content-Disposition filename.
   */
  async exportCsv(params: { from: string; to: string }): Promise<{ blob: Blob; filename: string }> {
    const token = useAuthStore.getState().token;
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${env.apiBaseUrl}/stats/bookings/export?${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Export failed [${res.status}]: ${text || res.statusText}`);
    }
    const blob = await res.blob();
    const cd = res.headers.get("content-disposition") ?? "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    const filename = match?.[1] ?? `bookings-${params.from}_${params.to}.csv`;
    return { blob, filename };
  },
};
