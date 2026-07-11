import { useQuery, queryOptions } from "@tanstack/react-query";
import { statsApi } from "@/services/api/stats.api";
import { qk } from "@/lib/queryKeys";

export const statsQueryOptions = queryOptions({
  queryKey: qk.stats.overview,
  queryFn: () => statsApi.overview(),
});

export const insightsQueryOptions = (from: string, to: string) =>
  queryOptions({
    queryKey: qk.stats.insights({ from, to }),
    queryFn: () => statsApi.insights({ from, to }),
    enabled: Boolean(from && to),
  });

export const useStats = () => useQuery(statsQueryOptions);
export const useInsights = (from: string, to: string) => useQuery(insightsQueryOptions(from, to));
