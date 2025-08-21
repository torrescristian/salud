import { QueryClient } from "@tanstack/react-query";
import { config } from "../config/environment";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.reactQuery.staleTime,
      retry: config.reactQuery.retry,
      refetchOnWindowFocus: config.reactQuery.refetchOnWindowFocus,
    },
    mutations: {
      retry: 1,
    },
  },
});
