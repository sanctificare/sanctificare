import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quote, Share2, Copy, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { shareText } from "@/lib/share";

interface QuoteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  bookTitle: string;
  author: string;
  dayTitle: string;
}

export default function QuoteCardModal({
  isOpen,
  onClose,
  quote,
  bookTitle,
  author,
  dayTitle,
}: QuoteCardModalProps) {
  const [copied, setCopied] = React.useState(false);

  const formattedShareText = `“${quote}”\n\n— ${author} (${bookTitle} • ${dayTitle})\n\nMeditação diária no aplicativo Sanctificare ✦`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareText);
      setCopied(true);
      toast.success("Citação copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Erro ao copiar citação.");
    }
  };

  const handleShare = async () => {
    await shareText({
      title: `${bookTitle} — Citação do Dia`,
      text: formattedShareText,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0b1329] border border-amber-500/30 text-slate-100 p-6 rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-amber-400">
            <Sparkles size={16} />
            Card Devocional para Compartilhar
          </DialogTitle>
        </DialogHeader>

        {/* Visual Preview Card */}
        <div className="relative rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#141e38] to-[#0a1024] p-6 text-center shadow-xl space-y-4 my-2 overflow-hidden group">
          <div className="absolute w-40 h-40 rounded-full bg-amber-500/10 blur-3xl -top-10 -right-10 pointer-events-none" />
          <div className="absolute w-40 h-40 rounded-full bg-amber-500/5 blur-3xl -bottom-10 -left-10 pointer-events-none" />

          {/* Cross/Branding header */}
          <div className="flex items-center justify-center gap-2 text-amber-400/80">
            <span className="h-[1px] w-8 bg-amber-500/30" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest font-serif">Sanctificare ✦ Degraus</span>
            <span className="h-[1px] w-8 bg-amber-500/30" />
          </div>

          <Quote size={28} className="mx-auto text-amber-500/60 stroke-[1.5]" />

          <blockquote className="font-serif italic text-base leading-relaxed text-slate-100 font-medium px-2">
            “{quote}”
          </blockquote>

          <div className="pt-2 border-t border-amber-500/15 flex flex-col items-center gap-0.5">
            <p className="text-xs font-bold text-amber-400">{author}</p>
            <p className="text-[10px] text-slate-400 font-sans">{bookTitle} • {dayTitle}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider h-10 rounded-xl cursor-pointer"
          >
            {copied ? <Check size={14} className="mr-1.5 text-emerald-400" /> : <Copy size={14} className="mr-1.5" />}
            {copied ? "Copiado!" : "Copiar Texto"}
          </Button>

          <Button
            onClick={handleShare}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider h-10 rounded-xl cursor-pointer shadow-md"
          >
            <Share2 size={14} className="mr-1.5" />
            Compartilhar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
