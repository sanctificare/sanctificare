import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppNav from "@/components/AppNav";
import { useLocation } from "wouter";
import { BIBLE_BOOKS, FAMOUS_VERSES, BibleBook } from "@/data/bible";
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Settings,
  Copy,
  Share2,
  Sparkles,
  Bookmark,
  Check
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

export default function Bible() {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  // Navigation states
  const [activeTab, setActiveTab] = useState<"books" | "favorites" | "search">("books");
  const [testament, setTestament] = useState<"old" | "new">("new");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchBookQuery, setSearchBookQuery] = useState("");

  // Search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [triggerSearch, setTriggerSearch] = useState("");

  // Accessibility / Reading options
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl" | "2xl">(
    (localStorage.getItem("sanctificare_bible_font_size") as any) || "base"
  );
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">(
    (localStorage.getItem("sanctificare_bible_font_family") as any) || "serif"
  );
  const [readingTheme, setReadingTheme] = useState<"light" | "sepia" | "dark">(
    (localStorage.getItem("sanctificare_bible_theme") as any) || "sepia"
  );

  // Bookmark (last read) & Favorites
  const [bookmark, setBookmark] = useState<{ bookId: string; bookName: string; chapter: number } | null>(null);
  const [favorites, setFavorites] = useState<{ bookId: string; bookName: string; chapter: number; verse: number; text: string }[]>(
    JSON.parse(localStorage.getItem("sanctificare_bible_favorites") || "[]")
  );

  // Selected verses for copying/sharing/favoriting
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  // tRPC Queries
  const { data: chapterVerses, isLoading: isVersesLoading } = trpc.bible.getChapter.useQuery(
    { bookId: selectedBook?.id || "", chapter: selectedChapter || 1 },
    { enabled: !!selectedBook && !!selectedChapter }
  );

  const { data: searchResults, isLoading: isSearching } = trpc.bible.search.useQuery(
    { query: triggerSearch },
    { enabled: triggerSearch.length >= 3 }
  );

  const { data: liturgy } = trpc.liturgy.getByDate.useQuery(undefined, { enabled: isAuthenticated });

  // Load bookmark on startup or return to books view
  useEffect(() => {
    const saved = localStorage.getItem("sanctificare_bible_bookmark");
    if (saved) {
      try {
        setBookmark(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedBook]);

  // Save bookmark when selecting a chapter
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      const activeBookmark = {
        bookId: selectedBook.id,
        bookName: selectedBook.name,
        chapter: selectedChapter
      };
      localStorage.setItem("sanctificare_bible_bookmark", JSON.stringify(activeBookmark));
      setSelectedVerses([]); // reset selection
    }
  }, [selectedBook, selectedChapter]);

  // URL sync handler
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

  // Liturgy highlighting logic
  const getLiturgyVerseRange = (ref: string): { start: number; end: number } | null => {
    const parts = ref.split(":");
    if (parts.length < 2) return null;
    const versePart = parts[1].trim();
    const range = versePart.split("-");
    const start = parseInt(range[0]);
    const end = range.length > 1 ? parseInt(range[1]) : start;
    if (isNaN(start)) return null;
    return { start, end: isNaN(end) ? start : end };
  };

  let liturgyInfo: { label: string; start?: number; end?: number } | null = null;
  if (liturgy && selectedBook && selectedChapter) {
    const bookName = selectedBook.name.toLowerCase();
    const matchName = bookName === "salmos" ? "salmo" : bookName;

    const findLiturgy = () => {
      const readings = [
        { data: liturgy.firstReading, label: "Primeira Leitura" },
        { data: liturgy.psalm, label: "Salmo Responsorial" },
        { data: liturgy.secondReading, label: "Segunda Leitura" },
        { data: liturgy.gospel, label: "Evangelho" }
      ];

      for (const reading of readings) {
        if (!reading.data?.referencia) continue;
        const ref = reading.data.referencia.toLowerCase();
        if (ref.includes(matchName)) {
          const afterBook = ref.replace(matchName, "").trim();
          const words = afterBook.split(/[\s:;]+/);
          const chapter = parseInt(words[0]);
          if (chapter === selectedChapter) {
            const range = getLiturgyVerseRange(reading.data.referencia);
            return {
              label: reading.label,
              start: range?.start,
              end: range?.end
            };
          }
        }
      }
      return null;
    };

    liturgyInfo = findLiturgy();
  }

  // Filter books in the list tab
  const filteredBooks = BIBLE_BOOKS.filter(
    (b) => b.testament === testament && b.name.toLowerCase().includes(searchBookQuery.toLowerCase())
  );

  // Verse action handlers
  const handleVerseClick = (index: number) => {
    setSelectedVerses(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleCopySelected = () => {
    if (!selectedBook || !selectedChapter || !chapterVerses) return;
    const sortedIndices = [...selectedVerses].sort((a, b) => a - b);
    const textToCopy = sortedIndices.map(idx => `[${idx + 1}] ${chapterVerses[idx]}`).join("\n");
    const ref = `(${selectedBook.name} ${selectedChapter}:${sortedIndices.map(idx => idx + 1).join(", ")})`;
    const fullText = `"${textToCopy}"\n\n${ref}\nCompartilhado via Sanctificare`;

    navigator.clipboard.writeText(fullText);
    toast.success("Versículos copiados!");
    setSelectedVerses([]);
  };

  const handleShareSelected = async () => {
    if (!selectedBook || !selectedChapter || !chapterVerses) return;
    const sortedIndices = [...selectedVerses].sort((a, b) => a - b);
    const textToCopy = sortedIndices.map(idx => `[${idx + 1}] ${chapterVerses[idx]}`).join("\n");
    const ref = `(${selectedBook.name} ${selectedChapter}:${sortedIndices.map(idx => idx + 1).join(", ")})`;
    const fullText = `"${textToCopy}"\n\n${ref}\nCompartilhado via Sanctificare`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sanctificare - ${selectedBook.name} ${selectedChapter}`,
          text: fullText,
        });
        toast.success("Compartilhado!");
      } catch (err) {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(fullText);
      toast.success("Copiado! (Compartilhamento não suportado)");
    }
    setSelectedVerses([]);
  };

  const handleFavoriteSelected = () => {
    if (!selectedBook || !selectedChapter || !chapterVerses) return;
    let newFavs = [...favorites];
    let added = 0;
    let removed = 0;

    selectedVerses.forEach(idx => {
      const verseNum = idx + 1;
      const text = chapterVerses[idx];
      const existIdx = newFavs.findIndex(
        f => f.bookId === selectedBook.id && f.chapter === selectedChapter && f.verse === verseNum
      );

      if (existIdx !== -1) {
        newFavs.splice(existIdx, 1);
        removed++;
      } else {
        newFavs.push({
          bookId: selectedBook.id,
          bookName: selectedBook.name,
          chapter: selectedChapter,
          verse: verseNum,
          text
        });
        added++;
      }
    });

    setFavorites(newFavs);
    localStorage.setItem("sanctificare_bible_favorites", JSON.stringify(newFavs));

    if (added > 0 && removed === 0) {
      toast.success(`${added} versículo(s) favoritado(s)!`);
    } else if (removed > 0 && added === 0) {
      toast.success(`${removed} versículo(s) removido(s)!`);
    } else {
      toast.success("Favoritos atualizados!");
    }
    setSelectedVerses([]);
  };

  const areAllSelectedFavorited = () => {
    if (!selectedBook || !selectedChapter) return false;
    return selectedVerses.every(idx => {
      const verseNum = idx + 1;
      return favorites.some(
        f => f.bookId === selectedBook.id && f.chapter === selectedChapter && f.verse === verseNum
      );
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim().length < 3) {
      toast.error("Busca precisa de no mínimo 3 letras.");
      return;
    }
    setTriggerSearch(globalSearchQuery.trim());
  };

  // Styling maps
  const themeClasses = {
    light: "!bg-white text-slate-900 border-slate-100 shadow-sm",
    sepia: "!bg-[#fcf8ed] text-[#4a3525] border-[#ebdcb9] shadow-sm",
    dark: "!bg-slate-950 text-slate-100 border-slate-900 shadow-none",
  };

  const pageBgClasses = {
    light: "bg-[oklch(0.97_0.01_85)]",
    sepia: "bg-[#f4ecd8]",
    dark: "bg-slate-900",
  };

  const headerTextClasses = {
    light: "text-[oklch(0.22_0.07_260)]",
    sepia: "text-[#362214]",
    dark: "text-slate-100",
  };

  const descTextClasses = {
    light: "text-muted-foreground",
    sepia: "text-[#695444]",
    dark: "text-slate-400",
  };

  const fontSizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const fontFamilyClasses = {
    serif: "font-serif leading-relaxed",
    sans: "font-sans leading-normal",
  };

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
    <div className={`min-h-screen transition-colors duration-300 ${pageBgClasses[readingTheme]}`}>
      <AppNav />

      <main className="container py-8 relative">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className={readingTheme === "dark" ? "text-slate-400" : "text-[oklch(0.40_0.10_260)]"} />
            <span className={`text-sm font-medium ${descTextClasses[readingTheme]}`}>Bíblia Sagrada</span>
          </div>
          <h1 className={`font-display text-3xl font-bold mb-1 ${headerTextClasses[readingTheme]}`}>
            Sagrada Escritura
          </h1>
          <p className={`font-serif ${descTextClasses[readingTheme]}`}>73 livros para leitura, oração e meditação da Palavra</p>
        </div>

        {/* Leitura de capítulo */}
        {selectedBook && selectedChapter ? (
          <div className="max-w-3xl mx-auto animate-fade-in pb-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedChapter(null)} className="gap-2 bg-white">
                  <ChevronLeft size={14} /> {selectedBook.name}
                </Button>
                <span className={`font-display text-sm font-semibold ${headerTextClasses[readingTheme]}`}>
                  Capítulo {selectedChapter}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={`gap-1.5 bg-white ${showSettings ? "border-[oklch(0.75_0.12_75)]" : ""}`}
              >
                <Settings size={14} /> Opções
              </Button>
            </div>

            {/* Accessibility Settings Panel */}
            {showSettings && (
              <div className={`border rounded-xl p-4 mb-6 shadow-md flex flex-wrap gap-4 items-center justify-between transition-colors duration-300 animate-fade-in text-sm ${
                readingTheme === "dark"
                  ? "bg-slate-950 text-slate-200 border-slate-800"
                  : readingTheme === "sepia"
                  ? "bg-[#fcf8ed] text-[#4a3525] border-[#ebdcb9]"
                  : "bg-white text-[oklch(0.22_0.07_260)] border-border"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Fonte:</span>
                  <Button
                    variant={fontFamily === "serif" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${readingTheme === "dark" && fontFamily !== "serif" ? "text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white" : ""}`}
                    onClick={() => {
                      setFontFamily("serif");
                      localStorage.setItem("sanctificare_bible_font_family", "serif");
                    }}
                  >
                    Serifada
                  </Button>
                  <Button
                    variant={fontFamily === "sans" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${readingTheme === "dark" && fontFamily !== "sans" ? "text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white" : ""}`}
                    onClick={() => {
                      setFontFamily("sans");
                      localStorage.setItem("sanctificare_bible_font_family", "sans");
                    }}
                  >
                    Sans-Serif
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tamanho:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 ${readingTheme === "dark" ? "text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white" : ""}`}
                    disabled={fontSize === "sm"}
                    onClick={() => {
                      const sizes: ("sm" | "base" | "lg" | "xl" | "2xl")[] = ["sm", "base", "lg", "xl", "2xl"];
                      const idx = sizes.indexOf(fontSize);
                      if (idx > 0) {
                        setFontSize(sizes[idx - 1]);
                        localStorage.setItem("sanctificare_bible_font_size", sizes[idx - 1]);
                      }
                    }}
                  >
                    A-
                  </Button>
                  <span className="text-xs uppercase font-bold px-1">{fontSize}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 ${readingTheme === "dark" ? "text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white" : ""}`}
                    disabled={fontSize === "2xl"}
                    onClick={() => {
                      const sizes: ("sm" | "base" | "lg" | "xl" | "2xl")[] = ["sm", "base", "lg", "xl", "2xl"];
                      const idx = sizes.indexOf(fontSize);
                      if (idx < sizes.length - 1) {
                        setFontSize(sizes[idx + 1]);
                        localStorage.setItem("sanctificare_bible_font_size", sizes[idx + 1]);
                      }
                    }}
                  >
                    A+
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tema:</span>
                  <Button
                    variant={readingTheme === "light" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${readingTheme === "dark" ? "text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white" : ""}`}
                    onClick={() => {
                      setReadingTheme("light");
                      localStorage.setItem("sanctificare_bible_theme", "light");
                    }}
                  >
                    Claro
                  </Button>
                  <Button
                    variant={readingTheme === "sepia" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${readingTheme === "dark" ? "text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white" : ""}`}
                    onClick={() => {
                      setReadingTheme("sepia");
                      localStorage.setItem("sanctificare_bible_theme", "sepia");
                    }}
                  >
                    Sépia
                  </Button>
                  <Button
                    variant={readingTheme === "dark" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${readingTheme === "dark" ? "bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-slate-950 font-semibold" : ""}`}
                    onClick={() => {
                      setReadingTheme("dark");
                      localStorage.setItem("sanctificare_bible_theme", "dark");
                    }}
                  >
                    Escuro
                  </Button>
                </div>
              </div>
            )}

            {/* Liturgy Banner */}
            {liturgyInfo && (
              <div className="bg-[oklch(0.75_0.12_75/0.12)] border border-[oklch(0.75_0.12_75/0.3)] text-[oklch(0.65_0.12_70)] rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                <Sparkles size={20} className="mt-0.5 text-[oklch(0.75_0.12_75)] flex-shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-display font-bold text-sm">Liturgia Diária de Hoje</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Este capítulo faz parte do <strong>{liturgyInfo.label}</strong> de hoje ({selectedBook.name} {selectedChapter}
                    {liturgyInfo.start ? `:${liturgyInfo.start}-${liturgyInfo.end}` : ""}).
                  </p>
                </div>
              </div>
            )}

            {/* Reading Card */}
            <div className={`prayer-card p-8 border rounded-2xl transition-all duration-300 ${themeClasses[readingTheme]}`}>
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold">
                  {selectedBook.name}
                </h2>
                <p className="text-[oklch(0.65_0.12_70)] font-semibold mt-1">Capítulo {selectedChapter}</p>
              </div>
              <div className="divider-gold mb-6" />

              <div className="space-y-5">
                {isVersesLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded mt-1" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  chapterVerses?.map((verse, i) => {
                    const verseNum = i + 1;
                    const isSelected = selectedVerses.includes(i);
                    const isFavorited = favorites.some(
                      f => f.bookId === selectedBook.id && f.chapter === selectedChapter && f.verse === verseNum
                    );

                    // Check if this verse is in today's liturgy readings range
                    const isLiturgyHighlighted = liturgyInfo && liturgyInfo.start && liturgyInfo.end
                      ? verseNum >= liturgyInfo.start && verseNum <= liturgyInfo.end
                      : !!liturgyInfo; // if no specific verse range, highlight entire chapter

                    const highlightClass = isSelected
                      ? "bg-[oklch(0.75_0.12_75/0.25)] ring-2 ring-[oklch(0.75_0.12_75/0.4)] rounded px-1 -mx-1"
                      : isLiturgyHighlighted
                      ? "bg-[oklch(0.75_0.12_75/0.08)] border-l-2 border-[oklch(0.75_0.12_75/0.5)] pl-2"
                      : "";

                    return (
                      <div
                        key={i}
                        onClick={() => handleVerseClick(i)}
                        className={`flex gap-4 cursor-pointer hover:bg-slate-100/10 dark:hover:bg-slate-800/10 p-1.5 transition-all rounded select-none ${highlightClass}`}
                      >
                        <span className="text-xs font-bold text-[oklch(0.65_0.12_70)] mt-1.5 w-6 flex-shrink-0 font-display flex items-center gap-1">
                          {isFavorited && <Star size={8} fill="currentColor" className="text-[oklch(0.75_0.12_75)]" />}
                          {verseNum}
                        </span>
                        <p className={`flex-1 ${fontSizeClasses[fontSize]} ${fontFamilyClasses[fontFamily]}`}>
                          {verse}
                        </p>
                      </div>
                    );
                  }) || (
                    <p className="text-muted-foreground italic text-center">Nenhum versículo encontrado.</p>
                  )
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                disabled={selectedChapter <= 1}
                onClick={() => setSelectedChapter(selectedChapter - 1)}
                className="gap-2 bg-white"
              >
                <ChevronLeft size={14} /> Anterior
              </Button>
              <Button
                variant="outline"
                disabled={selectedChapter >= selectedBook.chapters}
                onClick={() => setSelectedChapter(selectedChapter + 1)}
                className="gap-2 ml-auto bg-white"
              >
                Próximo <ChevronRight size={14} />
              </Button>
            </div>

            {/* Selection floating toolbar */}
            {selectedVerses.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-full px-5 py-3 flex items-center gap-3 z-50 animate-fade-in text-xs sm:text-sm text-[oklch(0.22_0.07_260)] dark:text-slate-100 max-w-[95%] w-max">
                <span className="font-semibold whitespace-nowrap">
                  {selectedVerses.length} {selectedVerses.length === 1 ? "selecionado" : "selecionados"}
                </span>

                <div className="h-4 w-px bg-border" />

                <button
                  onClick={handleCopySelected}
                  className="flex items-center gap-1 font-medium hover:text-[oklch(0.75_0.12_75)] transition-colors p-1"
                  title="Copiar"
                >
                  <Copy size={15} />
                  <span className="hidden sm:inline">Copiar</span>
                </button>

                <button
                  onClick={handleShareSelected}
                  className="flex items-center gap-1 font-medium hover:text-[oklch(0.75_0.12_75)] transition-colors p-1"
                  title="Compartilhar"
                >
                  <Share2 size={15} />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>

                <button
                  onClick={handleFavoriteSelected}
                  className="flex items-center gap-1 font-medium hover:text-[oklch(0.75_0.12_75)] transition-colors p-1"
                  title={areAllSelectedFavorited() ? "Desfavoritar" : "Favoritar"}
                >
                  <Star size={15} fill={areAllSelectedFavorited() ? "currentColor" : "none"} className={areAllSelectedFavorited() ? "text-[oklch(0.75_0.12_75)]" : ""} />
                  <span className="hidden sm:inline">{areAllSelectedFavorited() ? "Favoritado" : "Favoritar"}</span>
                </button>

                <div className="h-4 w-px bg-border" />

                <button
                  onClick={() => setSelectedVerses([])}
                  className="text-muted-foreground hover:text-foreground font-medium p-1"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        ) : selectedBook ? (
          /* Seleção de capítulo */
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedBook(null)} className="gap-2 bg-white">
                <ChevronLeft size={14} /> Livros
              </Button>
              <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] dark:text-slate-100">
                {selectedBook.name}
              </h2>
            </div>

            {/* Versículos famosos */}
            {FAMOUS_VERSES[selectedBook.id] && (
              <div className="prayer-card p-5 mb-6 bg-white border border-border rounded-xl">
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

            <p className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] dark:text-slate-200 mb-3 uppercase tracking-wide">
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
          /* Telas de Livros / Favoritos / Busca */
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex border-b border-border/40 mb-6 gap-2">
              <button
                onClick={() => setActiveTab("books")}
                className={`px-4 py-2.5 border-b-2 font-display text-sm font-semibold transition-all ${
                  activeTab === "books"
                    ? "border-[oklch(0.22_0.07_260)] text-[oklch(0.22_0.07_260)] dark:text-slate-100"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Livros
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-4 py-2.5 border-b-2 font-display text-sm font-semibold transition-all ${
                  activeTab === "favorites"
                    ? "border-[oklch(0.22_0.07_260)] text-[oklch(0.22_0.07_260)] dark:text-slate-100"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Favoritos ({favorites.length})
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`px-4 py-2.5 border-b-2 font-display text-sm font-semibold transition-all ${
                  activeTab === "search"
                    ? "border-[oklch(0.22_0.07_260)] text-[oklch(0.22_0.07_260)] dark:text-slate-100"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Busca Global
              </button>
            </div>

            {/* 1. Tab Livros */}
            {activeTab === "books" && (
              <div className="animate-fade-in space-y-6">
                {/* Last Read Bookmark Card */}
                {bookmark && (
                  <div className="prayer-card p-4 border border-[oklch(0.75_0.12_75/0.3)] bg-white/60 backdrop-blur flex items-center justify-between gap-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bookmark className="text-[oklch(0.75_0.12_75)] flex-shrink-0" size={20} fill="currentColor" />
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Última Leitura</p>
                        <h4 className="font-display font-bold text-sm text-[oklch(0.22_0.07_260)]">
                          {bookmark.bookName} - Capítulo {bookmark.chapter}
                        </h4>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const book = BIBLE_BOOKS.find(b => b.id === bookmark.bookId);
                        if (book) {
                          setSelectedBook(book);
                          setSelectedChapter(bookmark.chapter);
                        }
                      }}
                      className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-white"
                    >
                      Continuar
                    </Button>
                  </div>
                )}

                {/* Busca Livro */}
                <div className="relative mb-6 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar livro..."
                    value={searchBookQuery}
                    onChange={(e) => setSearchBookQuery(e.target.value)}
                    className="pl-9 bg-white"
                  />
                  {searchBookQuery && (
                    <button onClick={() => setSearchBookQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Tabs Testamento */}
                <div className="flex gap-2">
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

                {/* Grid de Livros */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className="prayer-card p-4 text-left group bg-white border border-border hover:border-[oklch(0.75_0.12_75)] transition-all rounded-xl"
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
                    <p className="text-muted-foreground">Nenhum livro encontrado para "{searchBookQuery}"</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. Tab Favoritos */}
            {activeTab === "favorites" && (
              <div className="animate-fade-in space-y-4">
                {favorites.length === 0 ? (
                  <div className="text-center py-12 bg-white/50 border border-dashed rounded-2xl">
                    <Star size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground text-sm font-medium">Nenhum versículo favoritado ainda.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Toque nos versículos durante a leitura para favoritá-los.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favorites.map((fav, index) => (
                      <div
                        key={index}
                        className="bg-white border border-border rounded-xl p-4 flex justify-between gap-4 shadow-sm hover:border-[oklch(0.75_0.12_75)] transition-all duration-200"
                      >
                        <div
                          className="cursor-pointer flex-1"
                          onClick={() => {
                            const book = BIBLE_BOOKS.find(b => b.id === fav.bookId);
                            if (book) {
                              setSelectedBook(book);
                              setSelectedChapter(fav.chapter);
                            }
                          }}
                        >
                          <span className="text-xs font-bold text-[oklch(0.65_0.12_70)] uppercase tracking-wider font-display">
                            {fav.bookName} {fav.chapter}:{fav.verse}
                          </span>
                          <p className="font-serif italic text-sm mt-1 text-slate-800">
                            "{fav.text}"
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const updated = favorites.filter((_, i) => i !== index);
                            setFavorites(updated);
                            localStorage.setItem("sanctificare_bible_favorites", JSON.stringify(updated));
                            toast.success("Favorito removido!");
                          }}
                          className="text-muted-foreground hover:text-destructive self-start p-1 transition-colors"
                          title="Remover dos favoritos"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Tab Busca Global */}
            {activeTab === "search" && (
              <div className="animate-fade-in space-y-6">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar palavra ou frase em toda a Bíblia..."
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                      className="pl-9 bg-white"
                    />
                  </div>
                  <Button type="submit" className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.18_0.06_260)] text-white">
                    Pesquisar
                  </Button>
                </form>

                {isSearching ? (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 bg-white border border-border rounded-xl p-4" />
                    ))}
                  </div>
                ) : searchResults ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Foram encontradas {searchResults.length} ocorrências {searchResults.length >= 50 ? "(limite máximo exibido)" : ""}.
                    </p>

                    {searchResults.length === 0 ? (
                      <div className="text-center py-12 bg-white/50 border border-dashed rounded-2xl">
                        <BookOpen size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                        <p className="text-muted-foreground text-sm font-medium">Nenhum resultado encontrado.</p>
                      </div>
                    ) : (
                      searchResults.map((res, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            const book = BIBLE_BOOKS.find(b => b.id === res.bookId);
                            if (book) {
                              setSelectedBook(book);
                              setSelectedChapter(res.chapter);
                            }
                          }}
                          className="bg-white border border-border rounded-xl p-4 shadow-sm hover:border-[oklch(0.75_0.12_75)] hover:shadow cursor-pointer transition-all duration-200"
                        >
                          <span className="text-xs font-bold text-[oklch(0.65_0.12_70)] uppercase tracking-wider font-display">
                            {res.bookName} {res.chapter}:{res.verse}
                          </span>
                          <p className="font-sans text-sm mt-1 text-slate-800">
                            {res.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/30 border border-dashed rounded-2xl">
                    <Search size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground text-sm">Digite termos como "pastor", "amor", "luz" para pesquisar.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
