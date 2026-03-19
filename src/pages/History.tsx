import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

const modeLabels: Record<string, string> = {
  aula: "📚 Plano de Aula",
  atividade: "📝 Atividade",
  prova: "📊 Prova",
  sequencia: "📅 Sequência Didática",
};

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setGenerations(data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>

        <h1 className="text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent mb-6">Histórico</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-card border border-border shadow-soft">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum crédito usado ainda</p>
            <Button variant="hero" className="mt-4" onClick={() => navigate("/dashboard")}>
              Criar meu primeiro material
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map((gen) => {
              const inputData = gen.input_data as any;
              return (
                <button
                  key={gen.id}
                  onClick={() => navigate(`/resultado/${gen.id}`)}
                  className="w-full rounded-xl bg-card border border-border p-4 text-left transition-all shadow-soft hover:shadow-medium hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {modeLabels[gen.mode] || gen.mode}
                      </span>
                      <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                        {inputData?.disciplina && <span>{inputData.disciplina}</span>}
                        {inputData?.ano && <span>• {inputData.ano}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(gen.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
