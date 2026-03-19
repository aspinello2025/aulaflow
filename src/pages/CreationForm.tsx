import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles, Lock } from "lucide-react";
import ThemeSuggestions from "@/components/ThemeSuggestions";
import { toast } from "sonner";

const anos = [
  "1º ano - Fundamental I", "2º ano - Fundamental I", "3º ano - Fundamental I",
  "4º ano - Fundamental I", "5º ano - Fundamental I",
  "6º ano - Fundamental II", "7º ano - Fundamental II", "8º ano - Fundamental II", "9º ano - Fundamental II",
  "1º ano - Ensino Médio", "2º ano - Ensino Médio", "3º ano - Ensino Médio",
];

const disciplinas = [
  "Português", "Matemática", "Ciências", "História", "Geografia", "Arte",
  "Educação Física", "Inglês", "Biologia", "Física", "Química", "Sociologia", "Filosofia",
];

const bimestres = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];

type ModeKey = "aula" | "atividade" | "prova" | "sequencia";

interface ModeConfig {
  title: string;
  subtitle: string;
  temaLabel: string;
  temaPlaceholder: string;
  fields: string[];
}

const modeConfigs: Record<ModeKey, ModeConfig> = {
  aula: {
    title: "Criador de Aula",
    subtitle: "Preencha as informações para gerar seu plano de aula alinhado à BNCC",
    temaLabel: "Tema da aula",
    temaPlaceholder: "Ex: Frações e números decimais",
    fields: ["ano", "disciplina", "bimestre", "tema", "duracao", "objetivo", "observacoes"],
  },
  atividade: {
    title: "Criador de Atividades",
    subtitle: "Preencha as informações para gerar atividades prontas para aplicar em sala",
    temaLabel: "Tema",
    temaPlaceholder: "Ex: Verbos no presente do indicativo",
    fields: ["ano", "disciplina", "bimestre", "tema", "quantidade_atividades", "tipo_atividade", "objetivo", "observacoes"],
  },
  prova: {
    title: "Criador de Prova",
    subtitle: "Preencha as informações para gerar uma prova completa alinhada à BNCC",
    temaLabel: "Tema da avaliação",
    temaPlaceholder: "Ex: Sistema solar e planetas",
    fields: ["ano", "disciplina", "bimestre", "tema", "quantidade_questoes", "nivel_dificuldade", "tipo_prova", "observacoes"],
  },
  sequencia: {
    title: "Sequência Didática",
    subtitle: "Preencha as informações para gerar sua sequência pedagógica estruturada",
    temaLabel: "Tema",
    temaPlaceholder: "Ex: Revolução Industrial e suas consequências",
    fields: ["ano", "disciplina", "bimestre", "tema", "quantidade_aulas", "duracao_media", "objetivo", "observacoes"],
  },
};

const tiposAtividade = ["Fixação", "Prática", "Avaliação", "Misto"];
const tiposProva = ["Objetiva", "Discursiva", "Mista"];
const niveisDificuldade = ["Fácil", "Médio", "Difícil", "Misto"];
const quantidadeAulas = ["3 aulas", "4 aulas", "5 aulas"];

