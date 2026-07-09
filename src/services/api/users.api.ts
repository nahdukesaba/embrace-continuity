import { http } from "@/services/http";
import type { AppUser, UserStatus } from "@/types";

export const usersApi = {
  async list(params?: { status?: UserStatus }): Promise<AppUser[]> {
    const { data } = await http.get<AppUser[] | { data: AppUser[] }>("/users", { params });
    // Backend may return either bare array or { data: [] }
    return Array.isArray(data) ? data : data.data;
  },
  async approve(id: string): Promise<AppUser> {
    const { data } = await http.post<AppUser | { user: AppUser }>(`/users/${id}/approve`);
    return "user" in (data as object) ? (data as { user: AppUser }).user : (data as AppUser);
  },
  async reject(id: string): Promise<AppUser> {
    const { data } = await http.post<AppUser | { user: AppUser }>(`/users/${id}/reject`);
    return "user" in (data as object) ? (data as { user: AppUser }).user : (data as AppUser);
  },
};
