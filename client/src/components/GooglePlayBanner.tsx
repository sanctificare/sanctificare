import { isMobileApp } from "@/const";
import { QrCode, Smartphone, Bell, Flame, Download, ExternalLink, X } from "lucide-react";
import { useState, useEffect } from "react";

export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.sanctificare.app";
export const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0c1327&bgcolor=ffffff&data=${encodeURIComponent(GOOGLE_PLAY_URL)}`;

interface GooglePlayBannerProps {
  variant?: "section" | "card" | "inline";
  showDismiss?: boolean;
}

export default function GooglePlayBanner({
  variant = "section",
  showDismiss = false,
}: GooglePlayBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (showDismiss) {
      const isDismissed = localStorage.getItem("sanctificare.gplay_banner.dismissed") === "true";
      setDismissed(isDismissed);
    }
  }, [showDismiss]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("sanctificare.gplay_banner.dismissed", "true");
  };

  // Não exibe se o usuário já está usando o App Nativo (Capacitor)
  if (isMobileApp()) return null;
  if (dismissed) return null;

  if (variant === "card") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.75_0.12_75/0.3)] bg-gradient-to-br from-[oklch(0.22_0.07_260)] via-[oklch(0.18_0.05_260)] to-[oklch(0.14_0.04_260)] p-5 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[oklch(0.75_0.12_75/0.15)] blur-2xl pointer-events-none" />
        
        {showDismiss && (
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar aviso"
          >
            <X size={16} />
          </button>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          {/* QR Code Container */}
          <div className="hidden sm:flex flex-col items-center gap-1.5 p-2 bg-white rounded-xl shadow-md shrink-0 border border-amber-500/20">
            <img
              src={QR_CODE_URL}
              alt="QR Code Google Play Sanctificare"
              className="w-24 h-24 object-contain"
              loading="lazy"
            />
            <span className="text-[10px] font-bold text-neutral-800 tracking-tight flex items-center gap-1">
              <QrCode size={11} className="text-amber-600" /> Escaneie p/ Baixar
            </span>
          </div>

          {/* Texts & Button */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Smartphone size={13} />
              <span>Aplicativo Android Disponível</span>
            </div>

            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              Leve o Sanctificare no seu Celular
            </h3>

            <p className="text-xs text-[oklch(0.85_0.02_260)] font-serif leading-relaxed">
              Notificações diárias de oração, Terço guiado e conteúdos exclusivos direto na Google Play Store.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:scale-[1.02] transition-all group"
              >
                <Download size={15} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Baixar na Google Play</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs">
        <div className="flex items-center gap-2.5">
          <Smartphone size={16} className="text-amber-400 shrink-0" />
          <span>Baixe o app oficial do <strong>Sanctificare</strong> no seu celular Android.</span>
        </div>
        <a
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shrink-0"
        >
          <span>Google Play</span>
          <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  // Variant "section" (Padrão para Landing Page / Home)
  return (
    <section className="py-16 bg-gradient-to-b from-[oklch(0.18_0.05_260)] via-[oklch(0.15_0.04_265)] to-[oklch(0.12_0.04_260)] text-white relative overflow-hidden border-y border-[oklch(0.75_0.12_75/0.25)]">
      {/* Glow orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[oklch(0.75_0.12_75/0.1)] rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl border border-[oklch(0.75_0.12_75/0.3)] bg-[oklch(0.22_0.07_260/0.7)] backdrop-blur-md p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Esquerda: Informações & Recursos */}
            <div className="md:col-span-7 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Smartphone size={14} />
                <span>Aplicativo Oficial Android</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Disponível na <span className="text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">Google Play Store</span>
              </h2>

              <p className="font-serif text-base sm:text-lg text-[oklch(0.85_0.02_260)] leading-relaxed">
                Tenha uma experiência completa de oração na palma da sua mão. Baixe o aplicativo e fortaleça sua rotina espiritual onde quer que você esteja.
              </p>

              {/* Lista de Vantagens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Bell size={12} />
                  </div>
                  <span>Notificações diárias de oração</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Flame size={12} />
                  </div>
                  <span>Acompanhamento de constância</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Download size={12} />
                  </div>
                  <span>Atualizações automáticas OTA</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Smartphone size={12} />
                  </div>
                  <span>100% otimizado para Android</span>
                </div>
              </div>

              {/* Botão Oficial Google Play */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <a
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-gold hover:scale-[1.03] transition-all group"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.928 1.928 0 0 1-.61-1.378V3.192c0-.528.22-1.025.609-1.378zm11.6 11.6l2.368 2.368-12.28 7.087 9.912-9.455zm3.784-2.164l3.187 1.834c.784.452.784 1.186 0 1.638l-3.187 1.834-2.6-2.652 2.6-2.654zM5.298 1.1l12.28 7.087-2.368 2.368L5.298 1.1z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-90">DISPONÍVEL NO</div>
                    <div className="text-base font-extrabold tracking-wide">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Direita: QR Code para Desktop */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative p-4 bg-white rounded-2xl shadow-2xl border-2 border-amber-500/40 text-center space-y-2 group hover:scale-[1.02] transition-transform">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                  Escanear pelo Celular
                </div>
                
                <img
                  src={QR_CODE_URL}
                  alt="QR Code Sanctificare Google Play Store"
                  className="w-44 h-44 object-contain mx-auto pt-2"
                />

                <div className="text-[11px] font-semibold text-neutral-800 pt-1 flex items-center justify-center gap-1">
                  <QrCode size={13} className="text-amber-600" />
                  Aponte a câmera do celular
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
