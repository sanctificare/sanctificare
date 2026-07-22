import React, { useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Quote,
  Sparkles,
  Palette,
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { shareImage, shareText, copyImageToClipboard } from "@/lib/share";
import { toBlob } from "html-to-image";

interface QuoteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  bookTitle: string;
  author: string;
  dayTitle: string;
}

type CardTheme = "noite" | "pergaminho" | "celestial" | "marmore" | "vinho";

interface ThemeOption {
  id: CardTheme;
  name: string;
  bgPreview: string;
  cardClass: string;
  quoteClass: string;
  textClass: string;
  authorClass: string;
  subtextClass: string;
  borderClass: string;
  headerLineClass: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "noite",
    name: "Noite Sacra",
    bgPreview: "bg-[#0b1329]",
    cardClass: "bg-gradient-to-b from-[#141e38] to-[#0a1024] border-amber-500/30 text-slate-100",
    quoteClass: "text-amber-500/70",
    textClass: "text-slate-100 font-serif",
    authorClass: "text-amber-400 font-bold",
    subtextClass: "text-slate-400 font-sans",
    borderClass: "border-amber-500/20",
    headerLineClass: "bg-amber-500/30 text-amber-400/80",
  },
  {
    id: "pergaminho",
    name: "Pergaminho Devoto",
    bgPreview: "bg-[#f5f0e6]",
    cardClass: "bg-[#f7f2e8] border-[#c8b693] text-[#2c1d11]",
    quoteClass: "text-[#8c6d46]",
    textClass: "text-[#2c1d11] font-serif font-semibold",
    authorClass: "text-[#8c2d19] font-bold",
    subtextClass: "text-[#6b5847] font-sans",
    borderClass: "border-[#c8b693]/40",
    headerLineClass: "bg-[#8c6d46]/30 text-[#8c6d46]",
  },
  {
    id: "celestial",
    name: "Aura Celestial",
    bgPreview: "bg-[#081a3e]",
    cardClass: "bg-gradient-to-b from-[#0e2a66] to-[#061433] border-cyan-400/30 text-white",
    quoteClass: "text-cyan-300/80",
    textClass: "text-cyan-50 font-serif",
    authorClass: "text-amber-300 font-bold",
    subtextClass: "text-cyan-200/70 font-sans",
    borderClass: "border-cyan-400/20",
    headerLineClass: "bg-cyan-400/30 text-cyan-300",
  },
  {
    id: "marmore",
    name: "Mármore Claro",
    bgPreview: "bg-[#f8f9fa]",
    cardClass: "bg-white border-slate-300 text-slate-900 shadow-md",
    quoteClass: "text-amber-600/80",
    textClass: "text-slate-900 font-serif font-semibold",
    authorClass: "text-amber-700 font-bold",
    subtextClass: "text-slate-500 font-sans",
    borderClass: "border-slate-200",
    headerLineClass: "bg-amber-600/30 text-amber-700",
  },
  {
    id: "vinho",
    name: "Vinho Sacramental",
    bgPreview: "bg-[#2b0914]",
    cardClass: "bg-gradient-to-b from-[#3d0f1f] to-[#1d050e] border-rose-400/30 text-rose-50",
    quoteClass: "text-rose-400/80",
    textClass: "text-rose-50 font-serif",
    authorClass: "text-amber-300 font-bold",
    subtextClass: "text-rose-200/70 font-sans",
    borderClass: "border-rose-400/20",
    headerLineClass: "bg-rose-400/30 text-rose-300",
  },
];

