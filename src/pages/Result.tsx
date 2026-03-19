import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download, Check, Pencil, Eye, FileText, File } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsage } from "@/hooks/useUsage";
import { Presentation, Loader2, PlayCircle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Result = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [generation, setGeneration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { usage, syncSubscription } = useUsage();
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slides, setSlides] = useState<any[]>([]);
  const [showSlidesDialog, setShowSlidesDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Erro ao carregar resultado");
        navigate("/dashboard");
        return;
      }
      setGeneration(data);
      setEditedContent(data.result || "");
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing, editedContent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    toast.success("Conteúdo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    
    // Create a temporary styled element for PDF
    const tempDiv = document.createElement("div");
    tempDiv.style.padding = "40px";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.fontSize = "14px";
    tempDiv.style.lineHeight = "1.6";
    tempDiv.style.color = "#1a1a1a";
    
    // Render markdown-like content as HTML
    const htmlContent = editedContent
      .replace(/^# (.+)$/gm, '<h1 style="font-size:24px;font-weight:bold;margin:16px 0 8px">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:bold;margin:14px 0 6px">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="font-size:17px;font-weight:bold;margin:12px 0 4px">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li style="margin-left:20px">$1</li>')
      .replace(/\n/g, '<br>');
    
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `aulaflow-${generation.mode}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(tempDiv)
      .save();

    document.body.removeChild(tempDiv);
    toast.success("PDF exportado com sucesso!");
  };

  const handleExportDOC = async () => {
    // ... (existing code for DOC export)
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
    const { saveAs } = await import("file-saver");

    const lines = editedContent.split("\n");
    const paragraphs: any[] = [];

    for (const line of lines) {
      if (line.startsWith("# ")) {
        paragraphs.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 }));
      } else if (line.startsWith("## ")) {
        paragraphs.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 }));
      } else if (line.startsWith("### ")) {
        paragraphs.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 }));
      } else if (line.startsWith("- ")) {
        const parts = line.slice(2).split(/\*\*(.+?)\*\*/g);
        const runs = parts.map((part, i) =>
          new TextRun({ text: part, bold: i % 2 === 1 })
        );
        paragraphs.push(new Paragraph({ children: runs, bullet: { level: 0 } }));
      } else if (line.trim() === "") {
        paragraphs.push(new Paragraph({ text: "" }));
      } else {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        const runs = parts.map((part, i) =>
          new TextRun({ text: part, bold: i % 2 === 1 })
        );
        paragraphs.push(new Paragraph({ children: runs }));
      }
    }

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `aulaflow-${generation.mode}-${new Date().toISOString().slice(0, 10)}.docx`);
    toast.success("DOC exportado com sucesso!");
  };

  const handleGenerateSlides = async () => {
    // All plans can now generate slides
    const remaining = usage.limit - usage.used;
    if (remaining < 5) {
      toast.error("Você precisa de pelo menos 5 créditos para gerar slides.");
      return;
    }

    setIsGeneratingSlides(true);
    try {
      const invokeOptions: any = {
        body: { content: editedContent },
      };

      if (usage.planTier === "elite" && !supabase.auth.getSession()) {
        // If we are in mock mode (Elite but no real session)
        invokeOptions.headers = {
          Authorization: "Bearer mock-token-elite",
        };
      }

      const { data, error } = await supabase.functions.invoke("generate-slides", invokeOptions);

      if (error) throw error;

      setSlides(data.slides);
      setShowSlidesDialog(true);
      await syncSubscription(); // Update credits in UI
      toast.success("Slides gerados com sucesso!");
    } catch (err: any) {
      console.error("Slide gen error:", err);
      toast.error(err.message || "Erro ao gerar slides.");
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const handleDownloadSlidesPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    
    const tempDiv = document.createElement("div");
    tempDiv.style.width = "100%";
    
    slides.forEach((slide, index) => {
      const slideDiv = document.createElement("div");
      slideDiv.className = "slide-page";
      slideDiv.style.width = "297mm"; // A4 landscape ratio-ish
      slideDiv.style.height = "210mm";
      slideDiv.style.padding = "40px";
      slideDiv.style.display = "flex";
      slideDiv.style.flexDirection = "column";
      slideDiv.style.justifyContent = "center";
      slideDiv.style.backgroundColor = "#ffffff";
      slideDiv.style.color = "#1a1a1a";
      slideDiv.style.fontFamily = "Arial, sans-serif";
      slideDiv.style.pageBreakAfter = "always";
      slideDiv.style.border = "1px solid #eee";
      
      const title = document.createElement("h1");
      title.style.fontSize = "42px";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "30px";
      title.style.color = "#7c3aed"; // Primary brand color
      title.innerText = slide.titulo;
      slideDiv.appendChild(title);
      
      const list = document.createElement("ul");
      list.style.fontSize = "28px";
      list.style.lineHeight = "1.5";
      list.style.listStyleType = "disc";
      list.style.paddingLeft = "40px";
      
      slide.topicos.forEach((topic: string) => {
        const item = document.createElement("li");
        item.style.marginBottom = "15px";
        item.innerText = topic;
        list.appendChild(item);
      });
      
      slideDiv.appendChild(list);
      tempDiv.appendChild(slideDiv);
    });
    
    document.body.appendChild(tempDiv);

    await html2pdf()
      .set({
        margin: 0,
        filename: `slides-aulaflow-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .from(tempDiv)
      .save();

    document.body.removeChild(tempDiv);
    toast.success("PDF de slides pronto!");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  const inputData = generation?.input_data as any;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>

        {/* Meta info */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
            {generation.mode}
          </span>
          {inputData?.disciplina && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {inputData.disciplina}
            </span>
          )}
          {inputData?.ano && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {inputData.ano}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {isEditing ? "Visualizar" : "Editar"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar como PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDOC}>
                <File className="h-4 w-4 mr-2" />
                Exportar como DOC
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Slides Action - Separate Line */}
        <div className="mb-4">
          <Button
            variant="hero"
            size="sm"
            onClick={handleGenerateSlides}
            disabled={isGeneratingSlides}
            className="w-full sm:w-auto shadow-sm"
          >
            {isGeneratingSlides ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Presentation className="h-4 w-4" />
            )}
            Gerar Slides (5 cr.)
          </Button>
        </div>

        {/* Content */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-soft">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[400px] bg-transparent text-foreground leading-relaxed font-mono text-sm border-none outline-none resize-none focus:ring-0"
              spellCheck={false}
            />
          ) : (
            <div ref={contentRef} className="prose prose-sm max-w-none text-foreground leading-relaxed dark:prose-invert">
              <ReactMarkdown>{editedContent}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Slides Dialog */}
        <Dialog open={showSlidesDialog} onOpenChange={setShowSlidesDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Presentation className="h-6 w-6 text-primary" />
                Sua Apresentação de Slides
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {slides.map((slide, index) => (
                <div key={index} className="rounded-xl border border-border p-6 bg-muted/30 aspect-[16/10] flex flex-col justify-center shadow-sm">
                  <h4 className="text-lg font-bold text-primary mb-4 leading-tight">
                    {slide.titulo}
                  </h4>
                  <ul className="space-y-2">
                    {slide.topicos.map((topic: string, i: number) => (
                      <li key={i} className="text-sm text-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-[10px] text-muted-foreground text-right italic">
                    Slide {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="hero"
                className="w-full sm:w-auto"
                onClick={handleDownloadSlidesPDF}
              >
                <Download className="h-4 w-4" />
                Baixar Slides em PDF
              </Button>
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => setShowSlidesDialog(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Upgrade de Plano Necessário
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-foreground text-center">
                Você precisa de mais créditos para usar essa função.
              </p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                A geração de slides consome 5 créditos por uso.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                variant="hero" 
                className="w-full py-6"
                onClick={() => navigate("/planos#precos")}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-white">Ver Planos Mensais</span>
                  <span className="text-xs font-normal opacity-90">Opções com melhor custo-benefício</span>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full py-6 border-primary/20 hover:bg-primary/5"
                onClick={() => navigate("/planos#creditos-avulsos")}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-primary">Comprar Créditos Avulsos</span>
                  <span className="text-xs font-normal text-muted-foreground">Adicione créditos agora sem assinatura</span>
                </div>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowUpgradeDialog(false)}
              >
                Agora não
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Result;
