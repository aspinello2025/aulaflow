import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="AulaFlow" className="w-16 h-16 object-contain" />
              <span className="text-xl font-bold text-foreground">AulaFlow</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Transformando o planejamento pedagógico brasileiro com inteligência artificial 
              e alinhamento total à BNCC.
            </p>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">São Paulo, Brasil</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Produto</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#recursos" className="hover:text-foreground transition-colors">Recursos</a></li>
              <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a></li>
              <li><a href="#precos" className="hover:text-foreground transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Demonstração</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Suporte</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentação BNCC</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tutoriais</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Status do Sistema</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:contato@aulaflow.com.br" className="hover:text-foreground transition-colors">
                  contato@aulaflow.com.br
                </a>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>(11) 94519-8994</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <a href="#" className="hover:text-foreground transition-colors">
                  Blog Educacional
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground text-sm">
            © 2026 AulaFlow. Todos os direitos reservados.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;