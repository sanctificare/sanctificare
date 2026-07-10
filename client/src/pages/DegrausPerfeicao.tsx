import { BookMarked, BookOpen, Heart, Sparkles, ArrowRight, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Cross } from "@/components/CrossIcon";

type DegrauCard = {
  category: string;
  title: string;
  shortTitle: string;
  author: string;
  description: string;
  coverGradient: string;
  icon: any;
};

const DEGRAVS: DegrauCard[] = [
  {
    category: "Vida interior",
    title: "A Imitação de Cristo",
    shortTitle: "Imitação de Cristo",
    author: "Tomás de Kempis",
    description:
      "O livro mais lido da cristandade depois da Bíblia Sagrada. Um roteiro milenar de renúncia e intimidade com Jesus.",
    coverGradient: "bg-gradient-to-br from-[oklch(0.32_0.08_25)] via-[oklch(0.24_0.06_22)] to-[oklch(0.18_0.05_20)]",
    icon: Cross,
  },
  {
    category: "Virtudes",
    title: "Filoteia (Introdução à Vida Devota)",
    shortTitle: "Filoteia",
    author: "São Francisco de Sales",
    description:
      "O manual clássico escrito especificamente para leigos que vivem no mundo e desejam a santidade no cotidiano.",
    coverGradient: "bg-gradient-to-br from-[oklch(0.28_0.06_145)] via-[oklch(0.22_0.05_145)] to-[oklch(0.16_0.04_145)]",
    icon: Heart,
  },
  {
    category: "Vida de oração",
    title: "Caminho de Perfeição",
    shortTitle: "Caminho de Perfeição",
    author: "Santa Teresa de Ávila",
    description:
      "A Doutora da Igreja ensina as regras douradas da oração mental, contemplação e as virtudes que sustentam a vida interior.",
    coverGradient: "bg-gradient-to-br from-[oklch(0.25_0.07_250)] via-[oklch(0.20_0.06_250)] to-[oklch(0.14_0.04_250)]",
    icon: Sparkles,
  },
];

function BookCover({ title, author, gradient, Icon }: { title: string; author: string; gradient: string; Icon: any }) {
  return (
    <div className={`relative w-36 h-52 rounded-r-md shadow-lg shadow-black/25 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl ${gradient} flex flex-col justify-between p-4 border-y border-r border-[oklch(0.75_0.12_75/0.25)]`}>
      {/* Spine highlight (3D effect) */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/15 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)] rounded-l-sm" />
      <div className="absolute left-2.5 top-0 bottom-0 w-[1px] bg-white/10" />

      {/* Gold inner frame */}
      <div className="absolute inset-2 border border-[oklch(0.75_0.12_75/0.25)] pointer-events-none rounded-sm" />

      {/* Book details on cover */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-center text-white px-1">
        <Icon className="w-8 h-8 text-[oklch(0.75_0.12_75)] mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        <h3 className="font-display text-[11px] leading-tight font-bold tracking-wider uppercase text-[oklch(0.97_0.01_85)] max-h-24 overflow-hidden drop-shadow-md">
          {title}
        </h3>
      </div>

      <div className="relative z-10 text-center">
        <div className="w-8 h-[1px] bg-[oklch(0.75_0.12_75/0.5)] mx-auto mb-2" />
        <p className="font-sans text-[8px] tracking-widest uppercase text-[oklch(0.85_0.03_85)] font-semibold truncate drop-shadow-sm">
          {author}
        </p>
      </div>
    </div>
  );
}

export default function DegrausPerfeicao() {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] pb-12 relative overflow-hidden">
      {/* Pattern background */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.015] pointer-events-none" />

      <main className="container py-8 relative z-10">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-[oklch(0.75_0.12_75)]">
            <BookMarked size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Biblioteca espiritual</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] sm:text-4xl">
            Degraus de Perfeição
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Acompanhe os maiores clássicos da espiritualidade católica estruturados para a sua santidade no cotidiano.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Obras espirituais">
          {DEGRAVS.map((item) => {
            const isImitacao = item.title === "A Imitação de Cristo";
            const card = (
              <article
                key={item.title}
                className="group flex flex-col h-full rounded-2xl border border-[oklch(0.22_0.07_260/0.08)] bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Book Cover Container */}
                <div className="flex items-center justify-center p-6 bg-[oklch(0.98_0.02_85)] border-b border-[oklch(0.22_0.07_260/0.04)] relative">
                  <div className="absolute inset-0 bg-radial-gradient from-white/60 to-transparent pointer-events-none" />
                  <BookCover
                    title={item.shortTitle}
                    author={item.author}
                    gradient={item.coverGradient}
                    Icon={item.icon}
                  />
                </div>

                {/* Details Content */}
                <div className="flex flex-col flex-grow p-5 justify-between">
                  <div>
                    <span className="inline-flex rounded-md border border-[oklch(0.75_0.12_75/0.3)] bg-[oklch(0.98_0.03_85)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)]">
                      {item.category}
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-[oklch(0.22_0.07_260)] group-hover:text-[oklch(0.65_0.12_70)] transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-[oklch(0.50_0.05_260)]">Por {item.author}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[oklch(0.22_0.07_260/0.05)]">
                    {isImitacao ? (
                      <Button className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-white font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 group/btn">
                        <BookOpen size={16} />
                        Começar Leitura
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-muted/50 text-muted-foreground border border-border flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock size={14} />
                        Em Breve
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );

            if (!isImitacao) return card;

            return (
              <Link key={item.title} href="/degraus-de-perfeicao/imitacao-de-cristo" className="h-full">
                <div role="link" tabIndex={0} className="cursor-pointer h-full">
                  {card}
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}