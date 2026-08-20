import { useState, useRef } from "react";
import { Saint, MONTH_NAMES_PT } from "@/data/santoral";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Share2,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Crown,
  Send,
  Download,
  Image as ImageIcon,
  Loader2,
  Quote
} from "lucide-react";
import { getSaintFormattedShareText, getSaintWhatsAppShareUrl } from "@/lib/saintDevotion";
import { toast } from "sonner";
import { shareImage, copyImageToClipboard } from "@/lib/share";
import { toBlob } from "html-to-image";

interface SaintShareCardModalProps {
  saint: Saint;
  isOpen: boolean;
  onClose: () => void;
}

export default function SaintShareCardModal({ saint, isOpen, onClose }: SaintShareCardModalProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const monthName = MONTH_NAMES_PT[saint.month - 1];
  const shareTextContent = getSaintFormattedShareText(saint);
  const whatsappUrl = getSaintWhatsAppShareUrl(saint);

  const generateCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const blob = await toBlob(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2.5,
        cacheBust: true,
      });
      return blob;
    } catch (err) {
      console.error("Erro ao gerar imagem do card:", err);
      return null;
    }
  };

  const handleShareImage = async () => {
    setIsGeneratingImage(true);
    toast.loading("Preparando card sacro para compartilhar...", { id: "share-card" });

    try {
      const blob = await generateCardBlob();
      if (!blob) {
        toast.error("Não foi possível gerar a imagem do card.", { id: "share-card" });
        setIsGeneratingImage(false);
        return;
      }

      toast.dismiss("share-card");
      const fileName = `Sanctificare_${saint.slug}_${saint.day}_${saint.month}.png`;
      const result = await shareImage(blob, {
        fileName,
        title: `${saint.name} - Santoral Católico`,
        text: `✨ ${saint.name} (${saint.day} de ${monthName})\n"${saint.quote || saint.summary}"\n\nConheça no Sanctificare: https://sanctificare.app/santoral/${saint.slug}`
      });

      if (result.status === "shared") {
        toast.success("Card compartilhado com sucesso!");
      } else if (result.status === "downloaded") {
        toast.success("Card salvo na galeria!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao compartilhar o card.", { id: "share-card" });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    toast.loading("Gerando imagem em alta resolução...", { id: "dl-card" });

    try {
      const blob = await generateCardBlob();
      if (!blob) {
        toast.error("Erro ao gerar imagem.", { id: "dl-card" });
        setIsGeneratingImage(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Santo_${saint.slug}_Sanctificare.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success("Imagem do Card salva com sucesso!", { id: "dl-card" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao baixar a imagem.", { id: "dl-card" });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyImage = async () => {
    setIsGeneratingImage(true);
    toast.loading("Copiando imagem do card...", { id: "copy-img" });

    try {
      const blob = await generateCardBlob();
      if (!blob) {
        toast.error("Erro ao gerar imagem.", { id: "copy-img" });
        setIsGeneratingImage(false);
        return;
      }

      const ok = await copyImageToClipboard(blob);
      if (ok) {
        setCopiedImage(true);
        toast.success("Imagem copiada! Agora você pode colar direto no WhatsApp ou Instagram.", { id: "copy-img" });
        setTimeout(() => setCopiedImage(false), 3000);
      } else {
        // Fallback: faz download se o navegador não permitir copiar imagem
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Santo_${saint.slug}_Sanctificare.png`;
        link.click();
        toast.info("Imagem baixada para a sua galeria!", { id: "copy-img" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível copiar a imagem.", { id: "copy-img" });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareTextContent);
    setCopiedText(true);
    toast.success("Texto e oração copiados com sucesso!");
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="max-w-[390px] sm:max-w-[440px] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-neutral-900 border-amber-500/40 text-neutral-100 rounded-3xl shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-amber-500/10 shrink-0 pr-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <DialogTitle className="font-display font-bold text-base sm:text-lg text-white">
              Compartilhar Card Sacro
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Corpo com Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {/* Card Sacro Renderizável (Target para html-to-image) */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="w-full max-w-[320px] sm:max-w-[340px] rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-2xl flex flex-col items-center text-center space-y-3.5 border-2 border-amber-500/60"
              style={{
                background: "linear-gradient(180deg, #1C1914 0%, #12100D 50%, #0D0C0A 100%)",
                color: "#FFFFFF"
              }}
            >
              {/* Efeito de brilho de fundo */}
              <div
                className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ background: "#D97706" }}
              />
              <div
                className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: "#F59E0B" }}
              />

              {/* Cabeçalho do Card */}
              <div className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider pb-2.5 border-b border-amber-500/30 text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>SANCTIFICARE</span>
                </span>
                <span className="flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Calendar className="w-3 h-3" />
                  <span>{saint.day} de {monthName}</span>
                </span>
              </div>

              {/* Imagem do Santo com Moldura Dourada & Auréola */}
              <div className="relative my-0.5">
                <div
                  className="absolute -inset-2 rounded-2xl blur-md opacity-40"
                  style={{ background: "linear-gradient(45deg, #F59E0B, #D97706)" }}
                />
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl relative bg-neutral-800">
                  <img
                    src={saint.image}
                    alt={saint.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/dashboard/oracoes.webp";
                    }}
                  />
                </div>
              </div>

              {/* Nome e Título do Santo */}
              <div className="space-y-0.5">
                <h4 className="font-display text-lg sm:text-xl font-bold tracking-tight text-amber-200">
                  {saint.name}
                </h4>
                <p className="text-xs text-neutral-300 font-medium line-clamp-1">
                  {saint.title}
                </p>
              </div>

              {/* Frase / Citação em Destaque Nobre */}
              <div className="w-full relative rounded-2xl bg-gradient-to-b from-amber-500/15 to-amber-900/20 p-3.5 border border-amber-500/40 shadow-inner">
                <Quote className="w-3.5 h-3.5 text-amber-400/70 mb-1 mx-auto" />
                <p className="font-serif italic text-xs sm:text-sm text-amber-100 leading-relaxed">
                  "{saint.quote || saint.summary}"
                </p>
              </div>

              {/* Oração de Intercessão (Trecho) */}
              <div className="w-full pt-2 border-t border-amber-500/20 text-center">
                <span className="text-[9px] uppercase tracking-widest font-bold text-amber-400/90 block mb-0.5">
                  Oração do Santo
                </span>
                <p className="font-serif text-[11px] text-neutral-300 line-clamp-2 leading-relaxed italic">
                  "{saint.prayer}"
                </p>
              </div>

              {/* Rodapé Litúrgico */}
              <div className="w-full flex items-center justify-center gap-1.5 text-[9px] font-semibold text-neutral-400 pt-0.5">
                <span>✝️ Sanctificare • Santoral & Liturgia Católica</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação de Alto Engajamento */}
          <div className="space-y-2.5 pt-1">
            {/* Botão Principal: Compartilhar Imagem do Card */}
            <button
              onClick={handleShareImage}
              disabled={isGeneratingImage}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Gerando Card em Alta Resolução...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-neutral-950" />
                  <span>Compartilhar Imagem (WhatsApp / Stories)</span>
                </>
              )}
            </button>

            {/* Grid com Ações Rápidas: WhatsApp Direto, Baixar Imagem, Copiar Imagem */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp Texto</span>
              </a>

              <button
                onClick={handleDownloadImage}
                disabled={isGeneratingImage}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Baixar Card</span>
              </button>

              <button
                onClick={handleCopyImage}
                disabled={isGeneratingImage}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors col-span-2 sm:col-span-1 cursor-pointer"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiada!</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copiar Imagem</span>
                  </>
                )}
              </button>
            </div>

            {/* Botão de Copiar Texto Completo */}
            <button
              onClick={handleCopyText}
              className="w-full py-2 px-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Texto e Oração Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Texto Completo & Oração</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
