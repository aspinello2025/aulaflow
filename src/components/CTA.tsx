import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-hero-gradient text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Pronto para revolucionar seu planejamento pedagógico?
          </h2>
          
          <p className="text-xl opacity-90 leading-relaxed">
            Junte-se a milhares de professores que já economizam tempo e melhoram a qualidade 
            das suas aulas com o AulaFlow. Comece gratuitamente hoje mesmo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              variant="secondary"
              size="lg"
              className="group min-w-[200px] shadow-strong hover:scale-105 transform transition-all duration-300"
              onClick={() => navigate("/login")}>
              
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            





            
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 pt-8">
            <div className="flex items-center space-x-3 text-primary-foreground/90">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">90% menos tempo</div>
                <div className="text-sm opacity-75">no planejamento</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-primary-foreground/90">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">100% alinhado</div>
                <div className="text-sm opacity-75">com a BNCC</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-primary-foreground/90">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Qualidade garantida</div>
                <div className="text-sm opacity-75">pedagogicamente</div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 text-center">
            <p className="text-sm opacity-75">
              ✨ Sem cartão de crédito • ⚡ Resultados imediatos • 🔒 Dados seguros
            </p>
          </div>
        </div>
      </div>
    </section>);

};

export default CTA;