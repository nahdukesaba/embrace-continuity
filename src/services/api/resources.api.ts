import { http } from "@/services/http";
import type { CreateResourceInput, Resource, ResourceFilters } from "@/types";

/**
 * Backend Data API. The frontend `Resource` union is preserved; if the
 * backend response uses different keys (e.g. `amenities`/`seats`) update
 * the normalizers below.
 */
export const resourcesApi = {
  async list(filters: ResourceFilters = {}): Promise<Resource[]> {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.type && filters.type !== "all") params.type = filters.type;
    if (filters.availability && filters.availability !== "all") params.availability = filters.availability;
    const { data } = await http.get<Resource[] | { data: Resource[] }>("/resources", { params });
    return Array.isArray(data) ? data : data.data;
  },
  async get(id: string): Promise<Resource> {
    const { data } = await http.get<Resource | { data: Resource }>(`/resources/${id}`);
    return (data as { data?: Resource }).data ?? (data as Resource);
  },
  async create(input: CreateResourceInput): Promise<Resource> {
    const { data } = await http.post<Resource | { data: Resource }>("/resources", input);
    return (data as { data?: Resource }).data ?? (data as Resource);
  },
  async update(id: string, input: Partial<CreateResourceInput>): Promise<Resource> {
    const { data } = await http.put<Resource | { data: Resource }>(`/resources/${id}`, input);
    return (data as { data?: Resource }).data ?? (data as Resource);
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/resources/${id}`);
  },
};
