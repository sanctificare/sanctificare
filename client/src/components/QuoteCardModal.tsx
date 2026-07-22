import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Quote, Sparkles, Link2, Mail, MoreHorizontal, Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { shareText } from "@/lib/share";
import { isMobileApp } from "@/const";

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
  const [copied, setCopied] = useState(false);

  const themeObj = useMemo(
    () => THEMES.find((t) => t.id === selectedTheme) ?? THEMES[0],
    [selectedTheme]
  );

  const shareTextContent = useMemo(() => {
    return `“${quote}”\n\n— ${author} (${bookTitle} • ${dayTitle})`;
  }, [quote, author, bookTitle, dayTitle]);

  const fullShareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareTextContent}\n\nMeditação no aplicativo Sanctificare ✦ ${fullShareUrl}`);
      setCopied(true);
      toast.success("Citação copiada!");
      setTimeout(() => setCopied(false), 2500);
      onClose();
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const shareToWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareTextContent}\n\nMeditação no aplicativo Sanctificare ✦\n${fullShareUrl}`
    )}`;
    window.open(waUrl, "_blank");
    onClose();
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      fullShareUrl
    )}&quote=${encodeURIComponent(shareTextContent)}`;
    window.open(fbUrl, "_blank");
    onClose();
  };

  const shareToX = () => {
    const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      fullShareUrl
    )}&text=${encodeURIComponent(shareTextContent)}`;
    window.open(xUrl, "_blank");
    onClose();
  };

  const shareToEmail = () => {
    const mailUrl = `mailto:?subject=${encodeURIComponent(
      `${bookTitle} — Citação Devocional`
    )}&body=${encodeURIComponent(`${shareTextContent}\n\n${fullShareUrl}`)}`;
    window.open(mailUrl, "_blank");
    onClose();
  };

  const handleNativeShare = async () => {
    const result = await shareText({
      title: `${bookTitle} — Citação`,
      text: `${shareTextContent}\n\n${fullShareUrl}`,
    });

    if (result.status === "shared" || result.status === "copied" || result.status === "cancelled") {
      if (result.status === "copied") {
        toast.success("Citação copiada.");
      }
      onClose();
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
            <Palette size={12} /> Fundo:
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

        {/* Visual Card Preview */}
        <div
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

        {/* Share Buttons Grid (Matching Design) */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 mt-4 pt-3 border-t border-white/10">
          {/* WhatsApp */}
          <button
            onClick={shareToWhatsApp}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#25D366] text-white transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.638 3.973 14.168 2.95 11.55 2.95c-5.436 0-9.862 4.371-9.866 9.8.001 1.761.472 3.483 1.367 5.011L2.054 21.4l3.774-1.22c1.514.825 3.109 1.258 4.791 1.258zM17.476 14.39c-.326-.162-1.926-.95-2.226-1.06-.3-.11-.518-.162-.737.162-.218.324-.846 1.06-1.037 1.277-.19.218-.38.243-.705.082-.325-.162-1.372-.507-2.615-1.618-.967-.864-1.62-1.931-1.81-2.253-.189-.323-.02-.497.142-.658.146-.145.325-.38.488-.57.163-.19.218-.324.325-.54.109-.217.054-.407-.027-.57-.081-.162-.736-1.77-.997-2.4-.266-.643-.538-.553-.737-.563-.19-.01-.408-.012-.627-.012-.218 0-.573.082-.873.408-.3.324-1.144 1.114-1.144 2.716 0 1.603 1.168 3.153 1.33 3.366.163.214 2.3 3.51 5.57 4.922.778.336 1.385.537 1.859.687.781.248 1.492.213 2.054.129.628-.094 1.925-.786 2.197-1.506.273-.72.273-1.334.19-1.464-.082-.13-.298-.21-.624-.372z" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              WhatsApp
            </span>
          </button>

          {/* Facebook */}
          <button
            onClick={shareToFacebook}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#1877F2] text-white transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              Facebook
            </span>
          </button>

          {/* X */}
          <button
            onClick={shareToX}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0f1419] text-white border border-white/10 transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              X
            </span>
          </button>

          {/* E-mail */}
          <button
            onClick={shareToEmail}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#24344d] text-slate-200 border border-white/10 transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              E-mail
            </span>
          </button>

          {/* Copiar Texto */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-amber-950/60 text-amber-400 border border-amber-500/40 transition-transform duration-200 group-hover:scale-110 shadow-lg">
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Link2 className="w-5 h-5" />}
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              {copied ? "Copiado" : "Copiar"}
            </span>
          </button>

          {/* Mais */}
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#1b253b] text-slate-200 border border-white/10 transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              Mais
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
