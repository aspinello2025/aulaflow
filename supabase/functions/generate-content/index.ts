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
    let user;

    if (token === "mock-token-elite") {
      // Mock User Bypass with valid UUID
      user = { id: "00000000-0000-0000-0000-000000000123", email: "alexandre.spinello@gmail.com" };
      
      // Ensure mock profile exists so foreign keys don't break
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        plan_tier: "elite",
        full_name: "Usuário de Teste"
      });
    } else {
      // Standard Auth
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !authUser) {
        return new Response(JSON.stringify({ error: "Usuário inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      user = authUser;
    }

    // Check usage limits
    const currentMonth = new Date().toISOString().slice(0, 7);
    let { data: usageData } = await supabase
      .from("usage")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .maybeSingle();

    if (!usageData) {
      // For new users without a record this month, create one.
      // Free limit is now 5 credits.
      const { data: newUsage } = await supabase
        .from("usage")
        .upsert({ user_id: user.id, month: currentMonth, generations_used: 0, generation_limit: 5 })
        .select()
        .single();
      usageData = newUsage;
    }

    if (usageData && usageData.generations_used >= usageData.generation_limit) {
      return new Response(JSON.stringify({ error: "Você atingiu o limite de criações deste mês" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { mode, ano, disciplina, bimestre, tema, duracao, objetivo, observacoes,
            quantidade_atividades, tipo_atividade, quantidade_questoes,
            nivel_dificuldade, tipo_prova, quantidade_aulas, duracao_media } = body;

    // Build prompt based on mode
    let prompt = "";
    switch (mode) {
      case "aula":
        prompt = `Crie um plano de aula completo e detalhado alinhado à BNCC:
Ano/Série: ${ano} | Disciplina: ${disciplina} | Bimestre: ${bimestre} | Tema: ${tema}
Duração: ${duracao || "50 minutos"} | Objetivo: ${objetivo || "A definir pelo professor"} | Obs: ${observacoes || "Nenhuma"}
Conteúdo obrigatório: objetivos de aprendizagem, competências/habilidades BNCC (códigos), metodologia (introdução, desenvolvimento, conclusão), recursos, atividades e avaliação.`;
        break;
      case "atividade":
        prompt = `Crie ${quantidade_atividades || "3"} atividades pedagógicas prontas para aplicar:
Ano/Série: ${ano} | Disciplina: ${disciplina} | Bimestre: ${bimestre} | Tema: ${tema}
Tipo: ${tipo_atividade || "Misto"} | Objetivo: ${objetivo || "A definir"} | Obs: ${observacoes || "Nenhuma"}
Conteúdo obrigatório: enunciados claros, instruções ao professor, gabarito e habilidades BNCC.`;
        break;
      case "prova":
        prompt = `Crie uma prova completa alinhada à BNCC:
Ano/Série: ${ano} | Disciplina: ${disciplina} | Bimestre: ${bimestre} | Tema: ${tema}
Qtd. Questões: ${quantidade_questoes || "10"} | Nível: ${nivel_dificuldade || "Médio"} | Tipo: ${tipo_prova || "Mista"} | Obs: ${observacoes || "Nenhuma"}
Conteúdo obrigatório: cabeçalho da prova, questões numeradas, gabarito detalhado e habilidades BNCC avaliadas.`;
        break;
      case "sequencia":
        prompt = `Crie uma sequência didática completa alinhada à BNCC:
Ano/Série: ${ano} | Disciplina: ${disciplina} | Bimestre: ${bimestre} | Tema: ${tema}
Aulas: ${quantidade_aulas || "3 aulas"} | Duração/Aula: ${duracao_media || "50 minutos"} | Objetivo: ${objetivo || "A definir"} | Obs: ${observacoes || "Nenhuma"}
Conteúdo obrigatório: justificativa, objetivos (gerais e específicos), habilidades BNCC, detalhamento de cada aula, recursos, avaliação processual e referências.`;
        break;
      default:
        return new Response(JSON.stringify({ error: "Modo inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Call AI to generate content
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
            content: "Você é um assistente pedagógico especializado em educação brasileira e BNCC. Gere conteúdo detalhado, prático e pronto para uso pelo professor. Use formatação clara com títulos, subtítulos e listas.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1800,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", errText);
      return new Response(JSON.stringify({ error: "Erro ao gerar conteúdo com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices?.[0]?.message?.content || "Erro ao gerar conteúdo";

    // Save generation
    const inputData: Record<string, string> = { mode, ano, disciplina, bimestre, tema };
    if (duracao) inputData.duracao = duracao;
    if (objetivo) inputData.objetivo = objetivo;
    if (observacoes) inputData.observacoes = observacoes;

    const { data: generation, error: genError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        mode,
        input_data: inputData,
        result,
      })
      .select("id")
      .single();

    if (genError) {
      console.error("Insert error:", genError);
      return new Response(JSON.stringify({ error: "Erro ao salvar geração" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update usage
    await supabase
      .from("usage")
      .update({ generations_used: (usageData?.generations_used || 0) + 1 })
      .eq("user_id", user.id)
      .eq("month", currentMonth);

    return new Response(JSON.stringify({ generationId: generation.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in generate-content:", err);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
