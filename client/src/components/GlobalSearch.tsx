import * as React from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PRAYERS } from "@/data/prayers";
import { NOVENAS } from "@/data/novenas";
import { BIBLE_BOOKS, FAMOUS_VERSES } from "@/data/bible";
import { SACRED_MUSIC_COLLECTIONS } from "@/data/musica-sacra";
import { AUDIO_COLLECTIONS } from "@/data/audio-meditations";
import { BIBLE_VIDEOS } from "@/data/bible-videos";
import {
  BookOpen,
  Heart,
  CalendarCheck2,
  Music,
  Volume2,
  Film,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const handleOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-global-search", handleOpen);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-global-search", handleOpen);
    };
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    setLocation(url);
  };

  if (!isAuthenticated) return null;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Busca Global"
      description="Busque por orações, novenas, passagens bíblicas, áudios e vídeos..."
      className="border-border text-foreground"
    >
      <CommandInput
        placeholder="O que você deseja rezar ou escutar hoje?..."
        className="text-foreground placeholder:text-muted-foreground"
      />
      <CommandList className="max-h-[350px] overflow-y-auto text-foreground">
        <CommandEmpty className="text-muted-foreground py-6 text-sm">Nenhum resultado encontrado.</CommandEmpty>

        {/* Categoria: Orações */}
        <CommandGroup heading="Orações" className="[&_[cmdk-group-heading]]:text-[oklch(0.75_0.12_75)] [&_[cmdk-group-heading]]:font-semibold">
          {PRAYERS.map((prayer) => (
            <CommandItem
              key={prayer.id}
              value={`oração ${prayer.name} ${prayer.description}`}
              onSelect={() => handleSelect(`/oracoes?id=${prayer.id}`)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2 text-sm rounded-md data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10"
            >
              <Heart className="size-4 text-rose-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground truncate">{prayer.name}</span>
                <span className="text-[11px] text-muted-foreground truncate">{prayer.description}</span>
              </div>
              <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{prayer.duration}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Categoria: Novenas */}
        <CommandGroup heading="Novenas" className="[&_[cmdk-group-heading]]:text-[oklch(0.75_0.12_75)] [&_[cmdk-group-heading]]:font-semibold">
          {NOVENAS.map((novena) => (
            <CommandItem
              key={novena.id}
              value={`novena ${novena.name} ${novena.description} ${novena.subtitle}`}
              onSelect={() => handleSelect(`/novenas/${novena.slug}`)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2 text-sm rounded-md data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10"
            >
              <CalendarCheck2 className="size-4 text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground truncate">{novena.name}</span>
                <span className="text-[11px] text-muted-foreground truncate">{novena.description}</span>
              </div>
              <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{novena.duration}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Categoria: Bíblia (Livros) */}
        <CommandGroup heading="Bíblia Sagrada (Livros)" className="[&_[cmdk-group-heading]]:text-[oklch(0.75_0.12_75)] [&_[cmdk-group-heading]]:font-semibold">
          {BIBLE_BOOKS.map((book) => (
            <CommandItem
              key={book.id}
              value={`bíblia livro ${book.name} ${book.abbrev}`}
              onSelect={() => handleSelect(`/biblia?book=${book.id}`)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2 text-sm rounded-md data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10"
            >
              <BookOpen className="size-4 text-blue-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground truncate">{book.name} ({book.abbrev})</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {book.testament === "old" ? "Antigo Testamento" : "Novo Testamento"} • {book.chapters} capítulos
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Categoria: Versículos Famosos */}
        <CommandGroup heading="Versículos Famosos" className="[&_[cmdk-group-heading]]:text-[oklch(0.75_0.12_75)] [&_[cmdk-group-heading]]:font-semibold">
          {Object.entries(FAMOUS_VERSES).flatMap(([bookId, verses]) => {
            const book = BIBLE_BOOKS.find((b) => b.id === bookId);
            return verses.map((verseText, index) => (
              <CommandItem
                key={`${bookId}-verse-${index}`}
                value={`versículo famoso bíblia ${book?.name || ""} ${verseText}`}
                onSelect={() => handleSelect(`/biblia?book=${bookId}&chapter=${bookId === "jo" ? 3 : bookId === "sl" ? 23 : 5}`)}
                className="cursor-pointer flex items-center gap-3 px-3 py-2 text-sm rounded-md data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10"
              >
                <Sparkles className="size-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif italic text-foreground text-[13px] line-clamp-1">"{verseText}"</span>
                  <span className="text-[10px] text-muted-foreground">Ir para o capítulo destacado</span>
                </div>
              </CommandItem>
            ));
          })}
        </CommandGroup>

        {/* Categoria: Música Sacra */}
        <CommandGroup heading="Música Sacra" className="[&_[cmdk-group-heading]]:text-[oklch(0.75_0.12_75)] [&_[cmdk-group-heading]]:font-semibold">
          {SACRED_MUSIC_COLLECTIONS.flatMap((collection) =>
            collection.tracks.map((track) => (
              <CommandItem
                key={track.id}
                value={`música sacra playlist ${track.title} ${track.description} ${collection.title}`}
                onSelect={() => handleSelect(`/musica-sacra`)}
                className="cursor-pointer flex items-center gap-3 px-3 py-2 text-sm rounded-md data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10"
              >
                <Music className="size-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground truncate">{track.title}</span>
                  <span className="text-[11px] text-muted-foreground truncate">Coleção: {collection.title} • {track.description}</span>
                </div>
              </CommandItem>
            ))
          )}
        </CommandGroup>

        {/* Categoria: Meditações */}
        <CommandGroup heading="Meditações Guiadas & Histórias" className="[&_[cmdk-group-heading]]:text-[oklch(0.75_0.12_75)] [&_[cmdk-group-heading]]:font-semibold">
          {AUDIO_COLLECTIONS.flatMap((collection) =>
            collection.tracks.map((track) => (
              <CommandItem
                key={track.id}
                value={`meditação áudio história bíblia ${track.title} ${track.description} ${collection.title}`}
                onSelect={() => handleSelect(collection.kind === "bible-story" ? `/dashboard` : `/dashboard`)}
                className="cursor-pointer flex items-center gap-3 px-3 py-2 text-sm rounded-md data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10"
              >
                <Volume2 className="size-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground truncate">{track.title}</span>
                  <span className="text-[11px] text-muted-foreground truncate">Áudio • {collection.title} • {track.description}</span>
                </div>
              </CommandItem>
            ))
          )}
        </CommandGroup>

        {/* Categoria: Vídeos */}
        <CommandGroup heading="Vídeos Bíblicos" className="[&_[cmdk-group-heading]]:text-[oklch(0.75_0.12_75)] [&_[cmdk-group-heading]]:font-semibold">
          {BIBLE_VIDEOS.map((video) => (
            <CommandItem
              key={video.id}
              value={`vídeo bíblico reflexão ${video.title} ${video.description}`}
              onSelect={() => handleSelect(`/videos`)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2 text-sm rounded-md data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10"
            >
              <Film className="size-4 text-purple-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground truncate">{video.title}</span>
                <span className="text-[11px] text-muted-foreground truncate">{video.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
