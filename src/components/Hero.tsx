import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, BookOpen, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-teacher.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-20 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-foreground leading-tight">
                E se você nunca mais precisasse criar plano de aula do zero —{" "}
                <span className="bg-hero-gradient bg-clip-text text-transparent">
                  nem adaptar o de outro professor?
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                AulaFlow é uma IA que conversa com você e cria planos de aula completos, 
                personalizados para sua turma. Sem complicação, sem instalar nada.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group" onClick={() => navigate("/login")}>
                Criar Primeiro Plano
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}>
                Ver Demonstração
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-sm">Economia de 90% do tempo</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <BookOpen className="w-5 h-5 text-secondary" />
                <span className="text-sm">100% alinhado à BNCC</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Target className="w-5 h-5 text-secondary" />
                <span className="text-sm">Atividades personalizadas</span>
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-hero-gradient rounded-3xl blur-3xl opacity-20 scale-105"></div>
            <img 
              src={heroImage} 
              alt="Professor planejando aulas com AulaFlow"
              className="relative rounded-3xl shadow-strong w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
