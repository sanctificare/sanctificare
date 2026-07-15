import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shareText } from "@/lib/share";
import { Link2, Mail, MoreHorizontal } from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "sonner";

import { isMobileApp } from "@/const";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url: string;
  artworkUrl?: string;
}

const FALLBACK_ARTWORK_URL = "/assets/sanctificare-logo-v2.webp";

export default function ShareModal({
  isOpen,
  onClose,
  title,
  description,
  url,
  artworkUrl,
}: ShareModalProps) {
  const isLogo = useMemo(() => {
    const artUrl = artworkUrl || FALLBACK_ARTWORK_URL;
    const lower = artUrl.toLowerCase();
    return (
      lower.includes("logo-sanctificare") ||
      lower.includes("logo_sanctificare") ||
      lower.includes("sanctificare-logo") ||
      lower.includes("logo")
    );
  }, [artworkUrl]);

  const shareTextContent = useMemo(() => {
    return `${description || `Estou ouvindo "${title}" no Sanctificare.`}`;
  }, [title, description]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
      onClose();
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const shareToWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareTextContent}\n\n${url}`
    )}`;
    window.open(waUrl, "_blank");
    onClose();
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(fbUrl, "_blank");
    onClose();
  };

  const shareToX = () => {
    const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(shareTextContent)}`;
    window.open(xUrl, "_blank");
    onClose();
  };

  const shareToEmail = () => {
    const mailUrl = `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(`${shareTextContent}\n\n${url}`)}`;
    window.open(mailUrl, "_blank");
    onClose();
  };

  const handleNativeShare = async () => {
    // Falls back to navigator.share/Capacitor share when clicking "Mais"
    const result = await shareText({
      title,
      text: `${shareTextContent} ${url}`,
    });

    if (result.status === "shared" || result.status === "copied" || result.status === "cancelled") {
      if (result.status === "copied") {
        toast.success("Link copiado para compartilhar.");
      }
      onClose();
    }
  };

  const hasNativeShare = (typeof navigator !== "undefined" && !!navigator.share) || isMobileApp();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[340px] md:max-w-[380px] bg-[#111726]/95 border-amber-500/20 backdrop-blur-md rounded-3xl p-6 text-white text-center shadow-2xl">
        <DialogHeader className="p-0 mb-4">
          <DialogTitle className="text-center text-lg font-semibold tracking-wide text-amber-500/90 uppercase font-sans">
            Compartilhar
          </DialogTitle>
        </DialogHeader>

        {/* Visual Preview Card */}
        <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-3xl overflow-hidden border border-amber-500/20 shadow-xl bg-[#151f32]">
          <img
            src={artworkUrl || FALLBACK_ARTWORK_URL}
            alt={title}
            className={`w-full h-full transition-transform duration-500 hover:scale-105 ${
              isLogo ? "object-contain p-4" : "object-cover"
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_ARTWORK_URL;
            }}
          />
          {/* Card Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111726] via-[#111726]/85 to-transparent pt-16 pb-5 px-4 text-center">
            <h4 className="text-white font-semibold text-sm line-clamp-2 leading-snug drop-shadow-md">
              {title}
            </h4>
            <span className="block text-amber-500/80 font-serif text-[10px] tracking-[0.25em] uppercase font-bold mt-1.5 drop-shadow-sm">
              Sanctificare
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 mt-6 pt-2 border-t border-white/5">
          {/* WhatsApp */}
          <button
            onClick={shareToWhatsApp}
            className="flex flex-col items-center gap-1.5 focus:outline-none group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#25D366] text-white transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
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
            className="flex flex-col items-center gap-1.5 focus:outline-none group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1877F2] text-white transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
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
            className="flex flex-col items-center gap-1.5 focus:outline-none group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0f1419] text-white border border-white/10 transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              X
            </span>
          </button>

          {/* Email */}
          <button
            onClick={shareToEmail}
            className="flex flex-col items-center gap-1.5 focus:outline-none group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-700 text-white transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              E-mail
            </span>
          </button>

          {/* Copiar Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5 focus:outline-none group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 transition-transform duration-200 group-hover:scale-110 shadow-lg">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">
              Copiar Link
            </span>
          </button>

          {/* Mais (Show only if browser has share support or native) */}
          {hasNativeShare && (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 focus:outline-none group"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800 text-white transition-transform duration-200 group-hover:scale-110 shadow-lg">
                <MoreHorizontal className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-300 font-medium tracking-wide">
                Mais
              </span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
