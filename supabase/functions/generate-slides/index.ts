import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { content } = await req.json();

    // Bypass for test user
    if (token === "mock-token-elite") {
      return await handleGeneration(content);
    }

    // Standard Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All plans can now generate slides, so we skip the plan_tier check.
    // However, we still need to check usage limits.

    // Check usage limits (5 credits)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usageData } = await supabase
      .from("usage")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .maybeSingle();

    if (!usageData || (usageData.generation_limit - usageData.generations_used) < 5) {
      return new Response(JSON.stringify({ error: "Você precisa de pelo menos 5 créditos para gerar slides." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await handleGeneration(content);

    // Update usage (5 credits)
    await supabase
      .from("usage")
      .update({ generations_used: (usageData.generations_used || 0) + 5 })
      .eq("id", usageData.id);

    return response;
  } catch (err) {
    console.error("Error in generate-slides:", err);
    return new Response(JSON.stringify({ error: err.message || "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleGeneration(content: string) {
  const prompt = `Você é um especialista em design instrucional e educação.

Transforme o conteúdo pedagógico abaixo (que pode ser um plano de aula, atividade, prova ou sequência didática) em uma apresentação de slides atraente e educativa.

Regras:
1. Identifique o tema principal e os pontos-chave do conteúdo.
2. Cada slide deve ter:
   - "titulo": Um título curto e impactante.
   - "topicos": De 3 a 5 tópicos curtos e claros.
3. Use linguagem adequada para alunos, sendo direto e didático.
4. Evite textos longos ou parágrafos extensos.
5. A apresentação deve ter entre 8 e 12 slides, cobrindo introdução, desenvolvimento e conclusão/revisão.
6. Se o conteúdo for uma prova ou atividade, os slides devem explicar os conceitos avaliados em vez de apenas listar as questões.

Formato de resposta em JSON estritamente conforme o esquema:

{
  "slides": [
    {
      "titulo": "Título do Slide",
      "topicos": ["Tópico 1", "Tópico 2", "Tópico 3"]
    }
  ]
}

Conteúdo Original:
${content}`;

  // Call AI
  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("apiopenai_aulaflow")}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente pedagógico especializado em transformar materiais didáticos em apresentações de slides eficazes. Responda apenas com o JSON estruturado.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error("OpenAI error:", errText);
    throw new Error("Erro ao gerar slides com IA");
  }

  const aiData = await aiResponse.json();
  const slidesData = JSON.parse(aiData.choices[0].message.content);

  return new Response(JSON.stringify(slidesData), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
