import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_PRICES: Record<string, string> = {
  Start: "price_1TC2tVADUx6QKIdy5QexbvfI",
  Pro: "price_1TC2v2ADUx6QKIdyQfFPiaey",
  Elite: "price_1TC2wmADUx6QKIdybVK4DlwY",
  "Avulso 25": "price_1TC315ADUx6QKIdyopfPmK4t",
  "Avulso 60": "price_1TC33QADUx6QKIdyPEIwSfZb",
  "Avulso 90": "price_1TC34LADUx6QKIdy25owKNLw",
  "Avulso 120": "price_1TC34wADUx6QKIdyKMAfuizF",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { plan } = await req.json();
    const stripeKey = Deno.env.get("stripe_key_pro");
    if (!stripeKey) throw new Error("Chave 'stripe_key_pro' ausente nos Secrets.");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Usuário não autenticado.");

    const priceId = PLAN_PRICES[plan?.trim()];
    if (!priceId) throw new Error(`Plano inválido: ${plan}`);

    console.log("Criando checkout para o plano:", plan, "com Price ID:", priceId);

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan.startsWith("Avulso") ? "payment" : "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success`,
      cancel_url: `${req.headers.get("origin")}/planos`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro no Checkout:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
