import { BookMarked } from "lucide-react";
import { Link } from "wouter";

type DegrauCard = {
  category: string;
  title: string;
  author: string;
  description: string;
};

const DEGRAVS: DegrauCard[] = [
  {
    category: "Vida interior",
    title: "A Imitação de Cristo",
    author: "Tomás de Kempis",
    description:
      "O livro mais lido da cristandade depois da Bíblia Sagrada. Um roteiro milenar de renúncia e intimidade com Jesus.",
  },
  {
    category: "Virtudes",
    title: "Filoteia (Introdução à Vida Devota)",
    author: "São Francisco de Sales",
    description:
      "O manual clássico escrito especificamente para leigos que vivem no mundo e desejam a santidade no cotidiano.",
  },
  {
    category: "Vida de oração",
    title: "Caminho de Perfeição",
    author: "Santa Teresa de Ávila",
    description:
      "A Doutora da Igreja ensina as regras douradas da oração mental, contemplação e as virtudes que sustentam a vida interior.",
  },
];

export default function DegrausPerfeicao() {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] pb-12">
      <main className="container py-8">
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-[oklch(0.65_0.12_70)]">
            <BookMarked size={18} />
            <span className="text-sm font-semibold">Biblioteca espiritual</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] sm:text-4xl">
            Degraus de Perfeição
          </h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Obras espirituais">
          {DEGRAVS.map((item) => {
            const isImitacao = item.title === "A Imitação de Cristo";
            const card = (
              <article
                key={item.title}
                className={
                  "rounded-2xl border border-[oklch(0.22_0.07_260/0.12)] bg-white p-5 " +
                  (isImitacao ? "transition-all hover:border-[oklch(0.65_0.12_70/0.5)] hover:shadow-sm" : "")
                }
              >
              <span className="inline-flex rounded-md border border-[oklch(0.65_0.12_70/0.35)] bg-[oklch(0.98_0.03_85)] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">
                {item.category}
              </span>
              <h2 className="mt-4 font-display text-4xl leading-tight text-[oklch(0.22_0.07_260)]">
                {item.title}
              </h2>
              <p className="mt-1 text-2xl font-semibold text-[oklch(0.30_0.06_260)]">Por {item.author}</p>
              <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{item.description}</p>
              <div className="mt-6 border-t border-[oklch(0.22_0.07_260/0.1)]" />
            </article>
            );

            if (!isImitacao) return card;

            return (
              <Link key={item.title} href="/degraus-de-perfeicao/imitacao-de-cristo">
                <div role="link" tabIndex={0} className="cursor-pointer">
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