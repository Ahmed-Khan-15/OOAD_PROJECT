import { useQuery } from "@tanstack/react-query";

/** Shared query defaults for public API pages and their loading/error states. */
export function useApiQuery<T>(key: readonly unknown[], queryFn: () => Promise<T>) {
  return useQuery({ queryKey: key, queryFn, staleTime: 60_000, retry: 1 });
}
