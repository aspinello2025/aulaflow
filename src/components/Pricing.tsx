import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, School, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";


const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const PAYMENT_LINKS: Record<string, string> = {
    "Start": "https://pay.cakto.com.br/3eejmmz_811032",
    "Pro": "https://pay.cakto.com.br/32ks3fg_811049",
    "Elite": "https://pay.cakto.com.br/3gmtv2h_811050",
    "Avulso 25": "https://pay.cakto.com.br/obg9rwv_811059",
    "Avulso 60": "https://pay.cakto.com.br/ckxoa8u_811057",
    "Avulso 90": "https://pay.cakto.com.br/35dxrt8_811056",
    "Avulso 120": "https://pay.cakto.com.br/vbo8d9c_811053",
  };

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Se temos um link direto, usamos ele
      const directLink = PAYMENT_LINKS[planName];
      if (directLink) {
        window.location.href = directLink;
        return;
      }

      // Caso contrário, tenta via Edge Function (Créditos Avulsos)
      setLoadingPlan(planName);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planName }
      });

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error("Não foi possível gerar o link de pagamento.");

      window.location.href = data.url;

    } catch (error: any) {
      console.error("[Pricing] Erro ao criar checkout:", error);
      const errorMessage = error.message || "Ocorreu um erro ao processar sua assinatura.";
      toast.error(errorMessage, {
        description: "Tente novamente ou entre em contato com o suporte se o erro persistir."
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Start",
      price: "R$ 9,90",
      perCreditPrice: "R$ 0,19 p/ crédito",
      period: "/mês",
      description: "Pare de perder horas planejando aulas básicas",
      features: [
        "50 créditos por mês",
        "Alinhamento BNCC",
        "Geração de Slides",
        "Exportação em PDF",
        "Suporte por email"
      ],
      cta: "Escolher Start",
      variant: "outline" as const,
      popular: false
    },
    {
      name: "Pro",
      price: "R$ 19,90",
      perCreditPrice: "R$ 0,13 p/ crédito",
      period: "/mês",
      description: "Crie aulas completas em minutos, não horas",
      features: [
        "150 créditos por mês",
        "Alinhamento BNCC completo",
        "Geração de Slides",
        "Exportação em múltiplos formatos",
        "Banco de atividades premium",
        "Sugestões personalizadas",
        "Suporte prioritário"
      ],
      cta: "Escolher Pro",
      variant: "hero" as const,
      popular: true
    },
    {
      name: "Elite",
      price: "R$ 39,90",
      perCreditPrice: "R$ 0,11 p/ crédito",
      period: "/mês",
      description: "Para quem não pode perder tempo e precisa escalar",
      features: [
        "350 créditos por mês",
        "Tudo do plano Pro",
        "Geração de Slides",
        "Criação em lote",
        "Relatórios pedagógicos",
        "Prioridade na criação",
        "Suporte dedicado"
      ],
      cta: "Escolher Elite",
      variant: "secondary" as const,
      popular: false
    }
  ];

  return (
    <section id="precos" className="py-20 bg-feature-bg scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Planos para cada necessidade
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para transformar seu planejamento pedagógico
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-medium transition-all duration-300 ${
                plan.popular ? 'border-primary shadow-strong scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="text-sm font-medium text-primary py-1 px-3 bg-primary/10 rounded-full inline-block">
                    {plan.perCreditPrice}
                  </div>
                  <CardDescription className="pt-2">{plan.description}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.variant} 
                  className="w-full"
                  size="lg"
                  disabled={loadingPlan === plan.name}
                  onClick={() => handleSubscribe(plan.name)}
                >
                  {loadingPlan === plan.name ? (
                    <span className="flex items-center gap-2">
                       <Zap className="h-4 w-4 animate-pulse" /> Processando...
                    </span>
                  ) : (
                    <>
                      {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                      {plan.cta}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custo-Benefício e Educacional de Créditos */}
        <div className="max-w-4xl mx-auto mt-16 text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Entenda como seus créditos funcionam</h3>
            <p className="text-muted-foreground">O AulaFlow utiliza um sistema flexível de créditos. Você usa seus créditos conforme a complexidade do material gerado.</p>
          </div>
          
          <div id="creditos-avulsos" className="max-w-3xl mx-auto mt-20 text-center scroll-mt-24">
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent pb-1">
                Adicionar Créditos Avulsos
              </h3>
              <p className="text-muted-foreground mt-3 text-lg">Quanto maior o pacote, mais barato fica cada material</p>
            </div>
            
            <div className="overflow-x-auto bg-card rounded-xl border border-border/50 shadow-soft">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground bg-muted/20">
                    <th className="text-left font-medium py-4 px-6">Pacote de Créditos</th>
                    <th className="text-center font-medium py-4 px-6">Preço Fixo</th>
                    <th className="text-center font-medium py-4 px-6 hidden sm:table-cell">Preço p/ Crédito</th>
                    <th className="text-right font-medium py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-5 px-6 font-semibold text-foreground text-base">25 Créditos</td>
                    <td className="text-center text-muted-foreground px-6 text-base">R$ 6,00</td>
                    <td className="text-center text-muted-foreground px-6 hidden sm:table-cell text-base">R$ 0,24</td>
                    <td className="text-right px-6">
                      <Button 
                        variant="outline" 
                        className="w-[100px] font-medium" 
                        onClick={() => handleSubscribe("Avulso 25")}
                        disabled={loadingPlan === "Avulso 25"}
                      >
                        {loadingPlan === "Avulso 25" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comprar"}
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-5 px-6 font-semibold text-foreground text-base">60 Créditos</td>
                    <td className="text-center text-muted-foreground px-6 text-base">R$ 12,00</td>
                    <td className="text-center text-muted-foreground px-6 hidden sm:table-cell text-base">R$ 0,20</td>
                    <td className="text-right px-6">
                      <Button 
                        variant="outline" 
                        className="w-[100px] font-medium" 
                        onClick={() => handleSubscribe("Avulso 60")}
                        disabled={loadingPlan === "Avulso 60"}
                      >
                        {loadingPlan === "Avulso 60" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comprar"}
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-5 px-6 font-semibold text-foreground text-base">90 Créditos</td>
                    <td className="text-center text-muted-foreground px-6 text-base">R$ 16,00</td>
                    <td className="text-center text-muted-foreground px-6 hidden sm:table-cell text-base">R$ 0,18</td>
                    <td className="text-right px-6">
                      <Button 
                        variant="outline" 
                        className="w-[100px] font-medium" 
                        onClick={() => handleSubscribe("Avulso 90")}
                        disabled={loadingPlan === "Avulso 90"}
                      >
                        {loadingPlan === "Avulso 90" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comprar"}
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-5 px-6 font-semibold text-foreground text-base">120 Créditos</td>
                    <td className="text-center text-muted-foreground px-6 text-base">R$ 22,00</td>
                    <td className="text-center text-muted-foreground px-6 hidden sm:table-cell text-base">R$ 0,18</td>
                    <td className="text-right px-6">
                      <Button 
                        variant="outline" 
                        className="w-[100px] font-medium" 
                        onClick={() => handleSubscribe("Avulso 120")}
                        disabled={loadingPlan === "Avulso 120"}
                      >
                        {loadingPlan === "Avulso 120" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comprar"}
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Plano Escolar */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-medium">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
              <div className="flex-shrink-0">
                <div className="bg-hero-gradient rounded-2xl w-16 h-16 flex items-center justify-center">
                  <School className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Plano Escolar</h3>
                <p className="text-muted-foreground">
                  Solução completa para escolas e redes de ensino. Inclui até 10 professores com acesso completo, painel de gestão, relatórios e suporte dedicado.
                </p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-foreground">A partir de R$ 499,00</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>
              <Button variant="hero" size="lg" onClick={() => navigate("/login")}>
                Falar com Vendas
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="text-center mt-12 space-y-4">
          <p className="text-muted-foreground">
            Todos os planos incluem 7 dias de teste grátis • Cancele a qualquer momento
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
