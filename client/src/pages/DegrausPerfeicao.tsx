import { BookMarked, BookOpen, Heart, Sparkles, ArrowRight, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type DegrauCard = {
  category: string;
  title: string;
  author: string;
  description: string;
  image: string;
  route?: string;
};

const DEGRAVS: DegrauCard[] = [
  {
    category: "Vida interior",
    title: "A Imitação de Cristo",
    author: "Tomás de Kempis",
    description:
      "O livro mais lido da cristandade depois da Bíblia Sagrada. Um roteiro milenar de renúncia e intimidade com Jesus.",
    image: "/assets/degraus/imitacao_cristo_essence.jpg",
    route: "/degraus-de-perfeicao/imitacao-de-cristo",
  },
  {
    category: "Virtudes",
    title: "Filoteia (Introdução à Vida Devota)",
    author: "São Francisco de Sales",
    description:
      "O manual clássico escrito especificamente para leigos que vivem no mundo e desejam a santidade no cotidiano.",
    image: "/assets/degraus/filoteia_essence.jpg",
    route: "/degraus-de-perfeicao/filoteia",
  },
  {
    category: "Vida de oração",
    title: "Caminho de Perfeição",
    author: "Santa Teresa de Ávila",
    description:
      "A Doutora da Igreja ensina as regras douradas da oração mental, contemplação e as virtudes que sustentam a vida interior.",
    image: "/assets/degraus/caminho_perfeicao_essence.jpg",
  },
  {
    category: "Devoção Mariana",
    title: "Tratado da Verdadeira Devoção",
    author: "São Luís Maria Grignion de Montfort",
    description:
      "O caminho perfeito de consagração total a Jesus Cristo pelas mãos da Santíssima Virgem Maria.",
    image: "/assets/degraus/imitacao_cristo_essence.jpg",
  },
  {
    category: "Mística & Contemplação",
    title: "O Castelo Interior (As Moradas)",
    author: "Santa Teresa de Ávila",
    description:
      "A jornada da alma através de sete moradas interiores em direção à união mística com Deus.",
    image: "/assets/degraus/caminho_perfeicao_essence.jpg",
  },
  {
    category: "Purificação da Alma",
    title: "Subida do Monte Carmelo",
    author: "São João da Cruz",
    description:
      "O guia místico de purificação dos sentidos e do espírito para alcançar o topo da união divina.",
    image: "/assets/degraus/filoteia_essence.jpg",
  },
];

export default function DegrausPerfeicao() {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] pb-12 relative overflow-hidden">
      {/* Pattern background */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.015] pointer-events-none" />

      <main className="container py-8 relative z-10">
        <header className="mb-8 max-w-3xl mx-auto text-center md:text-left">
          <div className="mb-2 flex items-center justify-center md:justify-start gap-2 text-[oklch(0.75_0.12_75)]">
            <BookMarked size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Biblioteca espiritual</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] sm:text-4xl">
            Degraus de Perfeição
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto md:mx-0">
            Acompanhe os maiores clássicos da espiritualidade católica estruturados para a sua santidade no cotidiano.
          </p>
        </header>

        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto" aria-label="Obras espirituais">
          {DEGRAVS.map((item) => {
            const hasRoute = !!item.route;
            const card = (
              <article
                key={item.title}
                className="group flex flex-col h-full rounded-xl border border-[oklch(0.22_0.07_260/0.06)] bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Book Essence Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted border-b border-[oklch(0.22_0.07_260/0.04)]">
                  <img
                    src={item.image}
                    alt={`Essência de ${item.title}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* Details Content */}
                <div className="flex flex-col flex-grow p-4 justify-between">
                  <div>
                    <span className="inline-flex rounded-md border border-[oklch(0.75_0.12_75/0.25)] bg-[oklch(0.98_0.03_85)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)]">
                      {item.category}
                    </span>
                    <h2 className="mt-2 font-display text-base font-bold leading-snug text-[oklch(0.22_0.07_260)] group-hover:text-[oklch(0.65_0.12_70)] transition-colors line-clamp-1">
                      {item.title}
                    </h2>
                    <p className="mt-0.5 text-[10px] font-semibold text-[oklch(0.50_0.05_260)]">Por {item.author}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[oklch(0.22_0.07_260/0.05)]">
                    {hasRoute ? (
                      <Button size="sm" className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-white font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 group/btn h-8 text-xs">
                        <BookOpen size={14} />
                        Iniciar Caminhada
                        <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Button>
                    ) : (
                      <Button disabled size="sm" className="w-full bg-muted/50 text-muted-foreground border border-border flex items-center justify-center gap-1.5 cursor-not-allowed h-8 text-xs">
                        <Lock size={12} />
                        Em Breve
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );

            if (!hasRoute) return card;

            return (
              <Link key={item.title} href={item.route!} className="h-full">
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