export default function QuoteCardModal({
  isOpen,
  onClose,
  quote,
  bookTitle,
  author,
  dayTitle,
}: QuoteCardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>("noite");
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const themeObj = useMemo(
    () => THEMES.find((t) => t.id === selectedTheme) ?? THEMES[0],
    [selectedTheme]
  );

  const shareTextContent = useMemo(() => {
    return `“${quote}”\n\n— ${author} (${bookTitle} • ${dayTitle})`;
  }, [quote, author, bookTitle, dayTitle]);

  const fullShareUrl = typeof window !== "undefined" ? window.location.href : "";

  const captureCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
      });
      return blob;
    } catch (err) {
      console.error("Erro ao gerar imagem do card:", err);
      return null;
    }
  };

  /**
   * Main Action: Shares the Card Image natively on any device
   */
  const handleShareCardImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    toast.info("Gerando imagem do card...");

    const blob = await captureCardBlob();
    setIsGenerating(false);

    if (!blob) {
      toast.error("Não foi possível criar a imagem do card.");
      return;
    }

    const fileName = `sanctificare-citacao-${selectedTheme}.png`;

    const result = await shareImage(blob, {
      fileName,
      title: `${bookTitle} — Citação`,
      text: `${shareTextContent}\n\n${fullShareUrl}`,
    });

    if (result.status === "shared") {
      toast.success("Card compartilhado com sucesso!");
      onClose();
    } else if (result.status === "downloaded") {
      toast.success("Imagem do Card baixada!");
      onClose();
    }
  };

  /**
   * Copy the generated PNG image directly to system clipboard
   */
  const handleCopyImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    toast.info("Copiando imagem do card...");

    const blob = await captureCardBlob();
    setIsGenerating(false);

    if (!blob) {
      toast.error("Não foi possível gerar a imagem.");
      return;
    }

    const success = await copyImageToClipboard(blob);
    if (success) {
      setCopiedImage(true);
      toast.success("Imagem do Card copiada!", {
        description: "Cole em qualquer conversa (WhatsApp, Instagram, Telegram).",
      });
      setTimeout(() => setCopiedImage(false), 3000);
      onClose();
    } else {
      // Se a cópia de imagem não for suportada no browser atual, baixa a imagem
      handleDownloadImage();
    }
  };

  /**
   * Download PNG image directly to photos / gallery
   */
  const handleDownloadImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    toast.info("Baixando imagem do card...");

    const blob = await captureCardBlob();
    setIsGenerating(false);

    if (!blob) {
      toast.error("Não foi possível salvar a imagem.");
      return;
    }

    const fileName = `sanctificare-citacao-${selectedTheme}.png`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Imagem salva na galeria!", {
      description: "Pronta para postar no Instagram Stories ou Feed.",
    });
    onClose();
  };

  /**
   * Copy formatted plain text to clipboard
   */
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        `${shareTextContent}\n\nMeditação no aplicativo Sanctificare ✦ ${fullShareUrl}`
      );
      setCopiedText(true);
      toast.success("Texto da citação copiado!");
      setTimeout(() => setCopiedText(false), 2500);
      onClose();
    } catch {
      toast.error("Não foi possível copiar o texto.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[340px] md:max-w-[400px] bg-[#0b1329] border border-amber-500/30 text-slate-100 p-5 rounded-3xl shadow-2xl overflow-hidden">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold text-amber-400">
            <Sparkles size={15} />
            Compartilhar Citação
          </DialogTitle>
        </DialogHeader>

        {/* Theme Selector */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Palette size={12} /> Estilo:
          </span>
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                title={theme.name}
                className={`w-6 h-6 rounded-full ${theme.bgPreview} transition-all border cursor-pointer ${
                  selectedTheme === theme.id
                    ? "ring-2 ring-amber-400 scale-110 border-white"
                    : "opacity-70 hover:opacity-100 border-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Visual Card Node to Render as Image */}
        <div
          ref={cardRef}
          className={`relative rounded-2xl border p-5 text-center shadow-xl space-y-3 transition-all duration-300 overflow-hidden ${themeObj.cardClass}`}
        >
          {/* Subtle background glow */}
          <div className="absolute w-36 h-36 rounded-full bg-amber-500/10 blur-3xl -top-8 -right-8 pointer-events-none" />

          {/* Card Header Branding */}
          <div className="flex items-center justify-center gap-2 opacity-80">
            <span className={`h-[1px] w-6 ${themeObj.headerLineClass}`} />
            <span className="text-[9px] font-extrabold uppercase tracking-widest font-serif">
              Sanctificare ✦ Degraus
            </span>
            <span className={`h-[1px] w-6 ${themeObj.headerLineClass}`} />
          </div>

          <Quote size={24} className={`mx-auto stroke-[1.5] ${themeObj.quoteClass}`} />

          <blockquote className={`italic text-sm leading-relaxed font-medium px-1 ${themeObj.textClass}`}>
            “{quote}”
          </blockquote>

          <div className={`pt-2 border-t flex flex-col items-center gap-0.5 ${themeObj.borderClass}`}>
            <p className={`text-xs ${themeObj.authorClass}`}>{author}</p>
            <p className={`text-[9px] ${themeObj.subtextClass}`}>{bookTitle} • {dayTitle}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5 mt-4 pt-3 border-t border-white/10">
          {/* 1. Main Action Button: Share Image (Native Sheet with Image File) */}
          <button
            onClick={handleShareCardImage}
            disabled={isGenerating}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs xs:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando Imagem...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Compartilhar Imagem do Card</span>
              </>
            )}
          </button>

          {/* 2. Secondary Actions Grid (Copiar Imagem, Baixar Imagem, Copiar Texto) */}
          <div className="grid grid-cols-3 gap-2">
            {/* Copiar Imagem */}
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="h-10 px-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 font-medium text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Copiar imagem para colar no WhatsApp / Instagram"
            >
              {copiedImage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiada</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copiar Card</span>
                </>
              )}
            </button>

            {/* Baixar Imagem (Instagram / Stories) */}
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="h-10 px-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 font-medium text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Salvar imagem no celular"
            >
              <Download className="w-3.5 h-3.5 text-pink-400" />
              <span>Baixar Card</span>
            </button>

            {/* Copiar Texto */}
            <button
              onClick={handleCopyText}
              disabled={isGenerating}
              className="h-10 px-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 font-medium text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Copiar texto da citação"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
