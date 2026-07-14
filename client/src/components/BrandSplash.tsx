// Lista de versículos determinísticos diários
const verses = [
  { text: "Santificai-vos, porque amanhã o Senhor fará maravilhas no meio de vós.", ref: "Josué 3:5" },
  { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmo 23:1" },
  { text: "Buscai primeiro o Reino de Deus e a sua justiça, e tudo o mais vos será acrescentado.", ref: "Mateus 6:33" },
  { text: "O Senhor é minha luz e minha salvação, a quem temerei?", ref: "Salmo 27:1" },
  { text: "Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento.", ref: "Provérbios 3:5" },
  { text: "Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai senão por mim.", ref: "João 14:6" },
  { text: "Não andeis ansiosos por coisa alguma; antes em tudo apresentai as vossas petições a Deus.", ref: "Filipenses 4:6" },
  { text: "O amor é paciente, o amor é bondoso. Tudo desculpa, tudo crê, tudo espera, tudo suporta.", ref: "1 Coríntios 13:4,7" },
  { text: "A minha alma engrandece ao Senhor, e o meu espírito se alegra em Deus, meu Salvador.", ref: "Lucas 1:46-47" },
  { text: "Eis que estou convosco todos os dias, até o fim dos tempos.", ref: "Mateus 28:20" },
  { text: "Se Deus é por nós, quem será contra nós?", ref: "Romanos 8:31" },
  { text: "Criai em mim um coração puro, ó Deus, e renovai em meu peito um espírito firme.", ref: "Salmo 50:12" },
  { text: "Vinde a mim, todos vós que estais cansados e carregados de fardos, e eu vos darei descanso.", ref: "Mateus 11:28" },
  { text: "O verbo se fez carne e habitou entre nós.", ref: "João 1:14" }
];

export default function BrandSplash() {
  const getDailyVerse = () => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const day = Math.floor(diff / oneDay);
      const index = day % verses.length;
      return verses[index];
    } catch {
      return verses[0];
    }
  };

  const dailyVerse = getDailyVerse();

  return (
    <div className="fixed inset-0 bg-[#050B1E] flex flex-col items-center justify-between py-12 px-6 text-white z-[9999] overflow-hidden">
      {/* Background elegant pattern */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[oklch(0.75_0.12_75/0.03)] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[oklch(0.28_0.08_260/0.08)] rounded-full blur-[140px] pointer-events-none" />

      {/* Top Spacer */}
      <div className="w-12 h-12 mt-4" />

      {/* Center Logo & Name */}
      <div className="flex flex-col items-center gap-6 z-10 my-auto">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Animated pulsing golden ring */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping [animation-duration:3s]" />
          <div className="absolute -inset-2 rounded-full border border-amber-500/10 animate-pulse [animation-duration:2s]" />
          <img
            src="/assets/sanctificare-logo-v2.webp"
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
          "{dailyVerse.text}"
        </p>
        <span className="font-serif text-xs uppercase tracking-[0.2em] text-amber-400/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
          {dailyVerse.ref}
        </span>
      </div>
    </div>
  );
}
