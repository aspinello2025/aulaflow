import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hvyjfgkqbscjjodhsgnk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eWpmZ2txYnNjampvZGhzZ25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDE4MTgsImV4cCI6MjA4ODkxNzgxOH0.a7yCrtIyLmEHFmgOpWTT7GAQ3nL0jpEvNEW7HZnR8c4"; // VITE_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testLimits() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "password123";
  
  console.log(`=== Testando Limites de Geração ===`);
  console.log(`Criando usuário de teste: ${email}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error("Erro ao criar usuário:", authError);
    return;
  }

  const token = authData.session?.access_token;
  if (!token) {
    console.error("Nenhum token recebido. A confirmação de e-mail pode ser obrigatória.");
    return;
  }
  
  console.log("Usuário criado e autenticado com sucesso!");
  console.log("O limite para novos usuários é de 3 gerações por mês.");
  
  // Tentativa de gerar 4 vezes
  for (let i = 1; i <= 4; i++) {
    console.log(`\n--- Tentativa ${i} de 4 ---`);
    console.log("Chamando edge function 'generate-content'...");
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          mode: "aula",
          ano: "1º ano - Ensino Médio",
          disciplina: "Física",
          bimestre: "1º Bimestre",
          tema: "Cinemática Básica",
          duracao: "50 min",
          objetivo: "Teste de limite do sistema",
          observacoes: "Teste automatizado"
        }
      });

      if (error) {
        // Quando a edge function retorna um status de erro, o SDK joga na variável `error`
        console.error(`Tentativa ${i} FALHOU (Esperado se i > 3):`, error);
      } else {
        console.log(`Tentativa ${i} BEM-SUCEDIDA. Geração ID:`, data?.generationId || data);
      }
    } catch (err) {
      console.error(`Tentativa ${i} FALHOU com exceção:`, err.message);
    }
  }
  
  console.log("\n=== Fim do Teste ===");
}

testLimits().catch(console.error);
