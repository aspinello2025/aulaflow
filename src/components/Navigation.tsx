import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Sparkles, Loader2 } from "lucide-react";

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    
    // Pages that contain the anchors
    const pricingAnchors = ['#precos', '#creditos-avulsos'];
    const featuresAnchors = ['#recursos', '#como-funciona'];
    
    const isPricingPage = location.pathname === '/planos';
    const isHomePage = location.pathname === '/';
    
    // Determine if we should scroll or navigate
    const shouldScroll = (isHomePage) || (isPricingPage && pricingAnchors.includes(hash));
    
    if (shouldScroll) {
      const element = document.querySelector(hash);
      if (element) {
        const offset = 80; // Account for fixed header
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
        // Update URL hash without jumping
        window.history.pushState(null, '', hash);
        return;
      }
    }
    
    // If not on the right page, navigate to home + hash
    navigate(`/${hash}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="AulaFlow" className="w-16 h-16 object-contain" />
            <span className="text-xl font-bold text-foreground">AulaFlow</span>
            <span className="text-sm font-medium text-muted-foreground ml-2">oi</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#recursos" onClick={(e) => handleNavClick(e, '#recursos')} className="text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="/#como-funciona" onClick={(e) => handleNavClick(e, '#como-funciona')} className="text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="/#precos" onClick={(e) => handleNavClick(e, '#precos')} className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="/planos#creditos-avulsos" onClick={(e) => handleNavClick(e, '#creditos-avulsos')} className="text-muted-foreground hover:text-foreground transition-colors font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Créditos
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")}>
                Meu Painel
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate("/login")}>
                  Entrar
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/login")}>
                  Começar Grátis
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
