
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("stripe_key_pro") || "", {
  apiVersion: "2023-10-16",
});


serve(async (req) => {
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  try {
    const body = await req.text();
    console.log("[Stripe Webhook] Received event");
    
    if (!webhookSecret) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set");
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`[Stripe Webhook] Event type: ${event.type}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userEmail = session.customer_details?.email;
      const value = session.amount_total ? session.amount_total / 100 : 0;

      console.log(`[Stripe Webhook] Payment confirmed for ${userEmail}`);

      // Aqui você poderia atualizar o plano do usuário diretamente via DB
      // Mas o check-subscription já faz isso sob demanda.
      // O Webhook garante que o rastreamento aconteça mesmo se o usuário não voltar ao site.
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
