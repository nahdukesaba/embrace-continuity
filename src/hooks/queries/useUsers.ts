import { useQuery, queryOptions } from "@tanstack/react-query";
import { usersApi } from "@/services/api/users.api";
import type { UserStatus } from "@/types";

export const usersQueryOptions = (status?: UserStatus) =>
  queryOptions({
    queryKey: ["users", "list", { status }] as const,
    queryFn: () => usersApi.list({ status }),
  });

export const useUsers = (status?: UserStatus) => useQuery(usersQueryOptions(status));
