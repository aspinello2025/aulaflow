import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Target, Zap, Users, FileText } from "lucide-react";
import planningIcon from "@/assets/feature-planning.jpg";
import bnccIcon from "@/assets/feature-bncc.jpg";
import timeIcon from "@/assets/feature-time.jpg";

const Features = () => {
  const features = [
    {
      icon: <Clock className="w-8 h-8 text-secondary" />,
      image: timeIcon,
      title: "Economia de Tempo",
      description: "Reduza o tempo de planejamento em até 90%. Crie planos completos em minutos, não horas.",
      stats: "90% menos tempo"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-secondary" />,
      image: bnccIcon,
      title: "Alinhamento BNCC",
      description: "Todos os planos são automaticamente alinhados às competências e habilidades da BNCC.",
      stats: "100% conforme BNCC"
    },
    {
      icon: <Target className="w-8 h-8 text-secondary" />,
      image: planningIcon,
      title: "Atividades Personalizadas",
      description: "Receba sugestões de atividades adaptadas ao ano letivo e perfil da turma.",
      stats: "+500 atividades"
    },
    {
      icon: <Zap className="w-8 h-8 text-secondary" />,
      title: "Criação Inteligente",
      description: "IA avançada que entende contexto educacional brasileiro e metodologias pedagógicas."
    },
    {
      icon: <Users className="w-8 h-8 text-secondary" />,
      title: "Colaboração",
      description: "Compartilhe planos com colegas e construa um banco de recursos colaborativo."
    },
    {
      icon: <FileText className="w-8 h-8 text-secondary" />,
      title: "Múltiplos Formatos",
      description: "Exporte em PDF, Word ou use direto na plataforma. Compatível com todos os dispositivos."
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-feature-bg">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Recursos que facilitam sua vida
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra como o AulaFlow transforma o planejamento pedagógico com tecnologia avançada
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-medium transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {feature.image ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      {feature.icon}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    {feature.stats && (
                      <span className="text-sm text-secondary font-semibold">
                        {feature.stats}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;