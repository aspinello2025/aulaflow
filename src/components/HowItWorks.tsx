import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      title: "Insira as informações",
      description: "Tema da aula, disciplina, ano letivo e objetivos específicos",
      icon: <CheckCircle className="w-6 h-6 text-secondary" />
    },
    {
      number: "02", 
      title: "IA gera o plano",
      description: "Nossa IA cria um plano detalhado alinhado à BNCC em segundos",
      icon: <ArrowRight className="w-6 h-6 text-secondary" />
    },
    {
      number: "03",
      title: "Revise e personalize",
      description: "Ajuste atividades, recursos e metodologias conforme sua preferência",
      icon: <CheckCircle className="w-6 h-6 text-secondary" />
    },
    {
      number: "04",
      title: "Exporte e use",
      description: "Baixe em PDF, compartilhe com colegas ou use direto na sala",
      icon: <Download className="w-6 h-6 text-secondary" />
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Como funciona
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Planejamento pedagógico inteligente em 4 passos simples
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="bg-hero-gradient text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {step.number}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-feature-bg rounded-3xl p-12 shadow-medium flex flex-col items-center justify-center text-center space-y-6">
            <h3 className="text-2xl font-bold text-foreground">
              Pronto para começar?
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Crie sua conta e ganhe 5 créditos gratuitos para testar o AulaFlow agora mesmo.
            </p>
            <Button variant="hero" size="lg" className="group" onClick={() => navigate("/login")}>
              Testar Agora Grátis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-muted-foreground">
              5 créditos grátis • Acesso instantâneo • Sem cartão de crédito
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
