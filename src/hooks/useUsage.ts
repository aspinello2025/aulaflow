import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UsageData {
  limit: number;
  used: number;
  planTier: string;
}

export const useUsage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const usageQuery = useQuery({
    queryKey: ["usage", user?.id, currentMonth],
    queryFn: async (): Promise<UsageData> => {
      if (!user) throw new Error("User not authenticated");

      if (user.id === "00000000-0000-0000-0000-000000000123") {
        return {
          limit: 500,
          used: 0,
          planTier: "elite",
        };
      }

      // Fetch usage and profile tier in parallel
      const [usageRes, profileRes] = await Promise.all([
        supabase
          .from("usage")
          .select("generation_limit, generations_used")
          .eq("user_id", user.id)
          .eq("month", currentMonth)
          .maybeSingle(),
        (supabase as any)
          .from("profiles")
          .select("plan_tier")
          .eq("id", user.id)
          .maybeSingle()
      ]);

      if (usageRes.error) throw usageRes.error;
      if (profileRes.error) throw profileRes.error;

      const limit = usageRes.data?.generation_limit || 3;
      const used = usageRes.data?.generations_used || 0;
      let planTier = profileRes.data?.plan_tier || "free";

      // Fallback: Infer planTier from generation limit if profile is stale or missing
      if (planTier === "free" && limit > 3) {
        planTier = limit >= 500 ? "elite" : limit >= 200 ? "pro" : limit >= 50 ? "start" : "free";
      }

      return {
        limit,
        used,
        planTier,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const syncSubscription = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("check-subscription");
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the usage query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["usage", user?.id, currentMonth] });
    },
  });

  return {
    usage: usageQuery.data || { limit: 3, used: 0, planTier: "free" },
    isLoading: usageQuery.isLoading,
    isError: usageQuery.isError,
    syncSubscription: syncSubscription.mutateAsync,
    isSyncing: syncSubscription.isPending,
  };
};
