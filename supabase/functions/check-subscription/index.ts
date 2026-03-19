import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_LIMITS: Record<string, number> = {
  "price_1TC2tVADUx6QKIdy5QexbvfI": 50,   // Start
  "price_1TC2v2ADUx6QKIdyQfFPiaey": 150,  // Pro
  "price_1TC2wmADUx6QKIdybVK4DlwY": 350,  // Elite
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("stripe_key_pro");
    if (!stripeKey) throw new Error("Chave stripe_key_pro não configurada no Supabase");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false, generation_limit: 3 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    let generationLimit = 3;
    let hasActiveSub = false;

    if (subscriptions.data.length > 0) {
      hasActiveSub = true;
      const priceId = subscriptions.data[0].items.data[0].price.id;
      generationLimit = PRICE_LIMITS[priceId] ?? 3;
    }

    // Sincronizar com a tabela de usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    await supabaseClient.from("usage").upsert(
      {
        user_id: user.id,
        month: currentMonth,
        generation_limit: generationLimit,
      },
      { onConflict: "user_id,month" },
    );

    // Sincronizar o tier no perfil
    const planTier =
      generationLimit >= 350 ? "elite" : generationLimit >= 150 ? "pro" : generationLimit >= 50 ? "start" : "free";
    await supabaseClient.from("profiles").update({ plan_tier: planTier }).eq("id", user.id);

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        generation_limit: generationLimit,
        plan_tier: planTier,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
