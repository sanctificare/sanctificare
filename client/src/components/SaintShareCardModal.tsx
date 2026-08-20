import { useState } from "react";
import { Saint, MONTH_NAMES_PT } from "@/data/santoral";
import {
  X,
  Share2,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Crown,
  Send
} from "lucide-react";
import { getSaintFormattedShareText, getSaintWhatsAppShareUrl } from "@/lib/saintDevotion";
import { toast } from "sonner";
import { shareText } from "@/lib/share";

interface SaintShareCardModalProps {
  saint: Saint;
  isOpen: boolean;
  onClose: () => void;
}

export default function SaintShareCardModal({ saint, isOpen, onClose }: SaintShareCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const monthName = MONTH_NAMES_PT[saint.month - 1];
  const shareTextContent = getSaintFormattedShareText(saint);
  const whatsappUrl = getSaintWhatsAppShareUrl(saint);

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareTextContent);
    setCopied(true);
    toast.success("Texto formatado copiado com sucesso!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    await shareText({
      title: `${saint.name} - Santoral Sanctificare`,
      text: shareTextContent,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
              Compartilhar Santo do Dia
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Card Preview */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Card Sacro Renderizado */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#FAF7EE] via-white to-[#F5EFE0] dark:from-[#1E1B15] dark:via-[#171512] dark:to-[#13110E] p-6 border-2 border-amber-500/40 shadow-md text-center space-y-4">
            {/* Top Badge */}
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300 pb-2 border-b border-amber-500/20">
              <span className="flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-600" /> Sanctificare
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {saint.day} de {monthName}
              </span>
            </div>

            {/* Imagem do Santo com Auréola */}
            <div className="relative inline-block mx-auto">
              <div className="absolute -inset-2 rounded-2xl bg-amber-500/20 blur-md -z-10" />
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg mx-auto bg-amber-100 dark:bg-amber-950">
                <img
                  src={saint.image}
                  alt={saint.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Títulos */}
            <div>
              <h4 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {saint.name}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                {saint.title}
              </p>
            </div>

            {/* Citação ou Resumo */}
            {saint.quote ? (
              <blockquote className="font-serif italic text-xs sm:text-sm text-amber-900 dark:text-amber-200 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                "{saint.quote}"
              </blockquote>
            ) : (
              <p className="text-xs text-foreground/80 leading-relaxed font-serif line-clamp-3">
                {saint.summary}
              </p>
            )}

            {/* Trecho da Oração */}
            <div className="pt-2 border-t border-amber-500/20 text-left">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-1 text-center">
                Oração de Intercessão
              </span>
              <p className="font-serif italic text-xs text-foreground/80 leading-relaxed text-center line-clamp-3">
                "{saint.prayer}"
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Enviar pelo WhatsApp</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyText}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-border/50 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Mensagem</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Outros Aplicativos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
