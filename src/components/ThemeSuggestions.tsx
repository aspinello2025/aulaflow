import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Lightbulb } from "lucide-react";

interface ThemeSuggestionsProps {
  ano: string;
  disciplina: string;
  bimestre: string;
  mode: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const staticSuggestions: Record<string, Record<string, string[]>> = {
  "Matemática": {
    aula: ["Frações e números decimais", "Geometria plana e espacial", "Equações do 1º grau", "Porcentagem no cotidiano", "Operações com números inteiros"],
    atividade: ["Resolução de problemas com frações", "Cálculo de área e perímetro", "Expressões numéricas", "Gráficos e tabelas", "Simetria e reflexão"],
    prova: ["Números racionais", "Proporcionalidade", "Medidas de comprimento e massa", "Probabilidade e estatística", "Potenciação e radiciação"],
    sequencia: ["Do concreto ao abstrato: frações", "Geometria no dia a dia", "Educação financeira", "Estatística com dados reais", "Álgebra: padrões e regularidades"],
  },
  "Português": {
    aula: ["Gêneros textuais: crônica", "Concordância verbal e nominal", "Interpretação de textos literários", "Produção de texto argumentativo", "Figuras de linguagem"],
    atividade: ["Leitura e compreensão de fábulas", "Ortografia: uso do S e Z", "Pontuação e seus efeitos", "Análise de propaganda", "Reescrita e revisão textual"],
    prova: ["Interpretação de texto", "Classes gramaticais", "Coesão e coerência", "Variação linguística", "Tipos de discurso"],
    sequencia: ["Projeto de jornal escolar", "Do conto ao reconto", "Debate regrado em sala", "Poesia e expressão", "Narrativas de aventura"],
  },
  "Ciências": {
    aula: ["Sistema solar e planetas", "Ciclo da água", "Cadeia alimentar", "Corpo humano: sistemas", "Sustentabilidade e meio ambiente"],
    atividade: ["Experiência com misturas", "Classificação dos seres vivos", "Fontes de energia", "Estados físicos da matéria", "Ecossistemas brasileiros"],
    prova: ["Célula e organismo", "Transformações químicas", "Magnetismo e eletricidade", "Reprodução dos seres vivos", "Poluição e impactos ambientais"],
    sequencia: ["Investigando o solo", "Alimentação saudável", "Astronomia para iniciantes", "Biodiversidade local", "Água: recurso vital"],
  },
  "História": {
    aula: ["Povos indígenas do Brasil", "Revolução Industrial", "Período colonial brasileiro", "Grandes navegações", "Era Vargas"],
    atividade: ["Linha do tempo: Idade Média", "Análise de fontes históricas", "Escravidão e resistência", "Independência do Brasil", "Democracia e cidadania"],
    prova: ["Brasil República", "Segunda Guerra Mundial", "Civilizações antigas", "Ditadura militar", "Movimentos sociais"],
    sequencia: ["Patrimônio histórico local", "África: história e cultura", "Imigração no Brasil", "Direitos humanos ao longo da história", "Revoluções que mudaram o mundo"],
  },
  "Geografia": {
    aula: ["Relevo brasileiro", "Urbanização e cidades", "Clima e vegetação", "Globalização", "Migração e fluxos populacionais"],
    atividade: ["Leitura de mapas e escalas", "Biomas brasileiros", "Problemas urbanos", "Recursos hídricos", "Uso do solo"],
    prova: ["Regiões do Brasil", "Coordenadas geográficas", "Impactos ambientais", "Economia e trabalho", "Cartografia"],
    sequencia: ["Nosso bairro, nossa cidade", "Mudanças climáticas", "Paisagem e transformação", "Brasil: contrastes regionais", "Agricultura e sustentabilidade"],
  },
  "Arte": {
    aula: ["Arte indígena brasileira", "Cores e composição", "Música e ritmo", "Teatro de fantoches", "Arte contemporânea"],
    atividade: ["Releitura de obras famosas", "Criação de mosaico", "Expressão corporal", "Desenho de observação", "Arte com materiais recicláveis"],
    prova: ["Movimentos artísticos", "Elementos visuais", "Arte e cultura popular", "Patrimônio artístico", "Arte digital"],
    sequencia: ["Do desenho à pintura", "Cultura afro-brasileira na arte", "Música brasileira", "Arte e meio ambiente", "Fotografia como expressão"],
  },
  "Inglês": {
    aula: ["Greetings and introductions", "Daily routine", "Food and drinks", "Family members", "Places in the city"],
    atividade: ["Verb to be exercises", "Vocabulary: animals", "Simple present practice", "Reading comprehension", "Describing people"],
    prova: ["Present continuous", "Prepositions of place", "Simple past", "Wh-questions", "Countable and uncountable nouns"],
    sequencia: ["My favorite hobby project", "Cultural diversity in English", "Storytelling in English", "Songs and lyrics", "Environment vocabulary project"],
  },
  "Educação Física": {
    aula: ["Jogos cooperativos", "Atletismo: corrida e salto", "Danças folclóricas", "Ginástica e alongamento", "Esportes com bola"],
    atividade: ["Circuito de habilidades motoras", "Brincadeiras tradicionais", "Jogos de tabuleiro corporal", "Expressão corporal e ritmo", "Esportes adaptados"],
    prova: ["Regras dos esportes coletivos", "Saúde e qualidade de vida", "História do esporte", "Corpo e movimento", "Práticas corporais de aventura"],
    sequencia: ["Olimpíadas escolares", "Cultura do movimento", "Jogos e brincadeiras populares", "Saúde e bem-estar", "Esportes de origem africana e indígena"],
  },
  "Biologia": {
    aula: ["Célula: estrutura e função", "Genética e hereditariedade", "Ecologia e ecossistemas", "Evolução das espécies", "Fisiologia humana"],
    atividade: ["Microscopia celular", "Cruzamentos genéticos", "Cadeias e teias alimentares", "Classificação dos seres vivos", "Sistema imunológico"],
    prova: ["Divisão celular", "Leis de Mendel", "Biomas e biodiversidade", "Sistema nervoso", "Biotecnologia"],
    sequencia: ["Da célula ao organismo", "Genética no cotidiano", "Saúde pública e doenças", "Evolução e adaptação", "Ecologia urbana"],
  },
  "Física": {
    aula: ["Leis de Newton", "Cinemática: velocidade e aceleração", "Energia e trabalho", "Ondas e som", "Eletricidade básica"],
    atividade: ["Experimentos de mecânica", "Cálculos de MRU e MRUV", "Circuitos elétricos simples", "Reflexão e refração da luz", "Calorimetria"],
    prova: ["Dinâmica e forças", "Termologia", "Óptica geométrica", "Eletromagnetismo", "Gravitação"],
    sequencia: ["Física no cotidiano", "Energia e sustentabilidade", "Do movimento aos foguetes", "Luz e cores", "Eletricidade e magnetismo"],
  },
  "Química": {
    aula: ["Tabela periódica", "Ligações químicas", "Reações químicas", "Soluções e concentração", "Química orgânica introdução"],
    atividade: ["Balanceamento de equações", "Cálculo estequiométrico", "Identificação de substâncias", "pH e indicadores", "Modelos atômicos"],
    prova: ["Estrutura atômica", "Funções inorgânicas", "Termoquímica", "Equilíbrio químico", "Eletroquímica"],
    sequencia: ["Química e alimentação", "Poluição e tratamento de água", "Materiais e suas propriedades", "Química verde", "Combustíveis e energia"],
  },
  "Sociologia": {
    aula: ["Cultura e sociedade", "Desigualdade social", "Movimentos sociais", "Trabalho e capitalismo", "Globalização e identidade"],
    atividade: ["Análise de dados sociais", "Pesquisa de campo", "Debate sobre diversidade", "Estudo de caso", "Análise de mídia"],
    prova: ["Teorias sociológicas clássicas", "Estratificação social", "Cidadania e direitos", "Violência e segurança", "Gênero e sociedade"],
    sequencia: ["Sociologia no cotidiano", "Juventude e participação", "Redes sociais e sociedade", "Direitos humanos", "Trabalho e tecnologia"],
  },
  "Filosofia": {
    aula: ["O que é filosofia?", "Ética e moral", "Mito e razão", "Filosofia política", "Estética e arte"],
    atividade: ["Análise de textos filosóficos", "Debate socrático", "Dilemas éticos", "Linha do tempo filosófica", "Reflexão sobre liberdade"],
    prova: ["Filosofia antiga", "Filosofia moderna", "Epistemologia", "Existencialismo", "Lógica e argumentação"],
    sequencia: ["Grandes filósofos", "Ética no mundo contemporâneo", "Filosofia e ciência", "Pensar a democracia", "Filosofia e tecnologia"],
  },
};

const defaultSuggestions: Record<string, string[]> = {
  aula: ["Meio ambiente e sustentabilidade", "Diversidade cultural", "Tecnologia e sociedade", "Cidadania e direitos", "Saúde e bem-estar"],
  atividade: ["Interpretação de texto", "Resolução de problemas", "Pesquisa e apresentação", "Trabalho em grupo", "Produção criativa"],
  prova: ["Conteúdo do bimestre", "Revisão geral", "Avaliação diagnóstica", "Avaliação interdisciplinar", "Simulado"],
  sequencia: ["Projeto interdisciplinar", "Aprendizagem baseada em projetos", "Investigação científica", "Cultura e identidade", "Educação ambiental"],
};

const ThemeSuggestions = ({ ano, disciplina, bimestre, mode, value, onChange, placeholder }: ThemeSuggestionsProps) => {
  const [dbSuggestions, setDbSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allFieldsFilled = Boolean(ano && disciplina && bimestre);

  useEffect(() => {
    if (!disciplina || !ano) { setDbSuggestions([]); return; }
    const fetchFromDb = async () => {
      const { data } = await supabase
        .from("bncc_skills")
        .select("objeto_conhecimento")
        .ilike("disciplina", `%${disciplina}%`)
        .ilike("ano", `%${ano.split(" ")[0]}%`)
        .limit(5);
      if (data?.length) {
        const unique = [...new Set(data.map(d => d.objeto_conhecimento).filter(Boolean))] as string[];
        setDbSuggestions(unique.slice(0, 3));
      } else {
        setDbSuggestions([]);
      }
    };
    fetchFromDb();
  }, [ano, disciplina]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const staticList = staticSuggestions[disciplina]?.[mode] || defaultSuggestions[mode] || [];
  const allSuggestions = [...new Set([...dbSuggestions, ...staticList])].slice(0, 8);

  const filtered = value
    ? allSuggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : allSuggestions;

  const shouldShowDropdown = allFieldsFilled && showSuggestions && filtered.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (allFieldsFilled) setShowSuggestions(true);
        }}
        onFocus={() => {
          if (allFieldsFilled) setShowSuggestions(true);
        }}
        placeholder={placeholder}
        required
        className="mt-1"
      />
      {shouldShowDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-medium animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3 text-primary" />
            <span>Sugestões de tema</span>
          </div>
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s);
                setShowSuggestions(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSuggestions;
