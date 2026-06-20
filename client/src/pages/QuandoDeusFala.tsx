import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Radio,
  BookOpen,
  Sparkles,
  PenLine,
  CheckCircle2,
  Lightbulb,
  Trash2,
} from "lucide-react";
import {
  DISCERNMENT_TOPICS,
  getDailyListening,
  type DiscernmentTopic,
} from "@/data/quando-deus-fala";

const LOGO_IMG = "/assets/sanctificare-logo.webp";
const JOURNAL_STORAGE_KEY = "sanctificare-quando-deus-fala-journal";

type JournalEntry = {
  id: string;
  createdAt: string;
  topicId: string;
  topicTitle: string;
  insight: string;
  nextStep: string;
};

function safeLoadJournal(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveJournal(entries: JournalEntry[]) {
  localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
}

export default function QuandoDeusFala() {
  const { isAuthenticated, loading } = useAuth();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const daily = useMemo(() => getDailyListening(), []);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(DISCERNMENT_TOPICS[0].id);
  const [insight, setInsight] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [journal, setJournal] = useState<JournalEntry[]>(() => safeLoadJournal());

  const selectedTopic: DiscernmentTopic =
    DISCERNMENT_TOPICS.find((topic) => topic.id === selectedTopicId) ?? DISCERNMENT_TOPICS[0];

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleRegisterListening = async () => {
    if (!isAuthenticated) return;
    try {
      await logPrayer.mutateAsync({
        prayerType: "quando_deus_fala",
        prayerName: "Quando Deus Fala - Escuta diária",
      });
      toast.success("Escuta registrada!", {
        description: "Permaneça atento à voz de Deus ao longo do dia.",
      });
    } catch {
      toast.error("Não foi possível registrar sua escuta agora.");
    }
  };

  const handleSaveEntry = () => {
    if (!insight.trim() || !nextStep.trim()) {
      toast.error("Preencha os dois campos para salvar no diário.");
      return;
    }

    const entry: JournalEntry = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      insight: insight.trim(),
      nextStep: nextStep.trim(),
    };

    const updated = [entry, ...journal].slice(0, 20);
    setJournal(updated);
    saveJournal(updated);
    setInsight("");
    setNextStep("");

    toast.success("Entrada salva no Diário das Inspirações.");
  };

  const handleDeleteEntry = (id: string) => {
    const updated = journal.filter((entry) => entry.id !== id);
    setJournal(updated);
    saveJournal(updated);
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
          <p className="text-muted-foreground mb-6">Entre para registrar sua escuta e discernimento diante de Deus.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Radio size={20} className="text-[oklch(0.65_0.14_70)]" />
              <span className="text-sm text-muted-foreground font-medium">Quando Deus Fala</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-1">
              Escuta e Discernimento
            </h1>
            <p className="font-serif text-muted-foreground capitalize">{today}</p>
          </div>

          <div className="mb-6 rounded-2xl bg-[oklch(0.22_0.07_260)] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-cross opacity-20" />
            <div className="relative">
              <p className="text-xs text-[oklch(0.65_0.12_70)] font-semibold uppercase tracking-widest mb-1">
                Escutar hoje
              </p>
              <p className="font-serif text-[oklch(0.95_0.01_80)] text-xl italic mb-3">
                {daily.question}
              </p>
              <div className="divider-gold mb-3 opacity-70" />
              <p className="text-[oklch(0.86_0.03_80)] text-sm mb-1">
                <span className="font-semibold">Palavra:</span> {daily.scripture}
              </p>
              <p className="text-[oklch(0.86_0.03_80)] text-sm mb-1">
                <span className="font-semibold">Invocação:</span> {daily.invocation}
              </p>
              <p className="text-[oklch(0.86_0.03_80)] text-sm">
                <span className="font-semibold">Passo concreto:</span> {daily.action}
              </p>
              <Button
                onClick={handleRegisterListening}
                disabled={logPrayer.isPending}
                className="mt-4 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold"
              >
                <CheckCircle2 size={15} className="mr-2" />
                {logPrayer.isPending ? "Registrando..." : "Marcar escuta de hoje"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="prayer-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-[oklch(0.65_0.12_70)]" />
                <h2 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)]">
                  Temas da vida
                </h2>
              </div>

              <div className="space-y-2 mb-4">
                {DISCERNMENT_TOPICS.map((topic) => {
                  const active = topic.id === selectedTopic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={
                        "w-full text-left rounded-xl border px-4 py-3 transition-colors " +
                        (active
                          ? "bg-[oklch(0.22_0.07_260)] text-white border-[oklch(0.22_0.07_260)]"
                          : "bg-white text-foreground border-[oklch(0.22_0.07_260/0.15)] hover:bg-[oklch(0.22_0.07_260/0.04)]")
                      }
                    >
                      <p className="font-display text-sm font-semibold">{topic.title}</p>
                      <p className={"text-xs mt-1 " + (active ? "text-[oklch(0.90_0.03_80)]" : "text-muted-foreground")}>{topic.hint}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-[oklch(0.22_0.07_260/0.15)] bg-[oklch(0.75_0.12_75/0.08)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={15} className="text-[oklch(0.65_0.12_70)]" />
                  <p className="text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)]">
                    {selectedTopic.scripture}
                  </p>
                </div>
                <p className="font-serif text-sm text-foreground mb-3">{selectedTopic.reflection}</p>
                <p className="font-serif text-sm italic text-[oklch(0.22_0.07_260)]">{selectedTopic.prayer}</p>
              </div>
            </div>

            <div className="prayer-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <PenLine size={18} className="text-[oklch(0.45_0.12_200)]" />
                <h2 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)]">
                  Diário das Inspirações
                </h2>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] block mb-1">
                    O que Deus me fez perceber hoje?
                  </label>
                  <textarea
                    value={insight}
                    onChange={(e) => setInsight(e.target.value)}
                    rows={3}
                    placeholder="Ex.: percebi que preciso voltar ao silêncio antes das decisões..."
                    className="w-full rounded-xl border border-[oklch(0.22_0.07_260/0.15)] bg-white p-3 text-sm font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-[oklch(0.75_0.12_75/0.4)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] block mb-1">
                    Qual próximo passo concreto?
                  </label>
                  <textarea
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    rows={2}
                    placeholder="Ex.: separar 10 minutos para oração em silêncio hoje às 22h."
                    className="w-full rounded-xl border border-[oklch(0.22_0.07_260/0.15)] bg-white p-3 text-sm font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-[oklch(0.75_0.12_75/0.4)]"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveEntry}
                className="w-full bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white"
              >
                <Sparkles size={15} className="mr-2" />
                Salvar no diário
              </Button>
            </div>
          </div>

          <div className="prayer-card p-6">
            <h3 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)] mb-4">
              Histórico recente
            </h3>

            {journal.length > 0 ? (
              <div className="space-y-3">
                {journal.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-[oklch(0.22_0.07_260/0.12)] bg-white p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)]">
                          {entry.topicTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Excluir entrada"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-foreground mb-2">
                      <span className="font-semibold">Inspiração:</span> {entry.insight}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Passo:</span> {entry.nextStep}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma entrada ainda. Comece registrando hoje aquilo que percebeu na presença de Deus.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
