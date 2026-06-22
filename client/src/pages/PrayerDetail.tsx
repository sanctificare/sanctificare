import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { allPrayers } from "@/data/prayersCatalog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Star,
  Share2,
  PlayCircle,
  PlusCircle,
  Volume2,
  Lock,
  Play,
} from "lucide-react";

export default function PrayerDetail() {
  const [, params] = useRoute("/oracao/:id");
  const [, setLocation] = useLocation();

  // Encontrar a oração selecionada no catálogo
  const prayerId = params?.id;
  const prayer = allPrayers.find((p) => p.id === prayerId);

  // Estado do modal de convite
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Se a oração não for encontrada, redirecionar para a LP ou 404
  if (!prayer) {
    return (
      <div className="min-h-screen bg-[oklch(0.12_0.03_260)] text-white flex flex-col justify-center items-center">
        <p className="font-serif text-lg text-neutral-400">Oração não encontrada.</p>
        <Link href="/" className="mt-4 text-xs text-[oklch(0.75_0.12_75)] hover:underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.03_260)] text-white relative pb-20 select-none overflow-x-hidden">
      {/* Background decorations matching the app's premium aesthetic */}
      <div className="absolute inset-0 bg-pattern-cross opacity-10 pointer-events-none" />

      {/* Header com botão de voltar */}
      <header className="relative z-20 container py-6 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[oklch(0.80_0.02_260)] hover:text-white transition-colors duration-200"
        >
          <ChevronLeft size={18} />
          Voltar ao início
        </Link>
      </header>

      {/* Cover visual & Blur background effect */}
      <div className="relative w-full h-[40vh] sm:h-[45vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-[10px] scale-105 opacity-30"
          style={{ backgroundImage: `url(${prayer.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260)] via-[oklch(0.12_0.03_260/0.8)] to-transparent" />

        {/* Center cover preview card */}
        <div className="relative z-10 w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-gold border border-[oklch(0.75_0.12_75/0.25)] bg-[oklch(0.18_0.05_260)]">
          <img
            src={prayer.cover}
            alt={prayer.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Details Container */}
      <main className="container max-w-4xl relative z-10 px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left / Top - Meta Details */}
          <div className="md:col-span-7 space-y-6 text-left">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide leading-tight">
              {prayer.title}
            </h1>



            {/* Play Button - Escutar de Graça */}
            <div className="pt-4">
              <Button
                onClick={() => setIsInviteOpen(true)}
                className="bg-white hover:bg-neutral-200 text-black font-display font-bold text-base px-8 py-7 rounded-full shadow-lg flex items-center gap-3 hover:scale-[1.03] active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                <Play size={18} fill="currentColor" className="text-black" />
                {prayer.id === "vela-virtual" ? "Entrar em Oração" : "Começar a Rezar"}
              </Button>
            </div>

            {/* Sub-actions with Icons */}
            <div className="flex gap-6 sm:gap-8 pt-6 border-t border-[oklch(0.75_0.12_75/0.1)] mt-8 justify-start">
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <Star size={18} />
                <span className="text-[9px] font-semibold uppercase tracking-wider">Favoritar</span>
              </button>

              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <Share2 size={18} />
                <span className="text-[9px] font-semibold uppercase tracking-wider">Compartilhar</span>
              </button>

              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <PlayCircle size={18} />
                <span className="text-[9px] font-semibold uppercase tracking-wider">A Seguir</span>
              </button>

              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                <PlusCircle size={18} />
                <span className="text-[9px] font-semibold uppercase tracking-wider">Adicionar Fila</span>
              </button>
            </div>
          </div>

          {/* Right / Bottom - Description */}
          <div className="md:col-span-5 text-left md:pt-14 space-y-4">
            <p className="font-serif text-base sm:text-lg text-[oklch(0.85_0.02_260)] leading-relaxed bg-[oklch(0.22_0.07_260/0.2)] border border-[oklch(0.75_0.12_75/0.05)] rounded-2xl p-6">
              {prayer.detailsDesc}
            </p>
          </div>
        </div>
      </main>

      {/* Player Invite Conversion Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="bg-[oklch(0.18_0.05_260)] border-[oklch(0.75_0.12_75/0.3)] text-white max-w-md rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-[oklch(0.75_0.12_75/0.1)] border border-[oklch(0.75_0.12_75/0.4)] flex items-center justify-center mb-3">
              <Lock size={22} className="text-[oklch(0.82_0.10_80)] animate-pulse" />
            </div>
            <DialogTitle className="font-display text-xl font-bold tracking-wide text-white">
              Acesso Gratuito Disponível
            </DialogTitle>
            <DialogDescription className="text-[oklch(0.80_0.02_260)] font-serif text-sm">
              Crie sua conta para ouvir a oração completa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4 text-center">
            <p className="text-sm text-[oklch(0.85_0.02_260)] font-serif leading-relaxed">
              Gostou do <strong>{prayer.title}</strong>? Crie sua conta gratuita em 30 segundos no Sanctificare para ouvir a oração inteira, escolher outros guias e registrar suas orações diárias.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={`/login?tab=cadastrar&preview=${prayer.id}`}
                className="block w-full"
              >
                <Button className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold py-5 rounded-xl shadow-gold transition-all hover:scale-[1.02]">
                  Criar Minha Conta Gratuita
                </Button>
              </a>
              <a
                href={`/login?tab=entrar&preview=${prayer.id}`}
                className="block w-full"
              >
                <Button
                  variant="outline"
                  className="w-full border-neutral-700 hover:bg-neutral-800 text-white font-bold py-5 rounded-xl transition-all"
                >
                  Já Tenho Conta (Entrar)
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