const CreationForm = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const modeKey = (mode || "aula") as ModeKey;
  const config = modeConfigs[modeKey] || modeConfigs.aula;

  const [formData, setFormData] = useState<Record<string, string>>({
    ano: "", disciplina: "", bimestre: "", tema: "", duracao: "", objetivo: "", observacoes: "",
    quantidade_atividades: "", tipo_atividade: "", quantidade_questoes: "",
    nivel_dificuldade: "", tipo_prova: "", quantidade_aulas: "", duracao_media: "",
  });

  const updateField = (key: string, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mode) return;

    setLoading(true);
    try {
      const payload: Record<string, string> = { mode };
      for (const field of config.fields) {
        payload[field] = formData[field] || "";
      }

      const invokeOptions: any = { body: payload };
      if (user.id === "mock-user-123") {
        invokeOptions.headers = {
          Authorization: "Bearer mock-token-elite",
        };
      }

      const response = await supabase.functions.invoke("generate-content", invokeOptions);

      if (response.error) {
        const errorData = response.error;
        if (typeof errorData === "object" && "message" in errorData && String(errorData.message).includes("limite")) {
          setShowPaywall(true);
          setLoading(false);
          return;
        }
        throw new Error(String(errorData.message || "Erro ao gerar conteúdo"));
      }

      const data = response.data;
      if (data?.generationId) {
        navigate(`/resultado/${data.generationId}`);
      }
    } catch (err: any) {
      if (err?.message?.includes("limite")) {
        setShowPaywall(true);
      } else {
        toast.error(err?.message || "Erro ao gerar conteúdo");
      }
    } finally {
      setLoading(false);
    }
  };



  const renderSelectField = (label: string, fieldKey: string, options: string[], placeholder = "Selecione") => (
    <div>
      <Label>{label}</Label>
      <Select value={formData[fieldKey]} onValueChange={(v) => updateField(fieldKey, v)}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderInputField = (label: string, fieldKey: string, placeholder: string, required = false) => (
    <div>
      <Label>{label}</Label>
      <Input
        value={formData[fieldKey]}
        onChange={(e) => updateField(fieldKey, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1"
      />
    </div>
  );

  const renderTextareaField = (label: string, fieldKey: string, placeholder: string, rows = 3) => (
    <div>
      <Label>{label}</Label>
      <Textarea
        value={formData[fieldKey]}
        onChange={(e) => updateField(fieldKey, e.target.value)}
        placeholder={placeholder}
        className="mt-1"
        rows={rows}
      />
    </div>
  );

  const renderModeSpecificFields = () => {
    switch (modeKey) {
      case "aula":
        return (
          <>
            {renderInputField("Duração da aula", "duracao", "Ex: 50 minutos")}
            {renderTextareaField("Objetivo pedagógico", "objetivo", "Descreva o que os alunos devem aprender")}
          </>
        );
      case "atividade":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderInputField("Quantidade de atividades", "quantidade_atividades", "Ex: 3")}
            {renderSelectField("Tipo de atividade", "tipo_atividade", tiposAtividade)}
          </div>
        );
      case "prova":
        return (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderInputField("Quantidade de questões", "quantidade_questoes", "Ex: 10")}
              {renderSelectField("Nível de dificuldade", "nivel_dificuldade", niveisDificuldade)}
            </div>
            {renderSelectField("Tipo de prova", "tipo_prova", tiposProva)}
          </>
        );
      case "sequencia":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderSelectField("Quantidade de aulas", "quantidade_aulas", quantidadeAulas)}
            {renderInputField("Duração média por aula", "duracao_media", "Ex: 50 minutos")}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-hero-gradient shadow-medium">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Limite de criações atingido</DialogTitle>
            <DialogDescription className="text-center text-base">
              O AulaFlow pode continuar criando muito mais para você:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="text-left space-y-2 text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <li className="flex items-center gap-2">✓ Planos de aula detalhados</li>
              <li className="flex items-center gap-2">✓ Atividades personalizadas</li>
              <li className="flex items-center gap-2">✓ Provas completas</li>
              <li className="flex items-center gap-2">✓ Sequências didáticas</li>
            </ul>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button variant="hero" className="w-full" onClick={() => navigate("/planos#precos")}>
              Ver planos disponíveis
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>
              Voltar ao painel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent">{config.title}</h1>
          <p className="text-muted-foreground">{config.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-card border border-border p-6 shadow-soft">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderSelectField("Ano / Série", "ano", anos)}
            {renderSelectField("Disciplina", "disciplina", disciplinas)}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderSelectField("Bimestre", "bimestre", bimestres)}
            <div>
              <Label>{config.temaLabel}</Label>
              <ThemeSuggestions
                ano={formData.ano}
                disciplina={formData.disciplina}
                bimestre={formData.bimestre}
                mode={modeKey}
                value={formData.tema}
                onChange={(v) => updateField("tema", v)}
                placeholder={config.temaPlaceholder}
              />
            </div>
          </div>

          {renderModeSpecificFields()}

          {(modeKey === "atividade" || modeKey === "sequencia") &&
            renderTextareaField("Objetivo pedagógico", "objetivo", "Descreva o que os alunos devem aprender")}

          {renderTextareaField("Observações (opcional)", "observacoes", "Informações adicionais, necessidades especiais, etc.", 2)}

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? (
              <><Sparkles className="h-4 w-4 animate-spin" /> Gerando com o AulaFlow...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Gerar com o AulaFlow</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreationForm;
