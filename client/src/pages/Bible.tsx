import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppNav from "@/components/AppNav";
import { useLocation } from "wouter";
import { BIBLE_BOOKS, FAMOUS_VERSES, BibleBook } from "@/data/bible";
import { BookOpen, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

export default function Bible() {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [testament, setTestament] = useState<"old" | "new">("new");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: chapterVerses, isLoading: isVersesLoading } = trpc.bible.getChapter.useQuery(
    { bookId: selectedBook?.id || "", chapter: selectedChapter || 1 },
    { enabled: !!selectedBook && !!selectedChapter }
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("book");
    const chapterStr = params.get("chapter");
    if (bookId) {
      const book = BIBLE_BOOKS.find((b) => b.id === bookId);
      if (book) {
        setSelectedBook(book);
        setTestament(book.testament);
        if (chapterStr) {
          const ch = parseInt(chapterStr);
          if (!isNaN(ch) && ch >= 1 && ch <= book.chapters) {
            setSelectedChapter(ch);
          } else {
            setSelectedChapter(null);
          }
        } else {
          setSelectedChapter(null);
        }
      }
    } else {
      setSelectedBook(null);
      setSelectedChapter(null);
    }
  }, [location]);

  const filteredBooks = BIBLE_BOOKS.filter(
    (b) => b.testament === testament && b.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para percorrer a Sagrada Escritura no app.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-[oklch(0.40_0.10_260)]" />
            <span className="text-sm text-muted-foreground font-medium">Bíblia Sagrada</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-1">
            Sagrada Escritura
          </h1>
          <p className="font-serif text-muted-foreground">73 livros para leitura, oração e meditação da Palavra</p>
        </div>

        {/* Leitura de capítulo */}
        {selectedBook && selectedChapter ? (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedChapter(null)} className="gap-2">
                <ChevronLeft size={14} /> {selectedBook.name}
              </Button>
              <span className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)]">
                Capítulo {selectedChapter}
              </span>
            </div>

            <div className="prayer-card p-8">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)]">
                  {selectedBook.name}
                </h2>
                <p className="text-[oklch(0.65_0.12_70)] font-semibold">Capítulo {selectedChapter}</p>
              </div>
              <div className="divider-gold mb-6" />
              <div className="space-y-4">
                {isVersesLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-4 w-6 bg-[oklch(0.90_0.02_75)] rounded mt-1" />
                        <div className="h-4 bg-[oklch(0.90_0.02_75)] rounded flex-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  chapterVerses?.map((verse, i) => (
                    <div key={i} className="flex gap-4 animate-fade-in">
                      <span className="text-xs font-bold text-[oklch(0.65_0.12_70)] mt-1 w-6 flex-shrink-0 font-display">
                        {i + 1}
                      </span>
                      <p className="prose-prayer flex-1">{verse}</p>
                    </div>
                  )) || (
                    <p className="text-muted-foreground italic text-center">Nenhum versículo encontrado.</p>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                disabled={selectedChapter <= 1}
                onClick={() => setSelectedChapter(selectedChapter - 1)}
                className="gap-2"
              >
                <ChevronLeft size={14} /> Anterior
              </Button>
              <Button
                variant="outline"
                disabled={selectedChapter >= selectedBook.chapters}
                onClick={() => setSelectedChapter(selectedChapter + 1)}
                className="gap-2 ml-auto"
              >
                Próximo <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        ) : selectedBook ? (
          /* Seleção de capítulo */
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedBook(null)} className="gap-2">
                <ChevronLeft size={14} /> Livros
              </Button>
              <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)]">
                {selectedBook.name}
              </h2>
            </div>

            {/* Versículos famosos */}
            {FAMOUS_VERSES[selectedBook.id] && (
              <div className="prayer-card p-5 mb-6">
                <p className="text-xs font-display font-semibold text-[oklch(0.65_0.12_70)] uppercase tracking-widest mb-3">
                  Versículos para meditação
                </p>
                <div className="space-y-3">
                  {FAMOUS_VERSES[selectedBook.id].map((v, i) => (
                    <p key={i} className="font-serif text-sm italic text-foreground border-l-2 border-[oklch(0.75_0.12_75/0.4)] pl-3">
                      {v}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <p className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] mb-3 uppercase tracking-wide">
              Capítulos ({selectedBook.chapters})
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChapter(ch)}
                  className="h-10 w-full rounded-lg bg-white border border-border hover:border-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.75_0.12_75/0.08)] text-sm font-medium text-[oklch(0.22_0.07_260)] transition-all"
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Lista de livros */
          <div className="animate-fade-in">
            {/* Busca */}
            <div className="relative mb-6 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar livro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Tabs Testamento */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTestament("old")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  testament === "old"
                    ? "bg-[oklch(0.22_0.07_260)] text-white"
                    : "bg-white border border-border text-foreground hover:border-[oklch(0.22_0.07_260/0.3)]"
                }`}
              >
                Antigo Testamento ({BIBLE_BOOKS.filter(b => b.testament === "old").length})
              </button>
              <button
                onClick={() => setTestament("new")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  testament === "new"
                    ? "bg-[oklch(0.22_0.07_260)] text-white"
                    : "bg-white border border-border text-foreground hover:border-[oklch(0.22_0.07_260/0.3)]"
                }`}
              >
                Novo Testamento ({BIBLE_BOOKS.filter(b => b.testament === "new").length})
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="prayer-card p-4 text-left group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-xs font-bold text-[oklch(0.65_0.12_70)] uppercase tracking-wide">
                      {book.abbrev}
                    </span>
                    <ChevronRight size={13} className="text-muted-foreground group-hover:text-[oklch(0.65_0.14_70)] transition-colors" />
                  </div>
                  <p className="font-semibold text-sm text-[oklch(0.22_0.07_260)] leading-tight">{book.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{book.chapters} capítulos</p>
                </button>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">Nenhum livro encontrado para "{search}"</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
