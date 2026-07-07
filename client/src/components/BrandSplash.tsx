// Tela de carregamento/splash unificada da marca.
// Fundo escuro (#050B1E) idêntico ao splash nativo do Android e à tela de Login,
// garantindo continuidade visual (sem flashes) durante todo o fluxo de abertura.
export default function BrandSplash() {
  return (
    <div className="fixed inset-0 bg-[#050B1E] flex flex-col items-center justify-between py-12 px-6 text-white z-[9999] overflow-hidden">
      {/* Background elegant pattern */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[oklch(0.75_0.12_75/0.03)] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[oklch(0.28_0.08_260/0.08)] rounded-full blur-[140px] pointer-events-none" />

      {/* Top Spacer / Decorative cross element */}
      <div className="w-12 h-12 flex items-center justify-center opacity-30 mt-4">
        <div className="w-[2px] h-8 bg-amber-400 absolute" />
        <div className="w-8 h-[2px] bg-amber-400 absolute" />
      </div>

      {/* Center Logo & Name */}
      <div className="flex flex-col items-center gap-6 z-10 my-auto">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Animated pulsing golden ring */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping [animation-duration:3s]" />
          <div className="absolute -inset-2 rounded-full border border-amber-500/10 animate-pulse [animation-duration:2s]" />
          <img
            src="/assets/logo-sanctificare.webp"
            alt="Sanctificare Logo"
            className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"
          />
        </div>

        <h1 className="font-serif text-3xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 font-bold uppercase select-none mt-2 drop-shadow-md" style={{ fontFamily: "'Cinzel', serif" }}>
          Sanctificare
        </h1>

        <div className="flex items-center gap-2 text-amber-200/60 font-serif text-sm tracking-[0.15em] select-none mt-1 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
          <span>Carregando</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-ping" />
        </div>
      </div>

      {/* Bottom Verse */}
      <div className="w-full max-w-sm flex flex-col items-center gap-3 z-10 mb-6 bg-gradient-to-b from-[#0d162d]/80 to-[#080f21]/80 border border-amber-500/15 rounded-xl p-5 text-center shadow-lg backdrop-blur-sm">
        <p className="font-serif italic text-amber-100/80 text-base leading-relaxed tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          "Santificai-vos, porque amanhã o Senhor fará maravilhas no meio de vós."
        </p>
        <span className="font-serif text-xs uppercase tracking-[0.2em] text-amber-400/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
          Josué 3:5
        </span>
      </div>
    </div>
  );
}
