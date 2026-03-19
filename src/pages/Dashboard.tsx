import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { supabase } from "@/integrations/supabase/client";

import { BookOpen, FileText, ClipboardList, Calendar, LogOut, Sparkles, History, Home, Lock, Menu, X, Loader2, Share2, PlusCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const modes = [
  {
    id: "aula",
    emoji: "📚",
    title: "Criador de Aula",
    description: "Plano de aula completo alinhado à BNCC",
    cost: 1,
  },
  {
    id: "atividade",
    emoji: "📝",
    title: "Criador de Atividades",
    description: "Atividades prontas para aplicar em sala",
    cost: 1,
  },
  {
    id: "prova",
    emoji: "📊",
    title: "Criador de Prova",
    description: "Provas e avaliações completas",
    cost: 1,
  },
  {
    id: "sequencia",
    emoji: "📅",
    title: "Sequência Didática",
    description: "Sequência de 3 a 5 aulas conectadas",
    cost: 1,
  },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { usage, isLoading, syncSubscription, isSyncing } = useUsage();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check if we just returned from a successful Stripe checkout
    const isSuccess = searchParams.get("subscription") === "success";
    
    const handleSync = async () => {
      if (isSuccess) {
        toast.info("Processando sua assinatura, aguarde um momento...");
        try {
          // Retry logic is now handled more implicitly by the fact that we can call syncSubscription
          // But for "success" param, we definitely want to force a sync.
          await syncSubscription();
          

          toast.success("Assinatura confirmada! Créditos atualizados.");
          setSearchParams({}); // Remove query param
        } catch (e) {
          console.error("Error during subscription sync:", e);
          toast.error("Houve um atraso na confirmação. Os créditos serão atualizados em breve.");
        }
      } else if (usage.limit === 5 && usage.used === 0) {
        // Simple heuristic: If it's a "fresh" looking account (5 credits), sync once to be sure
        // but don't block the UI or show intrusive toasts.
        syncSubscription().catch(console.error);
      }
    };
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    handleSync();

    handleSync();
  }, [user, searchParams, setSearchParams, syncSubscription, usage.planTier]);

  const remaining = usage.limit - usage.used;
  const planNames: Record<string, string> = {
    free: "Plano Gratuito",
    start: "Plano Start",
    pro: "Plano Pro",
    elite: "Plano Elite"
  };
  const planName = planNames[usage.planTier] || "Plano Gratuito";
  const progressPercentage = Math.min(100, Math.max(0, (usage.used / usage.limit) * 100));

  const handleModeClick = (modeId: string) => {
    if (remaining <= 0) {
      setShowPaywall(true);
    } else {
      navigate(`/criar/${modeId}`);
    }
  };

  const handleShare = async (platform?: 'whatsapp' | 'general') => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/?ref=${user?.id}`;
    const shareText = `Olá! 👋 Estou usando o AulaFlow para planejar minhas aulas com IA e é incrível! 🚀 Ganhe tempo e qualidade nos seus planos de aula também. Confira: ${referralLink}`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AulaFlow - Planejamento com IA',
          text: shareText,
          url: referralLink,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link de indicação copiado para a área de transferência!");
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Não foi possível copiar o link automaticamente.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      {/* Mobile Header Menu */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="AulaFlow" className="w-16 h-16 object-contain" />
          <span className="text-lg font-bold text-foreground">AulaFlow</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Panel */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:flex flex-col w-full md:w-72 bg-card border-r border-border p-6 shadow-sm z-50 transition-all fixed md:relative h-screen md:h-screen overflow-y-auto left-0 top-0`}>
        <div className="md:hidden flex items-center justify-between mb-6 border-b border-border pb-2">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="AulaFlow" className="w-10 h-10 object-contain" />
            <span className="text-lg font-bold text-foreground">AulaFlow</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(false)}
            className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Logo - Desktop only */}
        <div className="hidden md:flex items-center space-x-3 mb-8">
          <img src={logo} alt="AulaFlow" className="w-20 h-20 object-contain" />
          <h1 className="text-2xl font-bold text-foreground">AulaFlow</h1>
        </div>

        {/* User Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground truncate">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Professor'}
          </h2>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
            {planName}
          </span>
        </div>

        {/* Navigation */}
        <nav className="mb-8 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={() => { navigate("/"); setIsSidebarOpen(false); }}>
            <Home className="mr-3 h-5 w-5" />
            Início
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={() => { navigate("/historico"); setIsSidebarOpen(false); }}>
            <History className="mr-3 h-5 w-5" />
            Histórico de Materiais
          </Button>
        </nav>

        {/* Credits Status */}
        <div className="mb-8 bg-muted/30 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Créditos</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{isLoading ? "..." : remaining}</span> de {isLoading ? "..." : usage.limit} disponíveis
            </p>
            {(isLoading || isSyncing) && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          {remaining <= 0 && (
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-col items-center text-center space-y-3">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Você ficou sem créditos.</h4>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 w-full">
            <Button 
              variant="hero" 
              size="sm" 
              className="w-full flex-col h-auto py-2 gap-0.5" 
              onClick={() => { navigate("/planos#precos"); setIsSidebarOpen(false); }}
            >
              <span className="font-bold text-sm block leading-tight">Upgrade de Plano</span>
              <span className="text-[10px] font-normal opacity-90 block text-center">Plano mensal com mais créditos</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full text-xs font-semibold gap-2" 
              onClick={() => { navigate("/planos#creditos-avulsos"); setIsSidebarOpen(false); }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              + Créditos Avulsos
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs border-primary/30 hover:bg-primary/10 text-primary hover:text-primary gap-2 transition-colors" 
              onClick={() => { setShowShareDialog(true); setIsSidebarOpen(false); }}
            >
              <Share2 className="h-3.5 w-3.5" />
              Indique e Ganhe 50 créditos
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-border">
           <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {/* Paywall Dialog */}
        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-hero-gradient shadow-medium">
                <Lock className="h-8 w-8 text-primary-foreground" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">Você ficou sem créditos.</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 text-center flex flex-col items-center">
              <Button variant="outline" className="w-full h-12 text-base" onClick={() => { setShowPaywall(false); navigate("/planos#creditos-avulsos"); }}>
                Comprar créditos
              </Button>
              <div className="flex flex-col gap-3 w-full">
                <Button variant="hero" className="w-full flex flex-col h-auto py-3" onClick={() => navigate("/planos#precos")}>
                  <span className="font-bold text-lg">Upgrade de Plano</span>
                  <span className="text-sm font-normal opacity-90 block">150 créditos todo mês</span>
                </Button>
                
                <Button variant="outline" className="w-full py-6" onClick={() => navigate("/planos#creditos-avulsos")}>
                  <div className="flex flex-col items-center">
                    <span className="font-bold">Comprar Créditos Avulsos</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">A partir de R$ 6,00</span>
                  </div>
                </Button>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button variant="ghost" className="w-full" onClick={() => setShowPaywall(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share/Referral Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-6 w-6 text-primary" />
                Indique e Ganhe Créditos!
              </DialogTitle>
              <DialogDescription>
                Compartilhe o AulaFlow com outros professores e **ganhe 50 créditos** por cada indicação que assinar um plano.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-sm italic text-center text-muted-foreground">
                "Olá! 👋 Estou usando o AulaFlow para planejar minhas aulas com IA e é incrível! Ganhe tempo e qualidade também..."
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <Button variant="hero" className="gap-2 bg-[#25D366] hover:bg-[#128C7E] border-none" onClick={() => handleShare('whatsapp')}>
                  <Share2 className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => handleShare('general')}>
                  <PlusCircle className="h-4 w-4" />
                  Outras Opções
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" className="w-full" onClick={() => setShowShareDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="mx-auto max-w-4xl">
          {/* Header info moved to sidebar, so just a welcome message or title if needed. 
              We'll leave a subtle title here. */}
          <div className="mb-8">
             <h2 className="text-2xl font-bold text-foreground">Área de Criação</h2>
             <p className="text-muted-foreground">Escolha o que deseja gerar hoje.</p>
          </div>

          {(isSyncing || searchParams.get("subscription") === "success") && (
            <div className="mb-8 rounded-xl bg-card border border-primary/50 p-4 shadow-soft text-center animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm font-medium text-primary">
                  {searchParams.get("subscription") === "success" 
                    ? "Confirmando sua assinatura e atualizando créditos..." 
                    : "Sincronizando créditos..."}
                </span>
              </div>
            </div>
          )}

          {/* Mode cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode.id)}
                className="group rounded-xl bg-card border border-border p-6 text-left transition-all shadow-soft hover:shadow-medium hover:scale-[1.02] flex flex-col h-full"
              >
                <div className="mb-3 text-4xl">{mode.emoji}</div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {mode.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground flex-1">{mode.description}</p>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
                  Custo: {mode.cost} crédito{mode.cost > 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
